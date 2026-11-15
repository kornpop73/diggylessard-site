import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { contactInput, csvCell, fanCsv, tokenHash, validToken, localDemoAllowed } from "../src/lib/nfc-core.ts";

test("contact validation normalizes email and an optional handle", () => {
  assert.deepEqual(contactInput({name:" Fan ",email:" Fan@Example.COM ",instagram:" @fan.name "}), {name:"Fan",email:"fan@example.com",instagram:"fan.name"});
  assert.deepEqual(contactInput({name:"Fan",email:"fan@example.com",instagram:""}), {name:"Fan",email:"fan@example.com",instagram:null});
  for (const value of [{name:"",email:"fan@example.com",instagram:""}, {name:"Fan",email:"bad",instagram:""}, {email:"a@b.c",instagram:"https://instagram.com/a"}, {email:"a@b.c",instagram:[]}, null]) assert.equal(contactInput(value),null);
});

test("CSV escapes formulas, quotes, delimiters and newlines", () => {
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  for (const value of ["=1+1","+1","-1","@formula","  =1", "\tvalue"]) assert.ok(csvCell(value).startsWith('"\''));
});

test("only valid tag tokens are accepted and stored as fingerprints", () => {
  assert.equal(validToken("a".repeat(64)), true);
  assert.equal(validToken("a".repeat(63)), false);
  assert.equal(validToken("A".repeat(64)), false);
  assert.notEqual(tokenHash("a".repeat(64)), "a".repeat(64));
});

test("database enforces one submission per registered tag and unverified status", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile(new URL("../db/nfc.sql", import.meta.url), "utf8"));
    const id = "00000000-0000-4000-8000-000000000001";
    const missing = "00000000-0000-4000-8000-000000000002";
    await db.query("INSERT INTO nfc_tags (id,token_hash) VALUES ($1,$2)", [id,tokenHash("a".repeat(64))]);
    const insert = "INSERT INTO nfc_fans (tag_id,email,instagram,disclosure,disclosure_version) VALUES ($1,$2,$3,'updates','test') ON CONFLICT (tag_id) DO NOTHING RETURNING tag_id";
    const results = await Promise.all([
      db.query(insert,[id,"first@example.invalid","first"]),
      db.query(insert,[id,"second@example.invalid","second"]),
    ]);
    assert.equal(results.reduce((sum,result)=>sum+result.rows.length,0),1);
    const saved = (await db.query("SELECT * FROM nfc_fans")).rows;
    assert.equal(saved.length,1);
    assert.equal(saved[0].email,"first@example.invalid");
    assert.equal(saved[0].email_verified,false);
    await assert.rejects(db.query(insert,[missing,"unknown@example.invalid",null]));
    await assert.rejects(db.query("UPDATE nfc_fans SET email_verified = true"));
    await assert.rejects(db.query("INSERT INTO nfc_tags (id,token_hash) VALUES ($1,$2)",[missing,tokenHash("a".repeat(64))]));
    await db.exec("CREATE ROLE nfc_public_test; SET ROLE nfc_public_test");
    await assert.rejects(db.query("SELECT email FROM nfc_fans"));
  } finally { await db.close(); }
});

test("passwordless demo is restricted to explicit localhost development with local storage", () => {
  const local = { nodeEnv: "development", localDatabase: "/private/local-test", enabled: "1", host: "127.0.0.1:3150" };
  assert.equal(localDemoAllowed(local), true);
  for (const patch of [{nodeEnv:"production"},{vercel:"1"},{vercelEnv:"production"},{localDatabase:undefined},{enabled:"0"},{host:"diggylessard-site.vercel.app"},{host:null}]) assert.equal(localDemoAllowed({...local,...patch}), false);
});

test("fan CSV contains only fan submissions and four human-facing columns", () => {
  const csv = fanCsv([
    { name: null, email: null, instagram: null, submitted_at: null },
    { name: "=unsafe", email: "fan@example.invalid", instagram: null, submitted_at: "2026-11-15T12:00:00Z" },
    { name: "Another Fan", email: "another@example.invalid", instagram: "another.fan", submitted_at: new Date("2026-11-15T13:00:00Z") },
  ]);
  const lines = csv.split("\r\n");
  assert.equal(lines[0], '\"Name\",\"Email\",\"Instagram\",\"Sign-up date\"');
  assert.equal(lines.length, 3);
  assert.ok(lines[1].startsWith('\"\'=unsafe\"'));
  assert.ok(!csv.includes("tag_id") && !csv.includes("Pending"));
});
