import { randomBytes } from "node:crypto";
import { validToken } from "@/lib/nfc-core";
import { markTagWritten, registerTag } from "@/lib/nfc-db";
import { adminSignedIn, json, sameOrigin, smallJson } from "@/lib/nfc-http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!await adminSignedIn()) return json({ error: "Admin sign-in required." }, 401);
  const origin = request.headers.get("origin")!;
  let input;
  try { input = await smallJson(request); } catch { return json({ error: "Invalid request." }, 400); }
  let token: string;
  if (input?.legacyUrl !== undefined) {
    try {
      const url = new URL(input.legacyUrl);
      if (url.origin !== origin) throw new Error("Different website");
      token = url.pathname.replace(/^\/nfc\//, "");
      if (!validToken(token) || url.search || url.hash) throw new Error("Invalid tag URL");
    } catch { return json({ error: "Paste an existing NFC link from this website." }, 400); }
  } else {
    token = randomBytes(32).toString("hex");
  }
  try {
    const created = await registerTag(token);
    return json({ url: new URL(`/nfc/${token}`, origin).href, created });
  } catch { return json({ error: "Could not register the tag. No new link was issued. Please try again." }, 503); }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return json({error:"Invalid request origin."},403);
  if (!await adminSignedIn()) return json({error:"Admin sign-in required."},401);
  let input;
  try { input = await smallJson(request); } catch { return json({error:"Invalid request."},400); }
  if (typeof input?.token !== "string" || !validToken(input.token) || input.written !== true) return json({error:"Confirm a valid tag was written."},400);
  try {
    const writtenAt = await markTagWritten(input.token);
    return writtenAt ? json({ok:true,writtenAt}) : json({error:"Tag not found."},404);
  } catch { return json({error:"Couldn’t mark the tag as written. Try again."},503); }
}
