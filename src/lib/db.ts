// ============================================================
// Database client stub
// Prisma is not used in production (we use GitHub-backed JSON storage).
// This stub prevents Prisma from loading (which requires libssl3
// that's not available on all platforms).
// ============================================================

export const db = {
  product: {
    updateMany: async () => ({ count: 0 }),
    count: async () => 0,
    findMany: async () => [],
    findUnique: async () => null,
  },
  category: {
    count: async () => 0,
    findMany: async () => [],
  },
  adminUser: {
    count: async () => 0,
    findUnique: async () => null,
    upsert: async () => ({}),
  },
  order: {
    create: async () => ({}),
  },
  $executeRawUnsafe: async () => 0,
  $queryRawUnsafe: async () => [],
  $disconnect: async () => {},
};
