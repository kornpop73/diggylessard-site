# Diggy Lessard Website

Official website for **Diggy Lessard**.

Built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**, and deployed on **Vercel**.

---

# Design Philosophy

This website is intentionally minimal.

The homepage should remain focused on four elements:

- Diggy Lessard logo
- Cinematic full-screen background image
- Music & social links
- Booking email

The artwork should be the primary focus. Avoid unnecessary text, sections, or visual clutter.

---

# Project Structure

```text
public/
├── fonts/
│   └── README.md
├── images/
│   ├── DiggyLessard_Title.png
│   └── main_background.png

src/
└── app/
    ├── globals.css
    ├── layout.tsx
    └── page.tsx
```

---

# Images

## Logo

The title uses artwork rather than live text.

```
public/images/DiggyLessard_Title.png
```

Do **not** replace the logo with the future custom font.

## Background

```
public/images/main_background.png
```

Used as the full-screen landing page background.

---

# Custom Font

The website has been prepared for a future custom typeface designed by **Julep**.

Font files should be placed in:

```text
public/fonts/
```

The CSS already contains placeholders for the future `@font-face` declaration and font variables.

Once the font is available, only the font files and CSS variable should need updating.

---

# Editing Social Links

Music and social links are defined in:

```text
src/app/page.tsx
```

Current active platforms:

- Spotify
- YouTube
- Instagram

Future platforms (Apple Music, Tidal, SoundCloud, etc.) should remain visible but non-clickable until official accounts exist.

---

# Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# Validation

Before committing changes always run:

```bash
npm run lint
npm run build
```

---

# Deployment

The project is configured for deployment on **Vercel**.

Recommended settings:

- Framework: Next.js
- Install Command:
  ```bash
  npm install
  ```
- Build Command:
  ```bash
  npm run build
  ```
- Output Directory:
  Managed automatically by Next.js

Deployments should be triggered through the GitHub repository whenever possible.

---

# Future Ideas

Potential future additions include:

- Music page
- Tour dates
- Biography
- Press kit
- Merchandise
- Newsletter signup
- Contact form
- Embedded Spotify player
- Custom Julep font
- Subtle page transitions and animations

Any future additions should preserve the site's clean, cinematic aesthetic.


## Diggy Dash and fan downloads

- Admin sign-in: `/nfc/admin/sign-in`. Google accounts require verified email plus current membership in `nfc_admin_access`. Every admin has equal access; the final admin cannot be removed. Account removal revokes existing sessions. Password and public registration endpoints are disabled.
- Dashboard: `/nfc/admin`. Create unique registered tag links, copy them, and explicitly mark physical tags Written after writing/testing. Tag status is Created for an unwritten tag without signup, Pending once written without signup, and Active when a fan signup exists (regardless of written state). Manual fan records show No tag. Writing remains informational and does not grant download access.
- Fans: `/nfc/admin/fans`. Fan sign-up is the default view; Awaiting sign-up contains pending tags. Inline edits require Enter/confirmation. Signup deletion preserves a linked tag; tag deletion applies only to empty tags. The top Add signup row creates manual fan records without a tag (Tag ID None). Duplicate manual additions are rejected; CSV exports fan contacts only. No invitation or marketing email is sent.
- Music: `/nfc/admin/download`. One shared MP3/WAV up to 25 MB, private Vercel Blob in production; browser uploads go directly to private storage using short-lived admin-authorized tokens, then the server validates and activates the file. Metadata is in private Neon `nfc_song`. Downloads and native audio playback pass through gated streaming endpoints with safe original filenames and byte-range support. Previous private uploaded blobs are retained when replacing the active song.
- Fan signup at `/nfc/[token]` requires Name/Email, optional Instagram, and records the displayed update disclosure. A completed signup unlocks the tag link on any browser or device without cookies. Anyone holding that submitted-tag link can play/download the shared song, but cannot read or overwrite fan details. Deleting the signup returns the tag to Pending and removes download access; deleting an empty tag invalidates the link. This is contact signup gating, not verified ownership, verified email, or DRM.

Production uses canonical `https://www.diggylessard.com`; NFC routes on alternate aliases redirect there. Google callback: `/api/nfc/auth/callback/google`. Required production secrets: `DATABASE_URL`, `NFC_AUTH_SECRET`, `NFC_AUTH_BASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BLOB_READ_WRITE_TOKEN`, `NFC_SONG_BLOB_HOST`. Database schemas are `db/nfc.sql` and `db/admin-auth.sql`; private tables enable RLS and revoke PUBLIC access. Credentials never belong in public browser variables.

Local development remains at `http://127.0.0.1:3150`, with isolated ignored PGlite stores and private song storage under `.nfc-local-data/`. Explicit local demo access is restricted to development, loopback Host, a local DB, and no Vercel environment. Google sign-out disables that browser's demo bypass. No local fan/tag data is automatically copied to production. Vercel preview environments fail closed until a separate database/storage setup is configured.

Validation: `npm run lint`, `npm run test:nfc`, `npm run build`.
