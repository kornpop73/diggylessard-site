"use client";
import Link from "next/link";
import styles from "../../nfc.module.css";
import { upload } from "@vercel/blob/client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export default function SongUpload({currentName,directUpload=false}:{currentName:string|null;directUpload?:boolean}) {
  const [pending,setPending]=useState(false); const [message,setMessage]=useState(""); const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=event.currentTarget;
    const data=new FormData(form);const file=data.get("song");
    if(!(file instanceof File)||!file.size||file.size>25*1024*1024){setMessage("Choose an MP3 or WAV file up to 25 MB.");return;}
    setPending(true);setMessage("");
    try {
      let response;
      if(directUpload) {
        const safeName=file.name.replace(/[\\/\u0000-\u001f\u007f]/g, "").slice(-180);
        const blob=await upload(`songs/${crypto.randomUUID()}/${safeName}`,file,{access:"private",handleUploadUrl:"/api/nfc/admin/song/upload",contentType:file.name.toLowerCase().endsWith(".wav")?"audio/wav":"audio/mpeg"});
        response=await fetch("/api/nfc/admin/song/complete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:blob.url,name:file.name})});
      } else response=await fetch("/api/nfc/admin/song",{method:"POST",body:data});
      const result=await response.json();
      if(response.ok){form.reset();setMessage("Song saved. All tags now use this song.");router.refresh();}else setMessage(result.error || "Couldn’t upload the song.");
    }catch{setMessage("Couldn’t connect. Try again.");}setPending(false);
  }
  return <form onSubmit={submit}><p>{currentName?`Current song: ${currentName}`:"No song uploaded."}</p>
    <label htmlFor="song">Song (MP3 or WAV, up to 25 MB)</label><input id="song" name="song" type="file" accept=".mp3,.wav,audio/mpeg,audio/wav" required disabled={pending} />
    <div className={styles.dashboardActions}>
      <Link className={styles.actionButton} href="/nfc/admin">Back to Diggy Dash</Link>
      <button className={styles.actionButton} disabled={pending} type="submit">{pending?"Uploading…":currentName?"Replace song":"Upload song"}</button>
      <Link className={styles.actionButton} href="/nfc/admin/download/preview">Preview download page</Link>
    </div>
    {message&&<p role="status">{message}</p>}
  </form>;
}
