import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// ============================================================
// Database client
//
// On Vercel serverless, the working directory is read-only.
// We write the SQLite file to /tmp (the only writable directory)
// so the DB can be created/seeded on cold start.
//
// ⚠️ NOTE: SQLite on Vercel is ephemeral — data added via the admin
// panel will be lost on cold start. For persistent storage, switch
// to Postgres (Vercel Postgres, Neon, Supabase) — see ADMIN.md.
// ============================================================

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL
    if (url.startsWith('file:') && process.env.VERCEL) {
      const dbPath = url.replace('file:', '').replace(/^\.?\//, '')
      const filename = path.basename(dbPath)
      return `file:${path.join('/tmp', filename)}`
    }
    return url
  }
  return 'file:./db/custom.db'
}

const databaseUrl = getDatabaseUrl()

// Ensure directory exists for local dev
if (!process.env.VERCEL) {
  const dbDir = path.dirname(databaseUrl.replace('file:', ''))
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
