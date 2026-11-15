CREATE TABLE IF NOT EXISTS nfc_tags (
  id uuid PRIMARY KEY,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS nfc_fans (
  tag_id uuid PRIMARY KEY REFERENCES nfc_tags(id),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  instagram text CHECK (instagram IS NULL OR instagram ~ '^[A-Za-z0-9_.]{1,30}$'),
  disclosure text NOT NULL,
  disclosure_version text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  email_verified boolean NOT NULL DEFAULT false CHECK (email_verified = false)
);

CREATE TABLE IF NOT EXISTS nfc_rate_limits (
  bucket text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);

ALTER TABLE nfc_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON nfc_tags, nfc_fans, nfc_rate_limits FROM PUBLIC;

ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS name text CHECK (name IS NULL OR length(name) BETWEEN 1 AND 100);
ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS updated_at timestamptz;
ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS updates_consent boolean NOT NULL DEFAULT true;

-- Give every fan its own identity; a tag is optional for manually added fans.
ALTER TABLE nfc_fans ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_id_unique ON nfc_fans(id);
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_tag_unique ON nfc_fans(tag_id);
ALTER TABLE nfc_fans DROP CONSTRAINT IF EXISTS nfc_fans_pkey;
ALTER TABLE nfc_fans ALTER COLUMN tag_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS nfc_fans_manual_email_unique ON nfc_fans(lower(email)) WHERE tag_id IS NULL;

ALTER TABLE nfc_tags ADD COLUMN IF NOT EXISTS written_at timestamptz;

CREATE TABLE IF NOT EXISTS nfc_song (
  singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
  blob_url text NOT NULL, info jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE nfc_song ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON nfc_song FROM PUBLIC;
