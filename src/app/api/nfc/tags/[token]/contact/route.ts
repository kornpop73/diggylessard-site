import { createReceipt, receiptCookie } from "@/lib/nfc-song";
import { contactInput, validToken } from "@/lib/nfc-core";
import { rateLimit, saveContact } from "@/lib/nfc-db";
import { json, sameOrigin, smallJson } from "@/lib/nfc-http";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const { token } = await params;
  if (!validToken(token)) return json({ error: "Invalid tag link." }, 404);
  let input;
  try { input = await smallJson(request); } catch { return json({ error: "Invalid request." }, 400); }
  const contact = contactInput(input);
  if (!contact || input.acceptUpdates !== true) return json({ error: "Enter your name, a valid email and, optionally, an Instagram handle (up to 30 letters, numbers, periods or underscores)." }, 400);
  try {
    if (!await rateLimit(request, "contact", 30)) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
    const saved = await saveContact(token, contact.name, contact.email, contact.instagram);
    if (!saved) return json({ error: "This tag cannot accept a new signup. Existing details have not been changed." }, 409);
    const response = json({ ok: true });
    response.cookies.set(receiptCookie(token),createReceipt(token),{httpOnly:true,sameSite:"lax",secure:new URL(request.url).protocol === "https:",path:"/",maxAge:24*60*60});
    return response;
  } catch { return json({ error: "We couldn’t save your details. Please try again later." }, 503); }
}
