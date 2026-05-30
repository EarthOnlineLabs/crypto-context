-- Migration 0002: optional wallet brand (self-custody app id, e.g. 'metamask').
-- Powers readable, brand-coloured connection cards. Nullable + additive, so it
-- is safe to ship before/after the app code. Idempotent.
-- Exchanges need no equivalent column: the `exchange` id already is the brand.

alter table wallets add column if not exists brand text;
