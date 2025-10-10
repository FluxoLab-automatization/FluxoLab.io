CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    CONSTRAINT webhook_registrations_valid_status
      CHECK (status IN ('active', 'revoked'))
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES webhook_registrations(id) ON DELETE CASCADE,
    event_type TEXT,
    payload JSONB,
    headers JSONB,
    signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL,
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT webhook_events_valid_status
      CHECK (status IN ('received', 'processed', 'rejected', 'error'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_token_hash
    ON webhook_registrations (token_hash);

CREATE INDEX IF NOT EXISTS idx_webhook_registrations_user_status
    ON webhook_registrations (user_id, status);

CREATE INDEX IF NOT EXISTS idx_webhook_events_registration
    ON webhook_events (registration_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at
    ON webhook_events (received_at DESC);
