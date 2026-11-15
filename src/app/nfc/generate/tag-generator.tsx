"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "../nfc.module.css";

export default function TagGenerator({ canManageAccounts = false }: { canManageAccounts?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [written, setWritten] = useState(false);
  const [marking, setMarking] = useState(false);
  async function generate() {
    setPending(true);
    setMessage("");
    const registered = fetch("/api/nfc/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).then(async response => {
      const body = await response.json();
      if (!response.ok || typeof body.url !== "string") throw new Error(body.error || "Couldn’t create a tag. Try again.");
      return body.url as string;
    });
    // Begin the clipboard request inside the click activation. Safari can await
    // the ClipboardItem data while registration finishes on the server.
    let autoCopy: Promise<boolean> | undefined;
    if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
      try {
        const content = registered.then(url => new Blob([url], { type: "text/plain" }));
        autoCopy = navigator.clipboard.write([new ClipboardItem({ "text/plain": content })]).then(() => true, () => false);
      } catch { /* The visible Copy link button remains available. */ }
    }
    try {
      const savedUrl = await registered;
      setUrl(savedUrl);
      setWritten(false);
      router.refresh();
      let copied = false;
      if (autoCopy) copied = await autoCopy;
      else {
        try { await navigator.clipboard.writeText(savedUrl); copied = true; } catch { /* Manual copy below. */ }
      }
      setMessage(copied ? "Tag created and saved. Link copied to clipboard." : "Tag created and saved. Tap Copy link or select the link to copy it manually.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t connect. No new tag has been confirmed saved."); }
    setPending(false);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(url); setMessage("Link copied. Paste it into your NFC-writing app."); }
    catch { setMessage("Copy was unavailable. Select the link above and copy it manually."); }
  }
  async function markWritten() {
    if (written || marking || pending || !window.confirm("Have you written this link to the physical NFC tag and tested it? Mark it as written only after completing that step.")) return;
    setMarking(true);
    try {
      const token = new URL(url).pathname.split("/").pop();
      const response = await fetch("/api/nfc/admin/tags",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,written:true})});
      const body = await response.json();
      if (response.ok) { setWritten(true); setMessage("Tag marked as written."); router.refresh(); }
      else setMessage(body.error || "Couldn’t mark the tag as written.");
    } catch { setMessage("Couldn’t connect. Written status has not been confirmed saved."); }
    setMarking(false);
  }
  return <>
    <p>Generate a unique link, copy it, then write it to one NFC tag using your phone’s NFC-writing app.</p>
    <div className={styles.dashboardActions}>
    <button className={styles.actionButton} type="button" disabled={pending || marking} onClick={generate}>{pending ? "Creating tag…" : "Create NFC tag"}</button>
    <Link className={styles.actionButton} href="/nfc/admin/download">Manage download page</Link>
    <Link className={styles.actionButton} href="/nfc/admin/fans">Manage fans</Link>
    {canManageAccounts && <Link className={styles.actionButton} href="/nfc/admin/accounts">Manage account access</Link>}
    </div>
    {url && <div><p><label htmlFor="tag-url">Your tag link</label></p>
      <input id="tag-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      <div className={styles.dashboardActions}>
        <button className={styles.actionButton} type="button" onClick={copy}>Copy link</button>
        <button className={styles.actionButton} type="button" disabled={written || marking || pending} onClick={markWritten}>{written ? "Written" : marking ? "Marking…" : "Mark as written"}</button>
      </div>
    </div>}
    <p role="status" aria-live="polite">{message}</p>
    <p className={styles.note}>Keep a copy of each link before creating the next tag. Phone clipboard access requires the HTTPS website. A localhost link won’t work on another phone.</p>
  </>;
}
