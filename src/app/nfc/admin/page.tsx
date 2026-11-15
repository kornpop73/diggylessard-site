import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/nfc-http";
import { storageDescription } from "@/lib/nfc-db";
import AdminHeader from "./admin-header";
import TagGenerator from "../generate/tag-generator";
import styles from "../nfc.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const principal = await currentAdmin();
  if (!principal) redirect("/nfc/admin/sign-in");
  return <div className={styles.dashboardWide}>
    <AdminHeader title="Diggy Dash" />
    <TagGenerator canManageAccounts />
    <p className={styles.note}>Fan details are stored in {storageDescription()}. The NFC tag holds only its link. Fan signups do not send email.</p>
  </div>;
}
