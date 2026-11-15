import AdminHeader from "../admin-header";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminSignedIn } from "@/lib/nfc-http";
import { fanList, storageDescription } from "@/lib/nfc-db";
import FanTable from "../fan-table";
import styles from "../../nfc.module.css";

export const dynamic = "force-dynamic";

export default async function FanManagement() {
  if (!await adminSignedIn()) redirect("/nfc/admin");
  let rows;
  try { rows = await fanList(); } catch { return <><AdminHeader title="Manage fan list" /><p>Storage is temporarily unavailable.</p><Link className={styles.actionButton} href="/nfc/admin">Back to Diggy Dash</Link></>; }
  return <div className={styles.management}>
    <AdminHeader title="Manage fan list" />
    <nav className={styles.dashboardActions}>
      <Link className={styles.actionButton} href="/nfc/admin">Back to Diggy Dash</Link>
      <a className={styles.actionButton} href="/api/nfc/admin/export">Download fan list CSV</a>
    </nav>
    <p>{rows.filter(row => row.tag_id).length} tags · {rows.filter(row => row.email).length} signups</p>
    <p className={styles.note}>Stored in {storageDescription()}. Contact details are unverified; they do not establish tag ownership. Editing an email does not transfer the previous address’s consent to receive updates.</p>
    <FanTable rows={rows.map(row => ({tagId:row.tag_id || null,writtenAt:row.written_at ? new Date(row.written_at).toISOString() : null,fanId:row.fan_id || null,submittedAt:row.submitted_at ? new Date(row.submitted_at).toISOString() : null,name:row.name || "",email:row.email || "",instagram:row.instagram || ""}))} />
  </div>;
}
