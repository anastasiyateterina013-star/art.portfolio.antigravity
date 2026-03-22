import type { PrismaClient } from "@prisma/client";
const { PrismaClient: PrismaClientValue } = require("@prisma/client");

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClientValue({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
