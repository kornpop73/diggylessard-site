import { currentAdmin, json, sameOrigin, smallJson } from "@/lib/nfc-http";
import { getAccessStore } from "@/lib/nfc-admin-auth";
import { adminEmail } from "@/lib/admin-access";

export async function GET() {
  const actor = await currentAdmin();
  if (!actor) return json({ error: "Admin access required." }, 403);
  try { return json({ accounts: await (await getAccessStore()).list() }); }
  catch { return json({ error: "Account access is temporarily unavailable." }, 503); }
}

async function change(request: Request, remove: boolean) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const actor = await currentAdmin();
  if (!actor) return json({ error: "Admin access required." }, 403);
  let input;
  try { input = await smallJson(request); } catch { return json({ error: "Invalid request." }, 400); }
  const email = adminEmail(input?.email);
  if (!email) return json({ error: "Enter a valid email." }, 400);
  try {
    await (await getAccessStore()).change(actor.email, email, !remove);
    return json({ ok: true });
  } catch (error) {
    const known = error instanceof Error && /^(Keep at least one admin|Admin access required|Account not found)/.test(error.message);
    return json({ error: known ? error.message : "Couldn’t update account access. Please try again." }, known ? 409 : 503);
  }
}

export async function POST(request: Request) { return change(request, false); }
export async function DELETE(request: Request) { return change(request, true); }
