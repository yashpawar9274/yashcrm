import type { AccountRole } from '@/lib/auth/roles'

export type AccountPlan = 'free' | 'pro' | 'business'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled'

export function isAccountPlan(value: unknown): value is AccountPlan {
  return value === 'free' || value === 'pro' || value === 'business'
}

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
  return (
    value === 'active' ||
    value === 'trialing' ||
    value === 'past_due' ||
    value === 'canceled'
  )
}

export interface PlanDefinition {
  id: AccountPlan
  name: string
  monthlyPriceCents: number
  limits: {
    members: number | null
    contacts: number | null
    messagesPerMonth: number | null
    automations: number | null
  }
}

export const PLANS: Record<AccountPlan, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    monthlyPriceCents: 0,
    limits: { members: 2, contacts: 1000, messagesPerMonth: 1000, automations: 3 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPriceCents: 4900,
    limits: { members: 10, contacts: 10000, messagesPerMonth: 20000, automations: 25 },
  },
  business: {
    id: 'business',
    name: 'Business',
    monthlyPriceCents: 14900,
    limits: { members: null, contacts: null, messagesPerMonth: null, automations: null },
  },
}

export interface AccountEntitlementInput {
  plan: AccountPlan
  subscriptionStatus: SubscriptionStatus
  trialEndsAt?: string | null
}

export function getPlan(plan: AccountPlan): PlanDefinition {
  return PLANS[plan]
}

export function canUseAccount(input: AccountEntitlementInput, now = new Date()): boolean {
  if (input.subscriptionStatus === 'active') return true
  if (input.subscriptionStatus === 'trialing') {
    return Boolean(input.trialEndsAt && new Date(input.trialEndsAt).getTime() > now.getTime())
  }
  return false
}

export function canUseFeature(
  input: AccountEntitlementInput,
  role: AccountRole,
): boolean {
  return role !== 'viewer' && canUseAccount(input)
}