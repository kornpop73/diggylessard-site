# Diggy Lessard Custom Font

This folder is reserved for the future Diggy Lessard custom typeface created by Julep.

## Expected files

```
DiggyLessard-Regular.woff2
DiggyLessard-Regular.woff
```

If additional weights or styles are created, use:

```
DiggyLessard-Bold.woff2
DiggyLessard-Italic.woff2
...
```

## After adding the font

1. Uncomment the `@font-face` block in `src/app/globals.css`.
2. Verify the file names match.
3. Change:

```css
--font-display: "Diggy", system-ui, sans-serif;
```

4. Run:

```bash
npm run lint
npm run build
```

## Notes

- Keep the logo (`DiggyLessard_Title.png`) as artwork.
- The custom font is intended for navigation, links, headings, buttons, and future page content—not as a replacement for the logo.