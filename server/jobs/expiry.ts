import { prisma } from '../db'
import { env } from '../env'
import {
  sendExpiredNotice,
  sendExpiryReminder,
  sendPaymentConfirmation,
} from '../services/mail'
import { recordAudit } from '../services/audit'

function publicUrlForSite(publicId: string): string {
  return `${env.PUBLIC_SITE_URL.replace(/\/$/, '')}/s/${publicId}`
}

/** How far ahead to warn the owner about an expiring page. */
const REMINDER_WINDOW_DAYS = 7
/** Do not resend the same reminder more often than this. */
const REMINDER_COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000

export type ExpiryJobResult = {
  expired: number
  reminded: number
  sessionsPruned: number
}

async function hasRecentReminder(pageId: string): Promise<boolean> {
  const since = new Date(Date.now() - REMINDER_COOLDOWN_MS)
  const log = await prisma.auditLog.findFirst({
    where: { action: 'expiry.reminder', entityId: pageId, createdAt: { gte: since } },
    select: { id: true },
  })
  return Boolean(log)
}

export async function runExpiryJob(now = new Date()): Promise<ExpiryJobResult> {
  /* 1. Expire pages whose hosting period ended. */
  const dueToExpire = await prisma.publishedPage.findMany({
    where: { status: 'ACTIVE', expiresAt: { not: null, lte: now } },
    include: { project: { select: { projectTitle: true, ownerId: true, owner: { select: { email: true } } } } },
  })

  for (const page of dueToExpire) {
    await prisma.publishedPage.update({ where: { id: page.id }, data: { status: 'EXPIRED' } })
    await sendExpiredNotice(page.project.owner.email, page.project.projectTitle).catch(() => undefined)
    await recordAudit({
      actorId: page.project.ownerId,
      action: 'expiry.publish.expired',
      entityType: 'PublishedPage',
      entityId: page.id,
      metadata: { publicId: page.publicId },
    })
  }

  /* 2. Warn owners of pages expiring soon (cooldown-limited). */
  const soon = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 86_400_000)
  const expiringSoon = await prisma.publishedPage.findMany({
    where: { status: 'ACTIVE', expiresAt: { gt: now, lte: soon } },
    include: {
      project: {
        select: {
          projectTitle: true,
          owner: { select: { id: true, email: true } },
        },
      },
    },
  })

  let reminded = 0
  for (const page of expiringSoon) {
    if (page.expiresAt == null) continue
    if (await hasRecentReminder(page.id)) continue
    await sendExpiryReminder(
      page.project.owner.email,
      page.project.projectTitle,
      page.expiresAt,
      publicUrlForSite(page.publicId),
    ).catch(() => undefined)
    await recordAudit({
      actorId: page.project.owner.id,
      action: 'expiry.reminder',
      entityType: 'PublishedPage',
      entityId: page.id,
      metadata: { publicId: page.publicId },
    })
    reminded += 1
  }

  /* 3. Prune expired sessions. */
  const sessionsPruned = await prisma.session.deleteMany({ where: { expiresAt: { lte: now } } }).then((r) => r.count)

  return { expired: dueToExpire.length, reminded, sessionsPruned }
}

/** Fire once at boot, then on an interval. Never throws into the server loop. */
export function startExpiryJob(intervalMs = 60 * 60 * 1000) {
  const run = () => {
    runExpiryJob()
      .then((r) => {
        if (r.expired || r.reminded || r.sessionsPruned) {
          console.log(`[expiry] expired=${r.expired} reminded=${r.reminded} sessions=${r.sessionsPruned}`)
        }
      })
      .catch((error) => console.error('[expiry] job failed', error))
  }
  const timer = setInterval(run, intervalMs)
  timer.unref?.()
  setTimeout(run, 5_000).unref?.()
  return () => clearInterval(timer)
}

/** Kept next to the job so payment confirmations stay in one import path. */
export function notifyPaymentReceived(
  email: string,
  planName: string,
  amountPaise: number,
  projectTitle: string,
) {
  const amountLabel = `${env.CURRENCY} ${(amountPaise / 100).toFixed(2)}`
  return sendPaymentConfirmation(email, planName, amountLabel, projectTitle)
}
