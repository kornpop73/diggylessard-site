import { activateBlobSong, songStorageEnabled } from "@/lib/nfc-song";
import { adminSignedIn, json, sameOrigin, smallJson } from "@/lib/nfc-http";
export async function POST(request:Request) {
  if(!sameOrigin(request))return json({error:"Invalid request origin."},403);
  if(!await adminSignedIn())return json({error:"Admin access required."},401);
  if(!songStorageEnabled())return json({error:"Song storage unavailable."},503);
  try {
    const input=await smallJson(request);
    if(typeof input?.url!=="string"||typeof input?.name!=="string"||input.name.length>300)return json({error:"Invalid upload."},400);
    return json({ok:true,song:await activateBlobSong(input.url,input.name)});
  }catch{return json({error:"Couldn’t activate the song. Choose a valid MP3 or WAV up to 25 MB."},400);}
}
