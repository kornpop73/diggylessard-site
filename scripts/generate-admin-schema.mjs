import { writeFile } from 'node:fs/promises';
import { Kysely } from 'kysely';
import { KyselyPGlite } from 'kysely-pglite';
import { getMigrations } from 'better-auth/db/migration';
import { makeAdminAuth } from '../src/lib/admin-auth-factory.ts';
import { ACCESS_SCHEMA } from '../src/lib/admin-access.ts';

// Generate against an empty in-memory database. This never connects to Neon.
const local=await KyselyPGlite.create();
const db=new Kysely({dialect:local.dialect});
try {
 const auth=makeAdminAuth({db,secret:'schema-generation-only-'.repeat(4),baseURL:'http://localhost:3199'});
 const migration=await getMigrations(auth.options);
 let schema='-- Generated for Better Auth 1.7.25. Prepared only; not applied to production.\n'+ACCESS_SCHEMA+'\n'+await migration.compileMigrations();
 for(const table of ['nfc_admin_access','nfc_auth_user','nfc_auth_session','nfc_auth_account','nfc_auth_verification','nfc_auth_rate_limit']) schema+=`\nALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;\nREVOKE ALL ON "${table}" FROM PUBLIC;\n`;
 await writeFile('db/admin-auth.sql',schema);
 console.log('Prepared db/admin-auth.sql using an isolated in-memory database. No accounts seeded.');
} finally {await db.destroy();}
