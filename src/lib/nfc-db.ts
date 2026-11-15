import "server-only";
import { neon } from "@neondatabase/serverless";
import { createHmac, randomUUID } from "node:crypto";
import { tokenHash } from "./nfc-core";
import { DISCLOSURE, DISCLOSURE_VERSION } from "./nfc-copy";

type DbRow = Record<string, string> & { submitted?: boolean; active?: boolean };
type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<DbRow[]>;
const localState = globalThis as typeof globalThis & {
  nfcLocalDatabase?: Promise<import("@electric-sql/pglite").PGlite>;
  nfcLocalNameMigration?: Promise<unknown>;
  nfcLocalManualFanMigration?: Promise<unknown>;
  nfcLocalWrittenMigration?: Promise<unknown>;
};

export function storageDescription() {
  return !process.env.VERCEL && process.env.NFC_LOCAL_DATABASE
    ? "the local test database on this computer"
    : "Diggy’s private diggy-nfc-fans Neon database in AWS US East (Northern Virginia)";
}

export function database(): Query {
  if (process.env.VERCEL_ENV === "preview") throw new Error("NFC storage is disabled in previews");
  if (!process.env.VERCEL && process.env.NFC_LOCAL_DATABASE) {
    const path = process.env.NFC_LOCAL_DATABASE;
    localState.nfcLocalDatabase ??= import("@electric-sql/pglite").then(({ PGlite }) => new PGlite(path));
    return async (strings, ...values) => {
      const db = await localState.nfcLocalDatabase!;
      localState.nfcLocalNameMigration ??= db.exec(`ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS name text CHECK (name IS NULL OR length(name) BETWEEN 1 AND 100); ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS updated_at timestamptz; ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS updates_consent boolean NOT NULL DEFAULT true;`);
      await localState.nfcLocalNameMigration;
      localState.nfcLocalManualFanMigration ??= db.exec(`
-- Give every fan its own identity; a tag is optional for manually added fans.
ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_id_unique ON nfc_fans(id);
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_tag_unique ON nfc_fans(tag_id);
ALTER TABLE nfc_fans DROP CONSTRAINT IF EXISTS nfc_fans_pkey;
ALTER TABLE nfc_fans ALTER COLUMN tag_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_manual_email_unique ON nfc_fans(lower(email)) WHERE tag_id IS NULL;
`);
      await localState.nfcLocalManualFanMigration;
      localState.nfcLocalWrittenMigration ??= db.exec("ALTER TABLE nfc_tags ADD COLUMN IF NOT EXISTS written_at timestamptz");
      await localState.nfcLocalWrittenMigration;
      const query = strings.reduce((text, part, index) => text + (index ? `$${index}` : "") + part, "");
      const result = await db.query(query, values);
      return result.rows as DbRow[];
    };
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("NFC storage is not configured");
  return neon(url) as Query;
}

export async function registerTag(token: string) {
  const sql = database();
  const rows = await sql`INSERT INTO nfc_tags (id, token_hash)
    VALUES (${randomUUID()}, ${tokenHash(token)})
    ON CONFLICT (token_hash) DO NOTHING RETURNING id`;
  return rows.length > 0;
}

export async function tagStatus(token: string): Promise<"new" | "submitted" | "unregistered" | "inactive"> {
  const sql = database();
  const rows = await sql`SELECT t.active, EXISTS(SELECT 1 FROM nfc_fans f WHERE f.tag_id = t.id) AS submitted
    FROM nfc_tags t WHERE t.token_hash = ${tokenHash(token)}`;
  if (!rows.length) return "unregistered";
  if (!rows[0].active) return "inactive";
  return rows[0].submitted ? "submitted" : "new";
}

export async function saveContact(token: string, name: string, email: string, instagram: string | null) {
  const sql = database();
  const rows = await sql`WITH eligible AS (
    SELECT id FROM nfc_tags WHERE token_hash = ${tokenHash(token)} AND active = true FOR SHARE
    ) INSERT INTO nfc_fans (tag_id, name, email, instagram, disclosure, disclosure_version)
    SELECT id, ${name}, ${email}, ${instagram}, ${DISCLOSURE}, ${DISCLOSURE_VERSION} FROM eligible
    WHERE true
    ON CONFLICT (tag_id) DO NOTHING RETURNING tag_id`;
  return rows.length > 0;
}

export async function rateLimit(request: Request, scope: string, maximum: number) {
  const secret = process.env.NFC_AUTH_SECRET || process.env.NFC_ADMIN_PASSWORD;
  if (!secret || secret.length < 32) throw new Error("NFC admin is not configured");
  // Vercel sets x-real-ip; locally all callers share a bucket. Never store raw IPs.
  const ip = process.env.VERCEL ? request.headers.get("x-real-ip") || "unknown" : "local";
  const now = Date.now();
  const window = Math.floor(now / (15 * 60 * 1000));
  const digest = createHmac("sha256", secret).update(`${scope}:${ip}:${window}`).digest("hex");
  const sql = database();
  await sql`DELETE FROM nfc_rate_limits WHERE expires_at < now()`;
  const rows = await sql`INSERT INTO nfc_rate_limits (bucket, expires_at)
    VALUES (${digest}, ${new Date((window + 1) * 15 * 60 * 1000).toISOString()})
    ON CONFLICT (bucket) DO UPDATE SET attempts = nfc_rate_limits.attempts + 1
    RETURNING attempts`;
  return Number(rows[0].attempts) <= maximum;
}

export async function fanList() {
  const sql = database();
  return sql`SELECT t.id AS tag_id, f.id AS fan_id, t.active, t.written_at, COALESCE(t.created_at, f.submitted_at) AS created_at,
    f.name, f.email, f.instagram, f.submitted_at, f.updated_at, f.updates_consent, f.disclosure_version, f.email_verified
    FROM nfc_tags t FULL OUTER JOIN nfc_fans f ON f.tag_id = t.id
    ORDER BY COALESCE(f.submitted_at, t.created_at) DESC`;
}

export async function deleteSignup(id: string) {
  const sql = database();
  const rows = await sql`DELETE FROM nfc_fans WHERE tag_id = ${id} RETURNING tag_id`;
  return rows.length > 0;
}

export async function editSignup(id: string, field: "name" | "email" | "instagram", value: string | null) {
  const sql = database();
  const rows = await sql`UPDATE nfc_fans SET
    name = CASE WHEN ${field} = 'name' THEN ${value} ELSE name END,
    email = CASE WHEN ${field} = 'email' THEN ${value} ELSE email END,
    instagram = CASE WHEN ${field} = 'instagram' THEN ${value} ELSE instagram END,
    updates_consent = CASE WHEN ${field} = 'email' AND email IS DISTINCT FROM ${value} THEN false ELSE updates_consent END,
    updated_at = now() WHERE tag_id = ${id} RETURNING tag_id`;
  return rows.length > 0;
}

export async function deleteEmptyTag(id: string) {
  const sql = database();
  const rows = await sql`DELETE FROM nfc_tags t WHERE t.id = ${id}
    AND NOT EXISTS (SELECT 1 FROM nfc_fans f WHERE f.tag_id = t.id) RETURNING t.id`;
  return rows.length > 0;
}

export async function exportFans() {
  const sql = database();
  return sql`SELECT f.name, f.email, f.instagram, f.submitted_at
    FROM nfc_fans f
    ORDER BY f.submitted_at DESC`;
}

export async function addManualFan(name: string, email: string, instagram: string | null) {
  const sql = database();
  const rows = await sql`INSERT INTO nfc_fans (name,email,instagram,disclosure,disclosure_version,updates_consent)
    SELECT ${name},${email},${instagram},'Added manually by an admin; no signup consent recorded.','admin-manual-v1',false
    WHERE NOT EXISTS (SELECT 1 FROM nfc_fans WHERE lower(email) = ${email})
    ON CONFLICT DO NOTHING RETURNING id`;
  return rows[0]?.id || null;
}
export async function deleteManualFan(id: string) {
  const sql = database();
  return (await sql`DELETE FROM nfc_fans WHERE id = ${id} AND tag_id IS NULL RETURNING id`).length > 0;
}
export async function editManualFan(id: string, field: "name" | "email" | "instagram", value: string | null) {
  const sql = database();
  return (await sql`UPDATE nfc_fans SET
    name = CASE WHEN ${field} = 'name' THEN ${value} ELSE name END,
    email = CASE WHEN ${field} = 'email' THEN ${value} ELSE email END,
    instagram = CASE WHEN ${field} = 'instagram' THEN ${value} ELSE instagram END,
    updated_at = now()
    WHERE id = ${id} AND tag_id IS NULL
    AND (${field} <> 'email' OR NOT EXISTS (SELECT 1 FROM nfc_fans other WHERE other.id <> ${id} AND lower(other.email) = ${value}))
    RETURNING id`).length > 0;
}

export async function markTagWritten(token: string) {
  const sql = database();
  const rows = await sql`UPDATE nfc_tags SET written_at = COALESCE(written_at, now())
    WHERE token_hash = ${tokenHash(token)} RETURNING written_at`;
  return rows[0]?.written_at || null;
}
