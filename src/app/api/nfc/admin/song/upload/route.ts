import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { adminSignedIn, json, sameOrigin, smallJson } from "@/lib/nfc-http";
import { MAX_SONG_BYTES, songStorageEnabled } from "@/lib/nfc-song";
import { rateLimit } from "@/lib/nfc-db";
export async function POST(request:Request) {
  if(!sameOrigin(request))return json({error:"Invalid request origin."},403);
  if(!await adminSignedIn())return json({error:"Admin access required."},401);
  if(!songStorageEnabled())return json({error:"Song storage unavailable."},503);
  try {
    const body=await smallJson(request) as HandleUploadBody;
    const result=await handleUpload({request,body,onBeforeGenerateToken:async pathname=>{
      if(!/^songs\/[a-f0-9-]{36}\/[^/]+\.(wav|mp3)$/i.test(pathname))throw new Error("Choose an MP3 or WAV file.");
      if(!await rateLimit(request,"admin-upload",20))throw new Error("Too many uploads. Try later.");
      return {allowedContentTypes:["audio/wav","audio/mpeg"],maximumSizeInBytes:MAX_SONG_BYTES,addRandomSuffix:true,validUntil:Date.now()+15*60*1000};
    }});
    return json(result);
  }catch{return json({error:"Couldn’t authorize the upload."},400);}
}
