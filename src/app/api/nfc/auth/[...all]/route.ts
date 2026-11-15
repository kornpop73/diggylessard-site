import { getAdminAuth } from "@/lib/nfc-admin-auth";
import { json, sameOrigin } from "@/lib/nfc-http";

async function handle(request: Request) {
  const path = new URL(request.url).pathname;
  // Expose only Google callback and sign-out. Password registration, public
  // enrollment, profile edits and direct sign-in requests are not mounted.
  const allowed = request.method === "GET" && path === "/api/nfc/auth/callback/google"
    || request.method === "POST" && path === "/api/nfc/auth/sign-out";
  if (!allowed) return json({ error: "Not found." }, 404);
  if (request.method === "POST" && !sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    const response = await (await getAdminAuth()).handler(request);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch { return json({ error: "Sign-in is temporarily unavailable." }, 503); }
}
export const GET = handle;
export const POST = handle;
