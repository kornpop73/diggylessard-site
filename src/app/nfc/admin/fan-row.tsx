"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tagStatusLabel } from "@/lib/nfc-tag-status";
import DeleteTag from "./delete-tag";
import DeleteSignup from "./delete-signup";
import styles from "../nfc.module.css";

type Field = "name" | "email" | "instagram";
const labels = { name: "Name", email: "Email", instagram: "Instagram" };

export default function FanRow({ row }: { row: { tagId: string | null; fanId: string | null; writtenAt: string | null; submittedAt: string | null; name: string; email: string; instagram: string } }) {
  const [editing, setEditing] = useState<Field | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const triggers = useRef<Partial<Record<Field, HTMLButtonElement | null>>>({});
  const lastEdited = useRef<Field | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (editing) { input.current?.focus(); input.current?.select(); }
    else if (lastEdited.current) triggers.current[lastEdited.current]?.focus();
  }, [editing]);
  function begin(field: Field) { lastEdited.current = field; setDraft(row[field]); setMessage(""); setEditing(field); }
  function cancel() { if (!pending) { setEditing(null); setMessage(""); } }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || pending) return;
    if (!window.confirm(`Apply this change to ${labels[editing].toLowerCase()}?\n\n${draft.trim() || "(empty)"}\n\nCancel keeps the existing value.`)) { cancel(); return; }
    setPending(true);
    setMessage("Saving…");
    try {
      const response = await fetch(row.tagId ? `/api/nfc/admin/tags/${row.tagId}/contact` : `/api/nfc/admin/fans/${row.fanId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ field: editing, value: draft }) });
      const body = await response.json();
      if (response.ok) { setEditing(null); setMessage("Saved."); router.refresh(); }
      else setMessage(body.error || "Couldn’t save the change.");
    } catch { setMessage("Couldn’t connect. Your change has not been confirmed saved."); }
    setPending(false);
  }
  return <tr>
    {(["name", "email", "instagram"] as Field[]).map(field => <td key={field} data-label={labels[field]}>
      {!row.email ? "—" : editing === field ? <form onSubmit={save}>
        <input ref={input} aria-label={labels[field]} type={field === "email" ? "email" : "text"} value={draft} onChange={event=>setDraft(event.target.value)} enterKeyHint="done" aria-describedby={`edit-hint-${row.fanId || row.tagId}`} maxLength={field === "name" ? 100 : field === "email" ? 254 : 31} required={field !== "instagram"} disabled={pending} onKeyDown={event=>{ if (event.key === "Escape") { event.preventDefault(); cancel(); } }} />
      </form> : <button ref={element=>{ triggers.current[field] = element; }} className={styles.inlineValue} type="button" onClick={()=>begin(field)} aria-label={`Change ${labels[field].toLowerCase()}: ${row[field] || "not set"}`}>{field === "instagram" && row[field] ? `@${row[field]}` : row[field] || `Add ${labels[field].toLowerCase()}`}</button>}
    </td>)}
    <td data-label="Tag status">{tagStatusLabel(row)}</td>
    <td data-label="Sign-up date">{row.submittedAt ? new Date(row.submittedAt).toLocaleString("en-US", {timeZone:"America/New_York",dateStyle:"medium",timeStyle:"short"}) : "Pending"}</td>
    <td data-label="Tag ID">{row.tagId || "None"}</td>
    <td data-label="Actions">{editing && <p id={`edit-hint-${row.fanId || row.tagId}`} className={styles.note}>Enter to review · Escape to discard</p>}<p role="status" aria-live="polite">{message}</p>{row.email ? <DeleteSignup tagId={row.tagId} fanId={row.fanId} /> : <DeleteTag tagId={row.tagId!} />}</td>
  </tr>;
}
