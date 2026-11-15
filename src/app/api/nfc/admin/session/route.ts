import { getAdminAuth } from "@/lib/nfc-admin-auth";
import { NextResponse } from "next/server";
import { json, localDemoAccess, sameOrigin } from "@/lib/nfc-http";

export async function POST() { return json({ error: "Use Google sign-in." }, 410); }

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  try {
    const result = await (await getAdminAuth()).api.signOut({ headers: request.headers, asResponse: true });
    const response = new NextResponse(result.body, {status:result.status, headers:result.headers});
    response.headers.set("Cache-Control", "private, no-store");
    if (result.ok && await localDemoAccess()) response.cookies.set("diggy_local_require_login", "1", {httpOnly:true,sameSite:"strict",path:"/",maxAge:8*60*60});
    return response;
  } catch { return json({ error: "Sign-out is temporarily unavailable." }, 503); }
}
