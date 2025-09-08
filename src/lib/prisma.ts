// Schema generator outputs to ../src/generated/prisma (see prisma/schema.prisma)
// So import the generated client from that path instead of "@prisma/client".
import { PrismaClient } from "@/generated/prisma";

// Ensure a single PrismaClient instance across hot reloads in dev
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
