-- Iteration 2 (ARCHITECTURE_V4 §8.2, ADR-020): logical removal of pets and offerings.
-- Removed rows stay referenced by appointments and orders (CR-018); user-facing reads filter
-- `removed_at IS NULL` (CR-029). Additive and compatible with code that does not filter yet.
ALTER TABLE pet      ADD COLUMN removed_at timestamptz;
ALTER TABLE offering ADD COLUMN removed_at timestamptz;

CREATE INDEX pet_owner_active_idx         ON pet (owner_id)            WHERE removed_at IS NULL;
CREATE INDEX offering_provider_active_idx ON offering (provider_id, kind) WHERE removed_at IS NULL;
