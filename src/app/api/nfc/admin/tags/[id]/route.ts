import { deleteEmptyTag } from "@/lib/nfc-db";
import { adminSignedIn, json, sameOrigin } from "@/lib/nfc-http";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  if (!await adminSignedIn()) return json({ error: "Admin access required." }, 401);
  const { id } = await params;
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return json({ error: "Invalid tag ID." }, 400);
  try {
    if (!await deleteEmptyTag(id)) return json({ error: "Tag not found or it has a signup. Refresh the list." }, 409);
    return json({ ok: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23503") return json({ error: "This tag now has a signup and was kept. Refresh the list." }, 409);
    return json({ error: "Couldn’t delete the tag. Please try again." }, 503);
  }
}
