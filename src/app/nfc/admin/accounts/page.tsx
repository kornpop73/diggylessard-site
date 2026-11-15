import AdminHeader from "../admin-header";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin, localDemoAccess } from "@/lib/nfc-http";
import { getAccessStore, googleConfigured } from "@/lib/nfc-admin-auth";
import AccountAccess from "./account-access";
import styles from "../../nfc.module.css";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  if (!await currentAdmin()) redirect("/nfc/admin");
  const accounts = await (await getAccessStore()).list();
  const local = await localDemoAccess();
  return <div className={styles.management}>
    <AdminHeader title="Manage account access" />
    <nav className={styles.dashboardActions}><Link className={styles.actionButton} href="/nfc/admin">Back to Diggy Dash</Link></nav>
    <p>Admin accounts</p>
    <p>Approved admins can manage account access, create tags, manage fans and download the fan list. Fan signups do not grant dashboard access.</p>
    {local && <p className={styles.note}>Local demo: these accounts are saved on this computer only. Adding an account does not send an email.</p>}
    {!googleConfigured() && <p className={styles.note}>Google sign-in is not configured yet. Local demo access remains available.</p>}
    <AccountAccess accounts={accounts.map(account => ({email:account.email}))} />
  </div>;
}
