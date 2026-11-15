import { sql, type Generated, type Kysely } from "kysely";

export interface AdminDatabase {
  nfc_admin_access: {
    email: string; active: boolean; created_at: Generated<Date>; updated_at: Generated<Date>;
  };
  nfc_auth_user: {
    id: string; name: string; email: string; emailVerified: boolean;
    image: string | null; createdAt: Generated<Date>; updatedAt: Generated<Date>;
  };
  nfc_auth_session: {
    id: string; token: string; userId: string; expiresAt: Date;
    createdAt: Generated<Date>; updatedAt: Generated<Date>; ipAddress: string | null; userAgent: string | null;
  };
  nfc_auth_verification: {
    id: string; identifier: string; value: string; expiresAt: Date;
    createdAt: Generated<Date>; updatedAt: Generated<Date>;
  };
}

export const ACCESS_SCHEMA = `CREATE TABLE IF NOT EXISTS nfc_admin_access (
  email text PRIMARY KEY CHECK (email = lower(email)), active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);`;

export function adminEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function accessStore(db: Kysely<AdminDatabase>) {
  return {
    async member(email: string) {
      return db.selectFrom("nfc_admin_access").select("email")
        .where("email", "=", email.toLowerCase()).where("active", "=", true).executeTakeFirst();
    },
    async list() {
      return db.selectFrom("nfc_admin_access").select(["email", "created_at"])
        .where("active", "=", true).orderBy("created_at").execute();
    },
    async seedInitialAdmin(email: string) {
      const normalized = adminEmail(email);
      if (!normalized) throw new Error("A valid confirmed admin email is required.");
      await db.transaction().execute(async tx => {
        await sql`LOCK TABLE nfc_admin_access IN SHARE ROW EXCLUSIVE MODE`.execute(tx);
        if (await tx.selectFrom("nfc_admin_access").select("email").where("active", "=", true).executeTakeFirst()) return;
        await tx.insertInto("nfc_admin_access").values({ email: normalized, active: true })
          .onConflict(oc => oc.column("email").doUpdateSet({ active: true, updated_at: new Date() })).execute();
      });
    },
    async change(actor: string, target: string, approve: boolean) {
      const email = adminEmail(target);
      if (!email) throw new Error("Enter a valid email address.");
      await db.transaction().execute(async tx => {
        // A transaction-level lock serializes access changes. Authorization and
        // final-admin checks use fresh reads after that lock is acquired.
        await sql`LOCK TABLE nfc_admin_access IN SHARE ROW EXCLUSIVE MODE`.execute(tx);
        const admin = await tx.selectFrom("nfc_admin_access").select("email")
          .where("email", "=", actor).where("active", "=", true).executeTakeFirst();
        if (!admin) throw new Error("Admin access required.");
        const existing = await tx.selectFrom("nfc_admin_access").select("active").where("email", "=", email).executeTakeFirst();
        if (!approve) {
          if (!existing?.active) throw new Error("Account not found. Refresh the list.");
          const admins = await tx.selectFrom("nfc_admin_access").select("email").where("active", "=", true).execute();
          if (admins.length <= 1) throw new Error("Keep at least one admin. Add another admin before removing this account.");
          await tx.updateTable("nfc_admin_access").set({ active: false, updated_at: new Date() }).where("email", "=", email).execute();
        } else {
          if (existing?.active) return;
          await tx.insertInto("nfc_admin_access").values({ email, active: true })
            .onConflict(oc => oc.column("email").doUpdateSet({ active: true, updated_at: new Date() })).execute();
        }
        await tx.deleteFrom("nfc_auth_session").where("userId", "in",
          tx.selectFrom("nfc_auth_user").select("id").where("email", "=", email)).execute();
        await tx.deleteFrom("nfc_auth_verification").where(sql<boolean>`CASE WHEN identifier LIKE 'magic-link:%'
          THEN value::jsonb->>'email' = ${email} ELSE false END`).execute();
      });
    },
  };
}
