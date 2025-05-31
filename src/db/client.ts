import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple instances during development
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // Optional: useful during development
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
