'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, Clock3, Search, ShieldAlert, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface AdminAccount {
  id: string
  name: string
  plan: 'free' | 'pro' | 'business'
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled'
  trial_ends_at: string | null
  created_at: string
  member_count: number
}

export default function AdminPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/accounts', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.error || 'Unable to load admin data')
        setAccounts(payload.accounts ?? [])
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => accounts.filter((account) => account.name.toLowerCase().includes(query.toLowerCase())),
    [accounts, query],
  )
  const active = accounts.filter((account) => account.subscription_status === 'active').length
  const trialing = accounts.filter((account) => account.subscription_status === 'trialing').length

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Platform control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Super admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Monitor every workspace and its subscription lifecycle.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search workspaces" className="pl-9" />
        </div>
      </div>

      {error ? <Card className="border-red-500/30 bg-red-500/5"><CardContent className="flex items-center gap-3 p-5 text-sm text-red-500"><ShieldAlert className="size-5" />{error}</CardContent></Card> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary icon={Building2} label="Total workspaces" value={accounts.length} />
        <Summary icon={CheckCircle2} label="Active subscriptions" value={active} tone="text-emerald-500" />
        <Summary icon={Clock3} label="Trialing" value={trialing} tone="text-amber-500" />
      </div>

      <Card>
        <CardHeader><CardTitle>All workspaces</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-sm text-muted-foreground">Loading workspaces...</p> : filtered.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No workspaces found.</p> : (
            <div className="divide-y divide-border">
              {filtered.map((account) => <AccountRow key={account.id} account={account} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Summary({ icon: Icon, label, value, tone = 'text-primary' }: { icon: typeof Building2; label: string; value: number; tone?: string }) {
  return <Card><CardContent className="flex items-center gap-4 p-5"><span className={`flex size-10 items-center justify-center rounded-xl bg-primary-soft ${tone}`}><Icon className="size-5" /></span><div><p className="text-2xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>
}

function AccountRow({ account }: { account: AdminAccount }) {
  return <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Building2 className="size-4" /></span><div><p className="font-medium">{account.name}</p><p className="text-xs text-muted-foreground">Created {new Date(account.created_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-4 text-sm"><span className="flex items-center gap-1.5 text-muted-foreground"><Users className="size-4" />{account.member_count}</span><span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">{account.plan}</span><span className="min-w-20 text-right text-xs font-medium capitalize text-muted-foreground">{account.subscription_status.replace('_', ' ')}</span></div></div>
}