import { getAdminAuth, googleConfigured } from "@/lib/nfc-admin-auth";
import { json, sameOrigin } from "@/lib/nfc-http";
import { rateLimit } from "@/lib/nfc-db";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!googleConfigured()) return json({ error: "Google sign-in is not configured yet. The site needs a Google OAuth client ID and client secret." }, 503);
  try {
    if (!await rateLimit(request, "admin-google", 20)) return json({error:"Too many attempts. Please try again later."},429);
    const response = await (await getAdminAuth()).api.signInSocial({ headers: request.headers, body: {
      provider: "google", callbackURL: new URL("/nfc/admin", process.env.NFC_AUTH_BASE_URL).href,
      errorCallbackURL: new URL("/nfc/admin/sign-in?error=signin", process.env.NFC_AUTH_BASE_URL).href,
      disableRedirect: true,
    }, asResponse: true });
    response.headers.set("Cache-Control","private, no-store");
    return response;
  } catch { return json({ error: "Couldn’t start Google sign-in. Please try again later." }, 503); }
}
