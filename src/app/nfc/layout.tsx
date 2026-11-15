import type { Metadata } from "next";
import styles from "./nfc.module.css";

export const metadata: Metadata = {
  title: "Diggy Lessard",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function NfcLayout({ children }: { children: React.ReactNode }) {
  return <main className={styles.page}><section className={styles.card}>
    <p className={styles.eyebrow}>DIGGY LESSARD</p>
    {children}
  </section></main>;
}
