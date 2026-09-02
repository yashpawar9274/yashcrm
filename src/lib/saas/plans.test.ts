import { describe, expect, it } from 'vitest'
import { canUseAccount, getPlan } from './plans'

describe('SaaS plan entitlements', () => {
  const now = new Date('2026-09-02T00:00:00.000Z')

  it('keeps active accounts enabled', () => {
    expect(canUseAccount({ plan: 'free', subscriptionStatus: 'active' }, now)).toBe(true)
  })

  it('allows a trial only before its end time', () => {
    expect(
      canUseAccount(
        { plan: 'pro', subscriptionStatus: 'trialing', trialEndsAt: '2026-09-03T00:00:00.000Z' },
        now,
      ),
    ).toBe(true)
    expect(
      canUseAccount(
        { plan: 'pro', subscriptionStatus: 'trialing', trialEndsAt: '2026-09-01T23:59:59.000Z' },
        now,
      ),
    ).toBe(false)
  })

  it('keeps plan limits centralized', () => {
    expect(getPlan('free').limits.members).toBe(2)
    expect(getPlan('business').limits.members).toBeNull()
  })

  it('disables canceled and past-due accounts', () => {
    expect(canUseAccount({ plan: 'pro', subscriptionStatus: 'canceled' }, now)).toBe(false)
    expect(canUseAccount({ plan: 'pro', subscriptionStatus: 'past_due' }, now)).toBe(false)
  })
})