import { cookies } from "next/headers";
import { validToken } from "@/lib/nfc-core";
import { tagStatus } from "@/lib/nfc-db";
import { json } from "@/lib/nfc-http";
import { songStorageEnabled, receiptCookie, sharedSong, songResponse, validReceipt } from "@/lib/nfc-song";

export async function GET(request:Request,{params}:{params:Promise<{token:string}>}) {
  const {token}=await params;
  if(!validToken(token))return json({error:"Invalid tag link."},404);
  if(!validReceipt(token,(await cookies()).get(receiptCookie(token))?.value))return json({error:"Complete signup in this browser to download the song."},403);
  if(!songStorageEnabled())return json({error:"Song downloads are available in the local test only."},503);
  try {
    if(await tagStatus(token)!=="submitted")return json({error:"Signup is required."},403);
    const song=await sharedSong();
    if(!song)return json({error:"No song has been added yet."},404);
    return songResponse(request,song);
  }catch{return json({error:"Download is temporarily unavailable."},503);}
}
