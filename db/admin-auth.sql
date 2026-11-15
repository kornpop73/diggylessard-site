-- Generated for Better Auth 1.7.25. Apply through the trusted migration workflow.
CREATE TABLE IF NOT EXISTS nfc_admin_access (
  email text PRIMARY KEY CHECK (email = lower(email)), active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
create table "nfc_auth_user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" boolean not null, "image" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "nfc_auth_session" ("id" text not null primary key, "expiresAt" timestamptz not null, "token" text not null unique, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "nfc_auth_user" ("id") on delete cascade);

create table "nfc_auth_account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "nfc_auth_user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, "scope" text, "password" text, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz not null);

create table "nfc_auth_verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" timestamptz not null, "createdAt" timestamptz default CURRENT_TIMESTAMP not null, "updatedAt" timestamptz default CURRENT_TIMESTAMP not null);

create table "nfc_auth_rate_limit" ("id" text not null primary key, "key" text not null unique, "count" integer not null, "lastRequest" bigint not null);

create index "nfc_auth_session_userId_idx" on "nfc_auth_session" ("userId");

create index "nfc_auth_account_userId_idx" on "nfc_auth_account" ("userId");

create index "nfc_auth_verification_identifier_idx" on "nfc_auth_verification" ("identifier");
ALTER TABLE "nfc_admin_access" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_admin_access" FROM PUBLIC;

ALTER TABLE "nfc_auth_user" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_auth_user" FROM PUBLIC;

ALTER TABLE "nfc_auth_session" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_auth_session" FROM PUBLIC;

ALTER TABLE "nfc_auth_account" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_auth_account" FROM PUBLIC;

ALTER TABLE "nfc_auth_verification" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_auth_verification" FROM PUBLIC;

ALTER TABLE "nfc_auth_rate_limit" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "nfc_auth_rate_limit" FROM PUBLIC;
