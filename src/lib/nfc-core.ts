import { createHash } from "node:crypto";

export function validToken(token: string) {
  return /^[a-f0-9]{64}$/.test(token);
}

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function contactInput(value: unknown): { name: string; email: string; instagram: string | null } | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (typeof input.name !== "string" || typeof input.email !== "string" || typeof input.instagram !== "string") return null;
  const name = input.name.trim();
  if (!name || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) return null;
  const email = input.email.trim().toLowerCase();
  const instagram = input.instagram.trim().replace(/^@/, "");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (instagram && !/^[A-Za-z0-9_.]{1,30}$/.test(instagram)) return null;
  return { name, email, instagram: instagram || null };
}

export function csvCell(value: unknown) {
  let text = value === null || value === undefined ? "" : String(value);
  // Spreadsheet programs must treat user-entered fields as text, never formulas.
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function localDemoAllowed(config: { nodeEnv?: string; vercel?: string; vercelEnv?: string; localDatabase?: string; enabled?: string; host: string | null }) {
  if (config.nodeEnv !== "development" || config.vercel || config.vercelEnv || !config.localDatabase || config.enabled !== "1" || !config.host) return false;
  try {
    const host = new URL(`http://${config.host}`).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch { return false; }
}

export function contactFieldInput(input: unknown): { field: "name" | "email" | "instagram"; value: string | null } | null {
  if (!input || typeof input !== "object") return null;
  const { field, value } = input as Record<string, unknown>;
  if (typeof value !== "string") return null;
  if (field === "name") {
    const name = value.trim();
    return name && name.length <= 100 && !/[\u0000-\u001f\u007f]/.test(name) ? {field, value: name} : null;
  }
  if (field === "email") {
    const contact = contactInput({ name: "validation", email: value, instagram: "" });
    return contact ? {field, value: contact.email} : null;
  }
  if (field === "instagram") {
    const contact = contactInput({ name: "validation", email: "validation@example.invalid", instagram: value });
    return contact ? {field, value: contact.instagram} : null;
  }
  return null;
}

export function fanCsv(rows: Record<string, unknown>[]) {
  const fans = rows.filter(row => typeof row.email === "string" && row.email.trim());
  const header = ["Name", "Email", "Instagram", "Sign-up date"].map(csvCell).join(",");
  const lines = fans.map(row => {
    const date = row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at;
    return [row.name, row.email, row.instagram, date].map(csvCell).join(",");
  });
  return [header, ...lines].join("\r\n");
}
