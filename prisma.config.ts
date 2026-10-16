import { defineConfig } from 'prisma/config'

/** Prisma 6+ config file — replaces the deprecated `package.json#prisma` key. */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
})
