import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "../nfc.module.css";

export default async function TagPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();

  return <>
    <h1>You made it.</h1>
    <p>Your NFC link opened the Diggy Lessard pilot page.</p>
    <p>Tag token:</p>
    <p className={styles.token}>{token}</p>
    <p className={styles.note}>This confirms the link opened. Tag registration, fan accounts, and music downloads come later.</p>
    <Link href="/">Visit Diggy’s website</Link>
  </>;
}
