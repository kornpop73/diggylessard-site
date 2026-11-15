"use client";

import { useState } from "react";
import styles from "../nfc.module.css";

export default function GenerateTag() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  function generate() {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const token = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setUrl(new URL(`/nfc/${token}`, window.location.origin).href);
    setMessage("New link ready. Copy and save it before generating another.");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied. Paste it into your NFC-writing app.");
    } catch {
      setMessage("Copy was unavailable. Select the link above and copy it manually.");
    }
  }

  return <>
    <h1>Make a tag link.</h1>
    <p>Generate a unique link, copy it, then write it to one NFC tag using your phone’s NFC-writing app.</p>
    <button type="button" onClick={generate}>Generate a new link</button>
    {url && <div>
      <p><label htmlFor="tag-url">Your tag link</label></p>
      <input id="tag-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      <div className={styles.actions}>
        <button type="button" onClick={copy}>Copy link</button>
        <a href={url} target="_blank" rel="noreferrer">Open test page</a>
      </div>
    </div>}
    <p role="status" aria-live="polite">{message}</p>
    <p className={styles.note}>Pilot only: links are not saved here, and anyone with a link can open it. Generate on the website address you plan to test on; a localhost link will not work on another phone.</p>
  </>;
}
