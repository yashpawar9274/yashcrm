import { describe, expect, it } from 'vitest'
import { isSuperAdminEmail } from './super-admin'

describe('super admin allowlist', () => {
  it('matches emails case-insensitively and ignores whitespace', () => {
    expect(isSuperAdminEmail('  YASH@example.com ', ['yash@example.com'])).toBe(true)
  })

  it('rejects emails outside the allowlist', () => {
    expect(isSuperAdminEmail('other@example.com', ['yash@example.com'])).toBe(false)
  })
})