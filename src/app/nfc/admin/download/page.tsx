import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSignedIn } from "@/lib/nfc-http";
import { localSongEnabled, songStorageEnabled, sharedSong } from "@/lib/nfc-song";
import AdminHeader from "../admin-header";
import SongUpload from "./song-upload";
import styles from "../../nfc.module.css";
export const dynamic="force-dynamic";
export default async function DownloadManagement() {
  if(!await adminSignedIn())redirect("/nfc/admin/sign-in");
  const enabled=songStorageEnabled();
  const song=enabled?await sharedSong(false):null;
  return <div className={styles.management}>
    <AdminHeader title="Manage download page" />
    {enabled ? <><p>One shared song for all NFC tags. Fans can download after signing up.</p>
      <SongUpload currentName={song?.info.name || null} directUpload={!localSongEnabled()} />
    </> : <><p>Song storage is unavailable.</p><Link className={styles.actionButton} href="/nfc/admin">Back to Diggy Dash</Link></>}
  </div>;
}
