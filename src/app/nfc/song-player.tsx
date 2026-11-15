import Link from "next/link";
import { songFilename, songTitle, type SongInfo } from "@/lib/nfc-song";
import styles from "./nfc.module.css";
export default function SongPlayer({info,source}:{info:SongInfo;source:string}) {
  return <section className={styles.songPlayer}>
    <h3>{songTitle(info)}</h3>
    <audio controls preload="metadata" src={`${source}?play=1`} aria-label={`Listen to ${songTitle(info)}`} />
    <div className={styles.actions}><a className={styles.actionButton} href={source} download={songFilename(info)}>Download song</a><Link className={styles.actionButton} href="/">Visit Diggy’s website</Link></div>
  </section>;
}
