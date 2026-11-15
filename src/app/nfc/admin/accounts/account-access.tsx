"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../nfc.module.css";

export default function AccountAccess({ accounts }: { accounts: { email: string }[] }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function change(email: string, remove: boolean) {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/nfc/admin/accounts", {method:remove ? "DELETE" : "POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
      const body = await response.json();
      if (response.ok) { setMessage(remove ? "Access removed. Existing sessions were revoked." : "Admin account added. No email was sent."); router.refresh(); }
      else setMessage(body.error || "Couldn’t update access.");
    } catch { setMessage("Couldn’t connect. Please try again."); }
    setPending(false);
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await change(String(new FormData(event.currentTarget).get("email")),false);
  }
  return <>
    <form onSubmit={add}>
      <h2>Add account</h2>
      <label htmlFor="account-email">Email</label><input id="account-email" name="email" type="email" autoComplete="off" maxLength={254} required />
      <button type="submit" disabled={pending}>Add account</button>
    </form>
    <p role="status" aria-live="polite">{message}</p>
    <h2 className={styles.accountSectionTitle}>Approved admin emails</h2>
    <div className={styles.tableWrap}><table className={styles.accountTable}><thead><tr><th>Email</th><th>Action</th></tr></thead><tbody>
      {accounts.map(account => <tr key={account.email}>
        <td>{account.email}</td>
        <td><button type="button" disabled={pending} onClick={()=>{ if(window.confirm(`Remove admin access for ${account.email}? Existing sessions will be revoked.`)) void change(account.email,true); }}>Remove access</button></td>
      </tr>)}
    </tbody></table></div>
  </>;
}
