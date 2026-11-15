import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before migrating.");
const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/nfc.sql", import.meta.url), "utf8");
await sql.transaction(schema.split(";").map((part) => part.trim()).filter(Boolean).map((part) => sql.query(part)));
console.log("NFC schema applied. No fan records created.");
