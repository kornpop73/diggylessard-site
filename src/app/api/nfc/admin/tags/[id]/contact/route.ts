import { contactFieldInput } from "@/lib/nfc-core";
import { deleteSignup, editSignup } from "@/lib/nfc-db";
import { adminSignedIn, json, sameOrigin, smallJson } from "@/lib/nfc-http";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!await adminSignedIn()) return json({ error: "Admin access required." }, 401);
  const { id } = await params;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return json({ error: "Invalid tag ID." }, 400);
  try {
    if (!await deleteSignup(id)) return json({ error: "No signup was found. Refresh the list." }, 404);
    return json({ ok: true });
  } catch { return json({ error: "Couldn’t delete the signup. Please try again." }, 503); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!await adminSignedIn()) return json({ error: "Admin access required." }, 401);
  const { id } = await params;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return json({ error: "Invalid tag ID." }, 400);
  let input;
  try { input = contactFieldInput(await smallJson(request)); } catch { return json({ error: "Invalid request." }, 400); }
  if (!input) return json({ error: "Enter a valid name, email, or Instagram handle for this field." }, 400);
  try {
    if (!await editSignup(id, input.field, input.value)) return json({ error: "Signup not found. Refresh the list." }, 404);
    return json({ ok: true });
  } catch { return json({ error: "Couldn’t save the edit. Please try again." }, 503); }
}
