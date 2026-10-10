-- 001_initial_schema.sql
-- Source: artifacts/05_arquitecture/DATA_MODEL_V1.md, Appendix A (DDL), copied verbatim (ADR-018, P05-ASM-015).
-- Apply with DATABASE_URL_UNPOOLED via `npm run migrate`, never during the build (ARCHITECTURE 5.5).

CREATE TABLE account (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type   text        NOT NULL CHECK (account_type IN ('owner', 'provider')),
  name           text        NOT NULL CHECK (btrim(name) <> '' AND char_length(name) <= 120),
  email          text        NOT NULL CHECK (email = lower(btrim(email)) AND char_length(email) <= 254 AND position('@' IN email) > 1),
  password_hash  text        NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_email_type_uq UNIQUE (email, account_type),
  CONSTRAINT account_id_type_uq    UNIQUE (id, account_type)
);

CREATE TABLE session (
  token_hash          bytea       PRIMARY KEY CHECK (octet_length(token_hash) = 32),
  account_id          uuid        NOT NULL REFERENCES account (id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  last_seen_at        timestamptz NOT NULL DEFAULT now(),
  absolute_expires_at timestamptz NOT NULL,
  ended_at            timestamptz,
  CONSTRAINT session_expiry_after_creation CHECK (absolute_expires_at > created_at)
);
CREATE INDEX session_account_idx ON session (account_id);

CREATE TABLE pet (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid         NOT NULL,
  owner_type  text         NOT NULL DEFAULT 'owner' CHECK (owner_type = 'owner'),
  name        text         NOT NULL CHECK (btrim(name) <> '' AND char_length(name) <= 80),
  species     text         NOT NULL CHECK (species IN ('dog', 'cat')),
  breed       text         NOT NULL CHECK (btrim(breed) <> '' AND char_length(breed) <= 80),
  age_years   smallint     NOT NULL CHECK (age_years >= 0),
  weight_kg   numeric(4,1)          CHECK (weight_kg > 0),
  height_cm   smallint              CHECK (height_cm > 0),
  created_at  timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT pet_owner_fk FOREIGN KEY (owner_id, owner_type) REFERENCES account (id, account_type),
  CONSTRAINT pet_id_owner_uq UNIQUE (id, owner_id)
);
CREATE INDEX pet_owner_idx ON pet (owner_id);

CREATE TABLE provider_profile (
  provider_id    uuid        PRIMARY KEY,
  account_type   text        NOT NULL DEFAULT 'provider' CHECK (account_type = 'provider'),
  provider_type  text        NOT NULL CHECK (provider_type IN ('clinic', 'independent')),
  public_name    text        NOT NULL CHECK (btrim(public_name) <> '' AND char_length(public_name) <= 120),
  contact_phone  text                 CHECK (contact_phone ~ '^[0-9 +]+$' AND contact_phone ~ '[0-9]' AND char_length(contact_phone) <= 30),
  contact_email  text        NOT NULL CHECK (char_length(contact_email) <= 254 AND position('@' IN contact_email) > 1),
  address        text                 CHECK (address IS NULL OR (btrim(address) <> '' AND char_length(address) <= 300)),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT provider_account_fk FOREIGN KEY (provider_id, account_type) REFERENCES account (id, account_type),
  CONSTRAINT provider_id_type_uq UNIQUE (provider_id, provider_type),
  CONSTRAINT clinic_address_required CHECK (provider_type <> 'clinic' OR address IS NOT NULL)
);

CREATE TABLE working_hours (
  provider_id  uuid     NOT NULL REFERENCES provider_profile (provider_id),
  weekday      smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),        -- ISO 8601: 1 = Monday ... 7 = Sunday
  start_hour   smallint NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  end_hour     smallint NOT NULL CHECK (end_hour BETWEEN 1 AND 24),      -- 24 = midnight at the end of the day
  CONSTRAINT working_hours_pk PRIMARY KEY (provider_id, weekday),
  CONSTRAINT working_hours_end_after_start CHECK (end_hour > start_hour)
);

