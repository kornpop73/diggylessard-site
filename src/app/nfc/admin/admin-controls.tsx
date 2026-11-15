"use client";

import { useState } from "react";
import styles from "../nfc.module.css";

export function AdminLogin({ configured = false, localTest = false }: { configured?: boolean; localTest?: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/nfc/admin/google", {method:"POST"});
      const body = await response.json();
      if (response.ok && typeof body.url === "string") {
        if (localTest) {
          const mode = await fetch("/api/nfc/admin/local-auth-mode", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({requireLogin:true})});
          if (!mode.ok) throw new Error("Local sign-in mode failed");
        }
        window.location.href = body.url; return;
      }
      setMessage(body.error || "Couldn’t start Google sign-in.");
    } catch { setMessage("Couldn’t connect. Please try again."); }
    setPending(false);
  }
  return <>
    <div className={styles.actions}>
    <button type="button" disabled={pending || !configured} onClick={signIn}>{pending ? "Opening Google…" : "Continue with Google"}</button>
    </div>
    {message && <p role="status" aria-live="polite">{message}</p>}
  </>;
}

export function AdminLogout() {
  const [message, setMessage] = useState("");
  async function logout() {
    try {
      const response = await fetch("/api/nfc/admin/session", { method: "DELETE" });
      if (response.ok) window.location.href = "/nfc/admin/sign-in";
      else setMessage("Couldn’t sign out. Try again.");
    } catch { setMessage("Couldn’t connect. Try again."); }
  }
  return <><button type="button" onClick={logout}>Sign out</button><p role="status">{message}</p></>;
}
