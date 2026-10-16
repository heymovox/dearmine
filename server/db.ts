import { PrismaClient } from '@prisma/client'
import { isProd } from './env'

declare global {
  // eslint-disable-next-line no-var
  var __lovePrisma: PrismaClient | undefined
}

export const prisma =
  globalThis.__lovePrisma ??
  new PrismaClient({
    log: isProd ? ['warn', 'error'] : ['warn', 'error'],
  })

if (!isProd) globalThis.__lovePrisma = prisma

export type { PrismaClient }