CREATE TABLE offering (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id    uuid        NOT NULL,
  provider_type  text        NOT NULL,
  kind           text        NOT NULL CHECK (kind IN ('service', 'product')),
  name           text        NOT NULL CHECK (btrim(name) <> '' AND char_length(name) <= 120),
  price_cop      integer     NOT NULL CHECK (price_cop > 0),
  species        text        NOT NULL CHECK (species IN ('dog', 'cat')),
  modality       text                 CHECK (modality IN ('clinic', 'home', 'both')),
  available      boolean,
  created_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offering_provider_fk FOREIGN KEY (provider_id, provider_type) REFERENCES provider_profile (provider_id, provider_type),
  CONSTRAINT offering_kind_fields CHECK (
       (kind = 'service' AND modality IS NOT NULL AND available IS NULL)
    OR (kind = 'product' AND modality IS NULL     AND available IS NOT NULL)),
  CONSTRAINT independent_home_only CHECK (kind <> 'service' OR provider_type = 'clinic' OR modality = 'home'),
  CONSTRAINT offering_id_provider_kind_uq UNIQUE (id, provider_id, kind)
);
CREATE INDEX offering_provider_idx ON offering (provider_id, kind);

CREATE TABLE appointment (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid        NOT NULL,
  pet_id             uuid        NOT NULL,
  service_id         uuid        NOT NULL,
  service_kind       text        NOT NULL DEFAULT 'service' CHECK (service_kind = 'service'),
  provider_id        uuid        NOT NULL,
  provider_capacity  text        NOT NULL CHECK (provider_capacity IN ('clinic', 'independent')),
  starts_at          timestamptz NOT NULL CHECK (extract(epoch FROM starts_at)::bigint % 3600 = 0),
  modality           text        NOT NULL CHECK (modality IN ('clinic', 'home')),
  visit_address      text                 CHECK (visit_address IS NULL OR (btrim(visit_address) <> '' AND char_length(visit_address) <= 300)),
  status             text        NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  cancelled_at       timestamptz,
  CONSTRAINT appointment_pet_fk      FOREIGN KEY (pet_id, owner_id) REFERENCES pet (id, owner_id),
  CONSTRAINT appointment_service_fk  FOREIGN KEY (service_id, provider_id, service_kind) REFERENCES offering (id, provider_id, kind),
  CONSTRAINT appointment_provider_fk FOREIGN KEY (provider_id, provider_capacity) REFERENCES provider_profile (provider_id, provider_type),
  CONSTRAINT appointment_home_address CHECK ((modality = 'home') = (visit_address IS NOT NULL)),
  CONSTRAINT appointment_independent_home_only CHECK (provider_capacity = 'clinic' OR modality = 'home'),
  CONSTRAINT appointment_cancel_time CHECK ((status = 'cancelled') = (cancelled_at IS NOT NULL))
);
-- BR-013 / CR-008: at most one scheduled appointment per start time for an independent veterinarian.
-- Clinic appointments are outside the predicate, so clinics stay unlimited (BR-012).
CREATE UNIQUE INDEX appointment_independent_slot_uq
  ON appointment (provider_id, starts_at)
  WHERE status = 'scheduled' AND provider_capacity = 'independent';
CREATE INDEX appointment_owner_idx    ON appointment (owner_id, starts_at);
CREATE INDEX appointment_provider_idx ON appointment (provider_id, starts_at);

CREATE TABLE product_order (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid        NOT NULL,
  owner_type         text        NOT NULL DEFAULT 'owner' CHECK (owner_type = 'owner'),
  product_id         uuid        NOT NULL,
  product_kind       text        NOT NULL DEFAULT 'product' CHECK (product_kind = 'product'),
  provider_id        uuid        NOT NULL,
  quantity           smallint    NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  unit_price_cop     integer     NOT NULL CHECK (unit_price_cop > 0),
  total_cop          bigint      GENERATED ALWAYS AS (unit_price_cop::bigint * quantity) STORED,
  delivery_address   text        NOT NULL CHECK (btrim(delivery_address) <> '' AND char_length(delivery_address) <= 300),
  status             text        NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_delivery', 'closed', 'cancelled')),
  placed_at          timestamptz NOT NULL DEFAULT now(),
  status_changed_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_owner_fk   FOREIGN KEY (owner_id, owner_type) REFERENCES account (id, account_type),
  CONSTRAINT order_product_fk FOREIGN KEY (product_id, provider_id, product_kind) REFERENCES offering (id, provider_id, kind)
);
CREATE INDEX product_order_owner_idx    ON product_order (owner_id, placed_at DESC);
CREATE INDEX product_order_provider_idx ON product_order (provider_id, placed_at DESC);
