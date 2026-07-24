import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// ============================================================
// Database client
// On Vercel serverless, the working directory is read-only.
// We write the SQLite file to /tmp (the only writable directory)
// so the DB can be created/seeded on cold start.
// ============================================================

function getDatabaseUrl(): string {
  // Allow explicit override via env
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL
    // If it's a file: URL with a relative path, resolve it to /tmp on Vercel
    if (url.startsWith('file:') && process.env.VERCEL) {
      const dbPath = url.replace('file:', '').replace(/^\.?\//, '')
      const filename = path.basename(dbPath)
      const tmpPath = path.join('/tmp', filename)
      return `file:${tmpPath}`
    }
    return url
  }
  return 'file:./db/custom.db'
}

const databaseUrl = getDatabaseUrl()

// Make sure the directory exists (for local dev)
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
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db