"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AddFan() {
  const [pending,setPending] = useState(false);
  const [error,setError] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true); setError("");
    try {
      const response = await fetch("/api/nfc/admin/fans",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:values.get("name"),email:values.get("email"),instagram:values.get("instagram")})});
      const result = await response.json();
      if (response.ok) { form.reset(); router.refresh(); }
      else setError(result.error || "Couldn’t add the fan.");
    } catch { setError("Couldn’t connect. Try again."); }
    setPending(false);
  }
  return <tr>
    <td data-label="Name"><input form="add-fan" name="name" aria-label="New fan name" required maxLength={100} autoComplete="name" disabled={pending} /></td>
    <td data-label="Email"><input form="add-fan" name="email" aria-label="New fan email" type="email" required maxLength={254} autoComplete="email" disabled={pending} /></td>
    <td data-label="Instagram"><input form="add-fan" name="instagram" aria-label="New fan Instagram (optional)" maxLength={31} disabled={pending} /></td>
    <td data-label="Status">Active</td>
    <td data-label="Sign-up date">—</td>
    <td data-label="Tag ID">None</td>
    <td data-label="Actions"><form id="add-fan" onSubmit={submit}><button type="submit" aria-label="Add signup" disabled={pending}>{pending ? "Adding…" : "Add signup"}</button>{error && <p role="alert">{error}</p>}</form></td>
  </tr>;
}
