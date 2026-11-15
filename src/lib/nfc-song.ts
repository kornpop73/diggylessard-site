import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { get, head } from "@vercel/blob";
import { database } from "./nfc-db";

export const MAX_SONG_BYTES = 25 * 1024 * 1024;
export function localSongEnabled() {
  return process.env.NODE_ENV === "development" && !process.env.VERCEL && !process.env.VERCEL_ENV && Boolean(process.env.NFC_LOCAL_DATABASE);
}
export function songStorageEnabled() { return localSongEnabled() || (process.env.VERCEL_ENV === "production" && Boolean(process.env.BLOB_READ_WRITE_TOKEN)); }
function location() {
  if (!localSongEnabled()) throw new Error("Song storage is available in the local test only.");
  return resolve(".nfc-local-data/song");
}
export type SongInfo = {name:string;type:string;extension:string;size:number;updatedAt:string};
export async function sharedSong(withData = true): Promise<{info:SongInfo;data:Buffer} | null> {
  if (!localSongEnabled()) {
    if (!songStorageEnabled()) return null;
    const sql = database();
    const rows = await sql`SELECT blob_url, info FROM nfc_song WHERE singleton = true`;
    if (!rows[0]) return null;
    const info = rows[0].info as unknown as SongInfo;
    if (!withData) return {info,data:Buffer.alloc(0)};
    const result = await get(rows[0].blob_url,{access:"private"});
    if (!result || result.statusCode !== 200) throw new Error("Song is temporarily unavailable.");
    return {info,data:Buffer.from(await new Response(result.stream).arrayBuffer())};
  }
  try {
    const buffer = await readFile(join(location(),"current.song"));
    const split = buffer.indexOf(10);
    if (split < 0) throw new Error("Invalid song metadata");
    return {info:JSON.parse(buffer.subarray(0,split).toString()),data:buffer.subarray(split+1)};
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
export async function songFileInfo(file: File) {
  if (!file.size || file.size > MAX_SONG_BYTES) throw new Error("Choose an MP3 or WAV file up to 25 MB.");
  const data = Buffer.from(await file.arrayBuffer());
  const extension = file.name.toLowerCase().split(".").pop();
  const wav = extension === "wav" && data.length >= 44 && data.toString("ascii",0,4) === "RIFF" && data.toString("ascii",8,12) === "WAVE";
  const mp3 = extension === "mp3" && data.length >= 10 && (data.toString("ascii",0,3) === "ID3" || (data[0] === 255 && (data[1] & 224) === 224 && (data[1] & 6) !== 0));
  if (!wav && !mp3) throw new Error("Choose a valid MP3 or WAV file.");
  const info:SongInfo = {name:file.name.replace(/[\/\\\u0000-\u001f\u007f]/g,"").slice(0,180) || "Song",type:wav?"audio/wav":"audio/mpeg",extension:wav?"wav":"mp3",size:data.length,updatedAt:new Date().toISOString()};
  return {info,data};
}
export async function saveSharedSong(file: File) {
  const {info,data} = await songFileInfo(file);
  const directory = location();
  await mkdir(directory,{recursive:true,mode:0o700});
  const temporary = join(directory,randomUUID()+".tmp");
  try {
    await writeFile(temporary,Buffer.concat([Buffer.from(JSON.stringify(info)+"\n"),data]),{mode:0o600,flag:"wx"});
    await rename(temporary,join(directory,"current.song"));
  } finally { await unlink(temporary).catch(()=>{}); }
  return info;
}
export function songFilename(info: SongInfo) {
  const basename = info.name.split(/[\\/]/).pop() || "Song";
  const stem = basename.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\.(mp3|wav)$/i, "").trim().slice(0,160) || "Song";
  return `${stem}.${info.extension === "wav" ? "wav" : "mp3"}`;
}
export function songTitle(info: SongInfo) { return songFilename(info).replace(/\.(mp3|wav)$/i, ""); }
export function songResponse(request: Request, song: {info:SongInfo;data:Buffer}) {
  const filename = songFilename(song.info);
  const ascii = filename.replace(/[^\x20-\x7e]|["\\]/g, "_");
  const encoded = encodeURIComponent(filename).replace(/[!'()*]/g,char=>`%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  const inline = new URL(request.url).searchParams.get("play") === "1";
  const headers = new Headers({"Content-Type":song.info.type,"Content-Disposition":`${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encoded}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Accept-Ranges":"bytes"});
  const length = song.data.length;
  const range = request.headers.get("range");
  if(range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if(!match || (!match[1] && !match[2])) {headers.set("Content-Range",`bytes */${length}`);return new Response(null,{status:416,headers});}
    const start = match[1] ? Number(match[1]) : Math.max(0,length-Number(match[2]));
    const end = match[1] ? (match[2] ? Math.min(Number(match[2]),length-1) : length-1) : length-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start> end||start>=length) {headers.set("Content-Range",`bytes */${length}`);return new Response(null,{status:416,headers});}
    headers.set("Content-Range",`bytes ${start}-${end}/${length}`);headers.set("Content-Length",String(end-start+1));
    return new Response(new Blob([new Uint8Array(song.data.subarray(start,end+1))]).stream(),{status:206,headers});
  }
  headers.set("Content-Length",String(length));
  return new Response(new Blob([new Uint8Array(song.data)]).stream(),{headers});
}

export async function activateBlobSong(url: string, name: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== process.env.NFC_SONG_BLOB_HOST || !parsed.pathname.startsWith("/songs/") || parsed.search || parsed.hash) throw new Error("Invalid song upload.");
  const metadata = await head(url);
  if(metadata.size > MAX_SONG_BYTES || metadata.size < 10) throw new Error("Choose a file up to 25 MB.");
  const result = await get(url,{access:"private"});
  if(!result || result.statusCode !== 200) throw new Error("Upload unavailable.");
  const {info} = await songFileInfo(new File([await new Response(result.stream).arrayBuffer()],name));
  const sql = database();
  await sql`INSERT INTO nfc_song(singleton,blob_url,info) VALUES(true,${url},${JSON.stringify(info)}::jsonb)
    ON CONFLICT(singleton) DO UPDATE SET blob_url=excluded.blob_url,info=excluded.info,updated_at=now()`;
  return info;
}
