"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DISCLOSURE } from "@/lib/nfc-copy";
import styles from "../nfc.module.css";

export default function ContactForm({ token, storage }: { token: string; storage: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/nfc/tags/${token}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), instagram: form.get("instagram"), acceptUpdates: true }) });
      const body = await response.json();
      if (response.ok) { setSaved(true); router.refresh(); }
      else setMessage(body.error || "Couldn’t save your details. Please try again.");
    } catch { setMessage("Couldn’t connect. Your details have not been confirmed saved. Please try again."); }
    setPending(false);
  }
  if (saved) return <div role="status"><h2>You’re on the list.</h2><p>Your details have been saved for Diggy’s team. Thanks for joining.</p><a className={styles.actionButton} href={`/nfc/${token}`}>Continue to song</a></div>;
  return <form onSubmit={submit}>
    <label htmlFor="name">Name</label>
    <input id="name" name="name" type="text" autoComplete="given-name" maxLength={100} required />
    <label htmlFor="email">Email</label>
    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required aria-describedby="signup-disclosure signup-storage" />
    <p id="signup-disclosure" className={styles.note}>{DISCLOSURE}</p>
    <label htmlFor="instagram">Instagram handle <span className={styles.note}>(optional)</span></label>
    <input id="instagram" name="instagram" type="text" autoComplete="off" placeholder="@yourhandle" maxLength={31} pattern="@?[A-Za-z0-9_.]{1,30}" />
    <p id="signup-storage" className={styles.note}>Your name, email and optional Instagram handle are saved with this tag’s record in {storage}. They are not stored on the NFC tag or shown to other visitors.</p>
    <button type="submit" disabled={pending}>{pending ? "Saving…" : "Sign up for updates"}</button>
    <p role="status" aria-live="polite">{message}</p>
  </form>;
}
