import type { Session, User } from '@prisma/client'
import { prisma } from '../db'
import { env } from '../env'
import { generateSessionToken, hashToken } from '../lib/ids'

export const SESSION_COOKIE = 'ls_session'

function ttlMs(): number {
  return env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
}

export type AuthContext = { user: User; session: Session }

export async function createSession(
  userId: string,
  meta: { userAgent?: string; ipAddress?: string } = {},
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + ttlMs())
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      userAgent: meta.userAgent?.slice(0, 300) ?? null,
      ipAddress: meta.ipAddress?.slice(0, 60) ?? null,
      expiresAt,
    },
  })
  return { token, expiresAt }
}

export async function resolveSession(token: string | undefined | null): Promise<AuthContext | null> {
  if (!token) return null
  const tokenHash = hashToken(token)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })
  if (!session) return null
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined)
    return null
  }
  if (session.user.deletedAt) return null

  // Refresh "last used" at most once an hour to limit writes.
  if (Date.now() - session.lastUsedAt.getTime() > 60 * 60 * 1000) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => undefined)
  }

  const { user, ...rest } = session
  return { user, session: rest }
}

export async function destroySession(token: string | undefined | null): Promise<void> {
  if (!token) return
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } })
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } })
}

export type CookieOptions = {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
  domain?: string
  maxAge: number
}

export function sessionCookieOptions(expiresAt?: Date): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: expiresAt ? expiresAt.getTime() - Date.now() : ttlMs(),
  }
}
