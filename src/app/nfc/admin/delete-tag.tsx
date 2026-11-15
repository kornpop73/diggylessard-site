"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTag({ tagId }: { tagId: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function remove() {
    if (!window.confirm("Delete this tag? Its link will stop accepting signup and cannot be used again unless registered again. The physical NFC tag will still contain the old URL. Tags with a saved signup cannot be deleted here.")) return;
    setPending(true); setMessage("");
    try {
      const response = await fetch(`/api/nfc/admin/tags/${tagId}`, { method: "DELETE" });
      const body = await response.json();
      if (response.ok) { router.refresh(); return; }
      setMessage(body.error || "Couldn’t delete the tag.");
    } catch { setMessage("Couldn’t connect. Please try again."); }
    setPending(false);
  }
  return <><button type="button" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete tag"}</button><p role="status" aria-live="polite">{message}</p></>;
}
