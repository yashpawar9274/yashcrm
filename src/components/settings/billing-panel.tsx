'use client'

import { Check, CreditCard, ExternalLink, Gauge, UsersRound } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { PLANS, canUseAccount } from '@/lib/saas/plans'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SettingsPanelHead } from './settings-panel-head'

const CONTACT_NUMBER = '7385066631'

export function BillingPanel() {
  const { account, accountRole } = useAuth()
  const plan = account ? PLANS[account.plan] : PLANS.free
  const active = account
    ? canUseAccount({
        plan: account.plan,
        subscriptionStatus: account.subscription_status,
        trialEndsAt: account.trial_ends_at,
      })
    : false
  const status = account?.subscription_status ?? 'active'

  return (
    <section className="animate-in fade-in-50 space-y-6 duration-200">
      <SettingsPanelHead
        title="Billing & plan"
        description="Manage your workspace plan and keep an eye on the limits that shape your CRM."
      />

      <Card className="overflow-hidden border-primary/30 bg-primary-soft/40">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <CreditCard className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold capitalize">{plan.name} plan</h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold capitalize text-emerald-600 dark:text-emerald-300">
                  {active ? status : 'inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.monthlyPriceCents === 0
                  ? 'A simple starting point for small teams.'
                  : `$${plan.monthlyPriceCents / 100}/month`}
              </p>
            </div>
          </div>
          {accountRole === 'owner' || accountRole === 'admin' ? (
            <a
              className={buttonVariants({ className: 'w-full sm:w-auto' })}
              href={`https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent('I want to upgrade my wacrm plan.')}`}
              target="_blank"
              rel="noreferrer"
            >
              Talk about upgrading <ExternalLink className="size-4" />
            </a>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gauge className="size-4 text-primary" /> Plan limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LimitRow label="Team members" value={plan.limits.members} />
            <LimitRow label="Contacts" value={plan.limits.contacts} />
            <LimitRow label="Messages / month" value={plan.limits.messagesPerMonth} />
            <LimitRow label="Automations" value={plan.limits.automations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UsersRound className="size-4 text-primary" /> Included with {plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Feature text="Shared WhatsApp inbox" />
            <Feature text="Contacts, tags and pipelines" />
            <Feature text="Broadcasts and automations" />
            <Feature text="Role-based team access" />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function LimitRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value == null ? 'Unlimited' : value.toLocaleString()}</span>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return <div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary"><Check className="size-3" /></span>{text}</div>
}