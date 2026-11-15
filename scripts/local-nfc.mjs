import { PGlite } from "@electric-sql/pglite";
import { readFile, writeFile, chmod, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

const path = resolve(".nfc-local-data/preview");
await mkdir(path, { recursive: true, mode: 0o700 });
await chmod(resolve(".nfc-local-data"), 0o700);
await chmod(path, 0o700);
const db = new PGlite(path);
await db.exec(await readFile(new URL("../db/nfc.sql", import.meta.url), "utf8"));
await db.close();
let env = await readFile(".env.local", "utf8").catch(() => "");
if (!/^NFC_ADMIN_PASSWORD=/m.test(env)) env += `\nNFC_ADMIN_PASSWORD=${randomBytes(32).toString("hex")}\n`;
env = env.replace(/^NFC_LOCAL_DATABASE=.*\n?/gm, "") + `\nNFC_LOCAL_DATABASE=${JSON.stringify(path)}\n`;
await writeFile(".env.local", env);
await chmod(".env.local", 0o600);
console.log("Local NFC test database initialized. Admin password is in ignored .env.local. Run npm run dev -- --port 3150.");
