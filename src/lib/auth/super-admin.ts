import { ForbiddenError, UnauthorizedError } from './account'
import { createClient } from '@/lib/supabase/server'

function configuredEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

  export function isSuperAdminEmail(email: string, allowlist = configuredEmails()): boolean {
    return allowlist.includes(email.trim().toLowerCase())
  }

/** Authenticate a platform operator without making tenant roles global. */
export async function requireSuperAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) throw new UnauthorizedError()
  const email = user.email?.toLowerCase()
    if (!email || !isSuperAdminEmail(email)) {
    throw new ForbiddenError('Super admin access required')
  }

  return { userId: user.id, email }
}