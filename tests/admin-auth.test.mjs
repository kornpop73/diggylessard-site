import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Kysely } from 'kysely';
import { KyselyPGlite } from 'kysely-pglite';
import { getMigrations } from 'better-auth/db/migration';
import { accessStore, ACCESS_SCHEMA, adminEmail } from '../src/lib/admin-access.ts';
import { makeAdminAuth } from '../src/lib/admin-auth-factory.ts';

async function fixture() {
  const local = await KyselyPGlite.create();
  await local.client.exec(ACCESS_SCHEMA);
  const db = new Kysely({dialect:local.dialect});
  const origin = 'http://localhost:3199';
  const auth = makeAdminAuth({db,secret:'test-secret-'.repeat(8),baseURL:origin,google:{clientId:'test-client.apps.googleusercontent.com',clientSecret:'test-client-secret'}});
  await (await getMigrations(auth.options)).runMigrations();
  const store = accessStore(db);
  await store.seedInitialAdmin('admin@example.invalid');
  return {local,db,auth,store,origin};
}

test('Google access requires verified email and current admin approval', async()=>{
  assert.equal(adminEmail(' Admin@Example.COM '),'admin@example.com');
  assert.equal(adminEmail('bad'),null);
  const f=await fixture();
  try {
    const admit=f.auth.options.databaseHooks.user.create.before;
    await assert.rejects(admit({email:'admin@example.invalid',emailVerified:false},null));
    await assert.rejects(admit({email:'outsider@example.invalid',emailVerified:true},null));
    await admit({email:'admin@example.invalid',emailVerified:true},null);
    await assert.rejects(f.store.change('outsider@example.invalid','another@example.invalid',true),/Admin access required/);
    await f.store.change('admin@example.invalid','another@example.invalid',true);
    await f.store.change('another@example.invalid','third@example.invalid',true);
    assert.ok(await f.store.member('third@example.invalid'));
  } finally {await f.db.destroy();}
});

test('Google OAuth uses the configured callback and rejects invalid state', async()=>{
  const f=await fixture();
  try {
    const response=await f.auth.api.signInSocial({headers:new Headers({origin:f.origin}),body:{provider:'google',callbackURL:f.origin+'/nfc/admin',disableRedirect:true},asResponse:true});
    assert.equal(response.status,200);
    const body=await response.json();
    const url=new URL(body.url);
    assert.equal(url.hostname,'accounts.google.com');
    assert.equal(url.searchParams.get('redirect_uri'),f.origin+'/api/nfc/auth/callback/google');
    assert.ok(url.searchParams.get('state'));
    assert.ok(url.searchParams.get('scope').includes('openid'));
    assert.ok(!/drive|calendar/.test(url.searchParams.get('scope')));
    assert.match(response.headers.getSetCookie().join(';'),/HttpOnly/i);
    await f.auth.handler(new Request(f.origin+'/api/nfc/auth/callback/google?code=invalid&state=invalid'));
    assert.equal((await f.db.selectFrom('nfc_auth_session').selectAll().execute()).length,0);
  } finally {await f.db.destroy();}
});

test('removal revokes sessions immediately and the final admin is protected', async()=>{
  const f=await fixture();
  try {
    await assert.rejects(f.store.change('admin@example.invalid','admin@example.invalid',false),/at least one admin/);
    await f.store.change('admin@example.invalid','another@example.invalid',true);
    const userId=randomUUID();
    await f.db.insertInto('nfc_auth_user').values({id:userId,name:'Test Admin',email:'another@example.invalid',emailVerified:true,image:null,createdAt:new Date(),updatedAt:new Date()}).execute();
    await f.db.insertInto('nfc_auth_session').values({id:randomUUID(),token:randomUUID(),userId,expiresAt:new Date(Date.now()+3600000),createdAt:new Date(),updatedAt:new Date(),ipAddress:null,userAgent:null}).execute();
    const admitSession=f.auth.options.databaseHooks.session.create.before;
    await admitSession({userId},null);
    await f.store.change('admin@example.invalid','another@example.invalid',false);
    assert.equal(await f.store.member('another@example.invalid'),undefined);
    assert.equal((await f.db.selectFrom('nfc_auth_session').selectAll().execute()).length,0);
    await assert.rejects(admitSession({userId},null));
    await f.store.change('admin@example.invalid','another@example.invalid',true);
    assert.equal((await f.db.selectFrom('nfc_auth_session').selectAll().execute()).length,0);
    await f.store.change('another@example.invalid','admin@example.invalid',false);
    assert.ok(await f.store.member('another@example.invalid'));
  } finally {await f.db.destroy();}
});
