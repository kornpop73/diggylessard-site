import { exportFans } from "@/lib/nfc-db";
import { adminSignedIn, json, privateHeaders } from "@/lib/nfc-http";
import { fanCsv } from "@/lib/nfc-core";

export async function GET() {
  if (!await adminSignedIn()) return json({ error: "Admin sign-in required." }, 401);
  try {
    const csv = fanCsv(await exportFans());
    return new Response(`\uFEFF${csv}\r\n`, { headers: {
      ...privateHeaders, "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="diggy-fans.csv"', "X-Content-Type-Options": "nosniff",
    } });
  } catch { return json({ error: "Export is temporarily unavailable." }, 503); }
}
