-- ============================================================
-- 040_saas_plans.sql — SaaS entitlement foundation
--
-- Billing is intentionally provider-neutral. Accounts get a plan
-- and lifecycle status now; a future billing provider can update
-- these fields from its webhook without changing tenant ownership.
-- Existing accounts remain usable on the Free plan.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_plan_enum') THEN
    CREATE TYPE account_plan_enum AS ENUM ('free', 'pro', 'business');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_subscription_status_enum') THEN
    CREATE TYPE account_subscription_status_enum AS ENUM ('active', 'trialing', 'past_due', 'canceled');
  END IF;
END $$;

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS plan account_plan_enum NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status account_subscription_status_enum NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_accounts_billing_customer
  ON accounts(billing_customer_id)
  WHERE billing_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_billing_subscription
  ON accounts(billing_subscription_id)
  WHERE billing_subscription_id IS NOT NULL;

COMMENT ON COLUMN accounts.plan IS
  'Provider-neutral SaaS plan. Billing integrations may update this value.';
COMMENT ON COLUMN accounts.subscription_status IS
  'Provider-neutral account lifecycle status used by entitlement checks.';