import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSignedIn } from "@/lib/nfc-http";
import { songStorageEnabled, sharedSong } from "@/lib/nfc-song";
import SongPlayer from "../../../song-player";
import styles from "../../../nfc.module.css";
export const metadata: Metadata = { title: "Diggy Lessard" };
export const dynamic="force-dynamic";
export default async function DownloadPreview() {
  if(!await adminSignedIn())redirect("/nfc/admin/sign-in");
  const song=songStorageEnabled()?await sharedSong(false):null;
  return <div className={styles.downloadPreview}><h1>You made it.</h1><h2>You’re on the list.</h2>
    {song?<SongPlayer info={song.info} source="/api/nfc/admin/song" />:<p>No song has been added yet.</p>}
    <p><Link className={styles.actionButton} href="/nfc/admin/download">Back to Manage download page</Link></p>
  </div>;
}
