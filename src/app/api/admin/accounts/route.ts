import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { toErrorResponse } from '@/lib/auth/account'

export async function GET() {
  try {
    await requireSuperAdmin()
    const admin = supabaseAdmin()
    const [{ data: accounts, error: accountsError }, { data: profiles, error: profilesError }] =
      await Promise.all([
        admin
          .from('accounts')
          .select('id, name, plan, subscription_status, trial_ends_at, created_at')
          .order('created_at', { ascending: false }),
        admin.from('profiles').select('account_id'),
      ])

    if (accountsError || profilesError) {
      console.error('[GET /api/admin/accounts] fetch error:', accountsError ?? profilesError)
      return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 })
    }

    const memberCounts = new Map<string, number>()
    for (const profile of profiles ?? []) {
      memberCounts.set(profile.account_id, (memberCounts.get(profile.account_id) ?? 0) + 1)
    }

    return NextResponse.json({
      accounts: (accounts ?? []).map((account) => ({
        ...account,
        member_count: memberCounts.get(account.id) ?? 0,
      })),
    })
  } catch (error) {
    return toErrorResponse(error)
  }
}