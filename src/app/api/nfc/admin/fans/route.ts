import { contactInput } from "@/lib/nfc-core";
import { addManualFan, rateLimit } from "@/lib/nfc-db";
import { adminSignedIn, json, sameOrigin, smallJson } from "@/lib/nfc-http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({error:"Invalid request origin."},403);
  if (!await adminSignedIn()) return json({error:"Admin access required."},401);
  let input;
  try { input = contactInput(await smallJson(request)); } catch { return json({error:"Invalid request."},400); }
  if (!input) return json({error:"Enter a name, valid email, and optional Instagram handle."},400);
  try {
    if (!await rateLimit(request,"admin-add-fan",30)) return json({error:"Too many attempts. Try again later."},429);
    const id = await addManualFan(input.name,input.email,input.instagram);
    return id ? json({ok:true,id},201) : json({error:"A fan with this email already exists."},409);
  } catch { return json({error:"Couldn’t add the fan. Try again."},503); }
}
