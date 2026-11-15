import { adminSignedIn, json, sameOrigin } from "@/lib/nfc-http";
import { localSongEnabled, MAX_SONG_BYTES, saveSharedSong, songStorageEnabled, sharedSong, songResponse } from "@/lib/nfc-song";

export async function POST(request:Request) {
  if (!sameOrigin(request)) return json({error:"Invalid request origin."},403);
  if (!await adminSignedIn()) return json({error:"Admin access required."},401);
  if (!localSongEnabled()) return json({error:"Song upload is available in the local test only."},503);
  const reader = request.body?.getReader();
  if(!reader) return json({error:"Choose an MP3 or WAV file."},400);
  const chunks:Uint8Array[]=[]; let size=0;
  while(true) {
    const item=await reader.read(); if(item.done) break;
    size+=item.value.byteLength;
    if(size>MAX_SONG_BYTES+65536) {await reader.cancel();return json({error:"Choose a file up to 25 MB."},413);}
    chunks.push(item.value);
  }
  let file;
  try {
    const form=await new Request(request.url,{method:"POST",headers:{"Content-Type":request.headers.get("Content-Type") || ""},body:Buffer.concat(chunks)}).formData();
    file=form.get("song");
  } catch {return json({error:"Choose an MP3 or WAV file."},400);}
  if(!(file instanceof File)) return json({error:"Choose an MP3 or WAV file."},400);
  try {return json({ok:true,song:await saveSharedSong(file)});}
  catch(error) {return json({error:error instanceof Error && /Choose/.test(error.message)?error.message:"Couldn’t save the song. Try again."},400);}
}
export async function GET(request:Request) {
  if (!await adminSignedIn()) return json({error:"Admin access required."},401);
  if (!songStorageEnabled()) return json({error:"Song preview is available in the local test only."},503);
  const song=await sharedSong();
  if(!song)return json({error:"No song has been added yet."},404);
  return songResponse(request,song);
}
