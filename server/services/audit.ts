import type { Prisma } from '@prisma/client'
import { prisma } from '../db'

export type AuditInput = {
  actorId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Append an audit log entry. Never include secrets, tokens or full payloads
 * in `metadata`.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    console.error('[audit] failed to record', input.action, error)
  }
}
