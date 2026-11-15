import Link from "next/link";
import { songStorageEnabled, sharedSong } from "@/lib/nfc-song";
import styles from "../nfc.module.css";
import SongPlayer from "../song-player";
export default async function SongDownload({token}:{token:string}) {
  const song=songStorageEnabled()?await sharedSong(false):null;
  return <section><h2>You’re on the list.</h2>{song?<SongPlayer info={song.info} source={`/api/nfc/tags/${token}/download`} />:<><p>No song has been added yet. Your signup is saved.</p><Link className={styles.actionButton} href="/">Visit Diggy’s website</Link></>}</section>;
}
