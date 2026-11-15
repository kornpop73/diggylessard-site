import "server-only";
import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";
import { localDemoAllowed } from "./nfc-core";

import { getAccessStore, getAdminAuth } from "./nfc-admin-auth";

export const privateHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders });
}

export async function localDemoAccess() {
  return localDemoAllowed({
    nodeEnv: process.env.NODE_ENV, vercel: process.env.VERCEL, vercelEnv: process.env.VERCEL_ENV,
    localDatabase: process.env.NFC_LOCAL_DATABASE, enabled: process.env.NFC_LOCAL_DEMO_ACCESS,
    host: (await headers()).get("host"),
  });
}

export async function demoBypassActive() {
  return await localDemoAccess() && (await cookies()).get("diggy_local_require_login")?.value !== "1";
}

export async function currentAdmin() {
  try {
    const store = await getAccessStore();
    if (await demoBypassActive()) {
      const email = process.env.NFC_LOCAL_ADMIN_EMAIL;
      return email ? await store.member(email) : null;
    }
    const auth = await getAdminAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.emailVerified) return null;
    return await store.member(session.user.email);
  } catch { return null; }
}

export async function adminSignedIn() { return Boolean(await currentAdmin()); }

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const source = new URL(origin);
    return source.host === request.headers.get("host") && source.protocol === new URL(request.url).protocol;
  } catch { return false; }
}

export async function smallJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Invalid content type");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty request");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4096) { await reader.cancel(); throw new Error("Request too large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
