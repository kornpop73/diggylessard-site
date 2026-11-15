import type { Metadata } from "next";
import Link from "next/link";
import styles from "./privacy.module.css";

export const metadata: Metadata = { title: "Privacy | Diggy Lessard", description: "How Diggy Lessard’s website uses fan signup and administrator sign-in information." };

export default function PrivacyPage() {
  return <main className={styles.page}>
    <h1>Privacy</h1>
    <p>Updated November 15, 2026</p>
    <p>This notice covers Diggy Lessard’s website, NFC fan signup, song downloads, and Diggy Dash administration.</p>
    <h2>Fan information</h2>
    <p>When you sign up through an NFC link, we save your name, email address, optional Instagram handle, the signup date, the linked tag identifier, and the disclosure shown with your signup. These details help Diggy’s team manage its fan list and provide the song download. Approved administrators can also add or correct fan records manually. A manually added record does not itself record consent to receive email updates.</p>
    <p>The signup form asks you to agree to email updates about Diggy’s music and upcoming shows. The website currently sends no signup, invitation, or marketing emails automatically. To ask the team to stop using your contact details for updates, contact the address below.</p>
    <h2>Google administrator sign-in</h2>
    <p>Google sign-in is used for administrators, not fan signup. It provides basic identity information, including name, email address, email verification status, and profile image when available. We store administrator identity, Google account identifiers and authentication tokens, and session information to authenticate approved administrators and manage access. Session information may include IP address and browser information. The app requests only basic identity scopes: email, profile, and OpenID. It does not request access to Gmail messages, Drive files, or Calendar data.</p>
    <p>Only emails approved in Diggy Dash can access the dashboard. Removing approval revokes dashboard access and existing sessions.</p>
    <h2>Cookies and operational information</h2>
    <p>Essential cookies maintain administrator sessions and remember that a browser completed fan signup. Administrator sessions last up to eight hours; a signup download receipt lasts up to 24 hours. The receipt does not contain your name or email. Signup does not verify your identity or ownership of a tag.</p>
    <p>The website uses short-lived hashed request counters to limit repeated submissions. Hosting and authentication services may process request and security logs, including IP addresses and browser information. We have not added advertising trackers to this signup or download flow.</p>
    <h2>Storage and access</h2>
    <p>Vercel hosts the website and stores the shared song in private Vercel Blob storage. Neon stores fan records and administrator authentication data. Google processes administrator sign-in. These services process information to operate the website. Approved administrators can view, edit, delete, and export fan contact records; contact details are not shown to other fans or stored on the physical NFC tag.</p>
    <h2>Keeping and removing information</h2>
    <p>Fan records remain until removed by an administrator or in response to a request handled by the team. Session and download-receipt access expires as described above. Service logs, backups, and older private song uploads may remain separately under the services’ or team’s storage practices; deleting a dashboard record does not promise immediate removal from every backup or log.</p>
    <p>To request access to, correction of, or deletion of your information, or ask a privacy question, email <a href="mailto:silvir@2birds.studio">silvir@2birds.studio</a>, the contact listed on Diggy’s website. Include enough information to identify the relevant record; the team may need to confirm your request.</p>
    <h2>Other websites</h2>
    <p>Links to music, video, and social services lead to other websites with their own privacy practices.</p>
    <p><Link href="/">Visit Diggy’s website</Link></p>
  </main>;
}
