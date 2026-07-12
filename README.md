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