import { localDemoAccess } from "@/lib/nfc-http";
import { googleConfigured } from "@/lib/nfc-admin-auth";
import { AdminLogin } from "../admin-controls";
import styles from "../../nfc.module.css";

export const dynamic = "force-dynamic";

export default async function AdminSignIn() {
  const preview = await localDemoAccess() && process.env.NFC_LOCAL_LOGIN_TEST === "1";
  return <div className={styles.signIn}>
    <h1>Sign in to Diggy Dash</h1>
    <AdminLogin configured={googleConfigured()} localTest={preview} />
  </div>;
}
