// Focused deployed integration check. Creates and removes only its own synthetic tag/signup.
// Supply DATABASE_URL for the same site's database and --base-url=https://your-site.
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import pg from "pg";

const base = new URL(process.argv.find(arg => arg.startsWith("--base-url="))?.slice(11) || "").origin;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for this disposable integration check.");
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
const id = randomUUID(), token = randomBytes(32).toString("hex");
const name = "Disposable tag access check", email = `release-${id}@example.invalid`;
const page = `${base}/nfc/${token}`, contact = `${base}/api/nfc/tags/${token}/contact`, download = `${base}/api/nfc/tags/${token}/download`;
await db.connect();
try {
  await db.query("INSERT INTO nfc_tags(id,token_hash) VALUES($1,$2)", [id,createHash("sha256").update(token).digest("hex")]);
  assert.equal((await fetch(download)).status,403,"pending tag must deny downloads");
  const signup = await fetch(contact,{method:"POST",headers:{Origin:base,"Content-Type":"application/json"},body:JSON.stringify({name,email,instagram:"",acceptUpdates:true})});
  assert.equal(signup.status,200);
  assert.equal(signup.headers.get("set-cookie"),null,"signup must not require a receipt cookie");
  for (const userAgent of ["TagCheck-BrowserOne","TagCheck-BrowserTwo"]) {
    const headers={"User-Agent":userAgent}; // No Cookie header or shared cookie jar.
    const fanPage=await fetch(page,{headers});
    const html=await fanPage.text();
    assert.ok(html.includes("<audio") && html.includes("Download song"));
    assert.ok(!html.includes(name) && !html.includes(email),"fan contact details stay private");
    const audio=await fetch(download,{headers});
    assert.equal(audio.status,200);assert.ok(audio.headers.get("content-disposition")?.includes("filename*=UTF-8"));
    assert.ok((await audio.arrayBuffer()).byteLength>44);
    const range=await fetch(download+"?play=1",{headers:{...headers,Range:"bytes=0-43"}});
    assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,44);
  }
  const overwrite=await fetch(contact,{method:"POST",headers:{Origin:base,"Content-Type":"application/json"},body:JSON.stringify({name:"Replacement",email:"replacement@example.invalid",instagram:"",acceptUpdates:true})});
  assert.equal(overwrite.status,409,"submitted links must not overwrite contacts");
  assert.equal((await db.query("SELECT email FROM nfc_fans WHERE tag_id=$1",[id])).rows[0].email,email);
  await db.query("DELETE FROM nfc_fans WHERE tag_id=$1",[id]);
  assert.equal((await fetch(download)).status,403,"signup deletion resets all-browser access");
  const resetPage=await (await fetch(page)).text();assert.ok(resetPage.includes('name="name"')&&!resetPage.includes("<audio"));
  await db.query("DELETE FROM nfc_tags WHERE id=$1",[id]);
  assert.equal((await fetch(download)).status,403,"deleted links must deny downloads");
  assert.ok(!(await (await fetch(page)).text()).includes("<audio"));
  console.log("PASS: cookie-free cross-browser song access, private contacts, overwrite rejection, pending/reset/deleted denial, filename and audio ranges.");
} finally {
  await db.query("DELETE FROM nfc_fans WHERE tag_id=$1",[id]);
  await db.query("DELETE FROM nfc_tags WHERE id=$1",[id]);
  await db.end();
  console.log("Removed only this check’s disposable signup and tag.");
}
