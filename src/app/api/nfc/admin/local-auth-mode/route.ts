import { json, localDemoAccess, sameOrigin, smallJson } from "@/lib/nfc-http";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !await localDemoAccess() || process.env.NFC_LOCAL_LOGIN_TEST !== "1") return json({ error: "Not found." }, 404);
  let input;
  try { input = await smallJson(request); } catch { return json({ error: "Invalid request." }, 400); }
  if (typeof input?.requireLogin !== "boolean") return json({ error: "Invalid mode." }, 400);
  const response = json({ok:true});
  response.cookies.set("diggy_local_require_login", input.requireLogin ? "1" : "", {httpOnly:true,sameSite:"strict",path:"/",maxAge:input.requireLogin?8*60*60:0});
  return response;
}
