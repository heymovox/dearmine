import { env, isProd } from './env'
import { createApp } from './app'
import { prisma } from './db'
import { startExpiryJob } from './jobs/expiry'

async function main(): Promise<void> {
  // Fail fast with a clear message when the database is unreachable.
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    console.error('[boot] Could not reach the database. Check DATABASE_URL / DIRECT_URL in .env')
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }

  const app = createApp()
  const stopExpiryJob = startExpiryJob()

  const server = app.listen(env.PORT, () => {
    console.log(`\n  ${env.BRAND_NAME} API`)
    console.log(`  ───────────────────────────────`)
    console.log(`  env:          ${env.NODE_ENV}`)
    console.log(`  listening:    http://localhost:${env.PORT}/api/health`)
    console.log(`  storage:      ${env.STORAGE_PROVIDER}`)
    console.log(`  payments:     ${env.PAYMENT_PROVIDER}`)
    console.log(`  app base url: ${env.APP_BASE_URL}\n`)
    if (isProd && env.STORAGE_PROVIDER === 'local') {
      console.warn('[boot] STORAGE_PROVIDER=local in production — uploads live on this filesystem only.')
    }
  })

  const shutdown = (signal: string) => {
    console.log(`\n[boot] ${signal} received, shutting down…`)
    stopExpiryJob()
    server.close(() => {
      prisma
        .$disconnect()
        .then(() => process.exit(0))
        .catch(() => process.exit(0))
    })
    // Do not hang forever on a stuck connection.
    setTimeout(() => process.exit(1), 8_000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((error) => {
  console.error('[boot] failed to start', error)
  process.exit(1)
})
