"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteSignup({ tagId, fanId }: { tagId: string | null; fanId: string | null }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function remove() {
    if (!window.confirm(tagId ? "Delete this signup? This permanently removes the saved name, email and Instagram for this tag. The tag link stays active and can be used for a new signup." : "Delete this fan? This permanently removes their saved name, email and Instagram.")) return;
    setPending(true);
    try {
      const response = await fetch(tagId ? `/api/nfc/admin/tags/${tagId}/contact` : `/api/nfc/admin/fans/${fanId}`, { method: "DELETE" });
      if (response.ok) { router.refresh(); return; }
      const body = await response.json();
      setMessage(body.error || "Couldn’t delete the signup.");
    } catch { setMessage("Couldn’t connect. Please try again."); }
    setPending(false);
  }
  return <><button type="button" disabled={pending} onClick={remove}>{pending ? "Deleting…" : "Delete signup"}</button><span role="status">{message}</span></>;
}
