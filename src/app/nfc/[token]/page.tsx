import SongDownload from "./song-download";
import { notFound } from "next/navigation";
import Link from "next/link";
import { validToken } from "@/lib/nfc-core";
import { storageDescription, tagStatus } from "@/lib/nfc-db";
import ContactForm from "./contact-form";
import styles from "../nfc.module.css";

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!validToken(token)) notFound();
  let status;
  try { status = await tagStatus(token); } catch { status = "unavailable"; }
  const entitled = status === "submitted";
  return <div className={entitled ? styles.downloadPreview : undefined}>
    <h1>You made it.</h1>
    {entitled ? <SongDownload token={token} /> : status === "new" ? <><p>Stay in touch with Diggy.</p><ContactForm token={token} storage={storageDescription()} /></> :
      status === "inactive" ? <p>This tag is inactive. Please contact Diggy’s team.</p> :
      status === "unregistered" ? <p>Your NFC link works. This tag is not ready for signup yet; ask Diggy’s team to register its existing link.</p> :
      <p>Signup is temporarily unavailable. Please try again later.</p>}
    {!entitled && <Link className={styles.actionButton} href="/">Visit Diggy’s website</Link>}
  </div>;
}
