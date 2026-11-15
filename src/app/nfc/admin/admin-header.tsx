import { headers } from "next/headers";
import { getAdminAuth } from "@/lib/nfc-admin-auth";
import { AdminLogout } from "./admin-controls";
import styles from "../nfc.module.css";

export default async function AdminHeader({ title }: { title: string }) {
  let email: string | undefined;
  try { email = (await (await getAdminAuth()).api.getSession({headers:await headers()}))?.user.email; } catch {}
  return <header className={styles.adminHeader}>
    <div><h1>{title}</h1><p className={styles.note}>{email ? `Signed in as ${email}` : "Local demo access"}</p></div>
    <AdminLogout />
  </header>;
}
