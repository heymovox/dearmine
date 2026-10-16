import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../../db'
import { env, isProd } from '../../env'
import { conflict, unauthorized, badRequest } from '../../lib/errors'
import { generateEmailToken, hashToken } from '../../lib/ids'
import { sendPasswordResetEmail, sendVerificationEmail } from '../../services/mail'

const BCRYPT_ROUNDS = 12

export type PublicUser = {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  emailVerified: boolean
  createdAt: string
}

export function serializeUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: Boolean(user.emailVerifiedAt),
    createdAt: user.createdAt.toISOString(),
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

async function issueEmailToken(userId: string, type: 'VERIFY_EMAIL' | 'RESET_PASSWORD', ttlMs: number) {
  const token = generateEmailToken()
  await prisma.emailToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + ttlMs),
    },
  })
  return token
}

export type RegisterResult = { user: User; devVerifyToken?: string }

export async function registerUser(input: {
  name: string
  email: string
  password: string
}): Promise<RegisterResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) throw conflict('An account with this email already exists')

  const passwordHash = await hashPassword(input.password)
  const role = env.ADMIN_EMAIL && env.ADMIN_EMAIL.toLowerCase() === input.email ? 'ADMIN' : 'USER'

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash, role },
  })

  const token = await issueEmailToken(user.id, 'VERIFY_EMAIL', 24 * 60 * 60 * 1000)
  await sendVerificationEmail(user.email, token)

  return isProd ? { user } : { user, devVerifyToken: token }
}

export async function authenticate(input: { email: string; password: string }): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  // Always run a comparison to reduce timing signal.
  const hash = user?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid'
  const ok = await verifyPassword(input.password, hash)
  if (!user || !ok || user.deletedAt) throw unauthorized('Incorrect email or password')
  return user
}

export async function verifyEmailToken(token: string): Promise<User> {
  const record = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!record || record.type !== 'VERIFY_EMAIL') throw badRequest('This verification link is invalid')
  if (record.usedAt) throw badRequest('This verification link has already been used')
  if (record.expiresAt.getTime() < Date.now()) throw badRequest('This verification link has expired')

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ])
  return user
}

export async function requestPasswordReset(email: string): Promise<{ devResetToken?: string }> {
  const user = await prisma.user.findUnique({ where: { email } })
  // Do not reveal whether the account exists.
  if (!user || user.deletedAt) return {}
  const token = await issueEmailToken(user.id, 'RESET_PASSWORD', 60 * 60 * 1000)
  await sendPasswordResetEmail(user.email, token)
  return isProd ? {} : { devResetToken: token }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const record = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } })
  if (!record || record.type !== 'RESET_PASSWORD') throw badRequest('This reset link is invalid')
  if (record.usedAt) throw badRequest('This reset link has already been used')
  if (record.expiresAt.getTime() < Date.now()) throw badRequest('This reset link has expired')

  const passwordHash = await hashPassword(password)
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.emailToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
  ])
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const ok = await verifyPassword(currentPassword, user.passwordHash)
  if (!ok) throw badRequest('Your current password is incorrect')
  const passwordHash = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  // Invalidate other sessions after a password change.
  await prisma.session.deleteMany({ where: { userId } })
}

export async function updateProfile(userId: string, name: string): Promise<User> {
  return prisma.user.update({ where: { id: userId }, data: { name } })
}

export async function deleteAccount(userId: string, password: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) throw badRequest('Your password is incorrect')
  // Soft delete + anonymise, then hard-delete projects (cascade) via purge.
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date(), email: `deleted+${userId}@dearmine.invalid`, name: 'Deleted account' },
    }),
    prisma.surpriseProject.updateMany({ where: { ownerId: userId }, data: { deletedAt: new Date(), status: 'ARCHIVED' } }),
    prisma.publishedPage.updateMany({
      where: { project: { ownerId: userId } },
      data: { status: 'UNPUBLISHED', unpublishedAt: new Date() },
    }),
  ])
}
