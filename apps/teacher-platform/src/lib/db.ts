import { PrismaClient } from "@prisma/client";

// Prisma Client instance - lazy initialization to avoid build-time errors
// Note: This connects to the same database as the landing page
// The landing page manages User, Account, Session, VerificationToken tables
// This app manages Student, Lesson, Curriculum, Event, Message, Announcement, Task, Material, Bookmark, LessonMaterial tables

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | undefined = undefined;
let _prismaError: Error | undefined = undefined;

/**
 * Get the appropriate database URL based on environment
 * Development: Uses DEV_DATABASE_URL (free tier like Neon) if available, falls back to DATABASE_URL
 * Production: Uses DATABASE_URL (production PostgreSQL database)
 */
function getDatabaseUrl(): string | undefined {
  const isProduction = process.env.NODE_ENV === "production";
  
  // In development, prefer DEV_DATABASE_URL for free tier databases (Neon, Supabase, etc.)
  if (!isProduction && process.env.DEV_DATABASE_URL) {
    return process.env.DEV_DATABASE_URL;
  }
  
  // Otherwise use DATABASE_URL (production or if DEV_DATABASE_URL not set)
  return process.env.DATABASE_URL;
}

/**
 * Ensure DATABASE_URL is properly configured for production
 * Production databases typically require SSL connections
 */
function ensureProductionDatabaseUrl(originalUrl: string | undefined): string {
  if (!originalUrl || originalUrl.trim() === "") {
    return "postgresql://postgres:postgres@localhost:5432/template1?sslmode=disable";
  }

  // If it's already a prisma+postgres:// URL (Prisma Accelerate), use DIRECT_DATABASE_URL if available
  if (originalUrl.startsWith("prisma+postgres://")) {
    return process.env.DIRECT_DATABASE_URL || originalUrl;
  }

  // For production, ensure SSL is configured
  // Most production databases require SSL connections
  if (process.env.NODE_ENV === "production") {
    try {
      const url = new URL(originalUrl);
      // Only set sslmode if not already present
      if (!url.searchParams.has("sslmode")) {
        url.searchParams.set("sslmode", "require");
      }
      return url.toString();
    } catch {
      // If URL parsing fails, return original (shouldn't happen with valid connection strings)
      return originalUrl;
    }
  }

  return originalUrl;
}

function createPrismaClient(): PrismaClient | null {
  if (_prisma) return _prisma;
  if (_prismaError) return null; // Return null if we know initialization will fail

  try {
    // Get the appropriate database URL (DEV_DATABASE_URL in dev, DATABASE_URL in prod)
    const originalDatabaseUrl = getDatabaseUrl();
    const hasDatabaseUrl = originalDatabaseUrl && originalDatabaseUrl.trim() !== "";
    
    if (!hasDatabaseUrl) {
      throw new Error("No database URL configured. Please set DEV_DATABASE_URL (development) or DATABASE_URL (production)");
    }
    
    // Ensure production-ready URL (SSL for production databases)
    const productionUrl = ensureProductionDatabaseUrl(originalDatabaseUrl);
    
    // Temporarily set DATABASE_URL for Prisma Client creation
    // Prisma Client reads DATABASE_URL from process.env at initialization
    const originalEnvUrl = process.env.DATABASE_URL;
    
    // Set the URL that Prisma Client should use
    process.env.DATABASE_URL = productionUrl;

    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" 
        ? ["query", "error", "warn"] 
        : ["error"], // Only log errors in production for performance
    });

    // Restore original DATABASE_URL env var after Prisma client is created
    // Prisma Client stores the connection string internally, so we can restore the env var
    if (originalEnvUrl) {
      process.env.DATABASE_URL = originalEnvUrl;
    }

    // Always use global instance in production to reuse connections
    // This prevents creating multiple Prisma Client instances
    globalForPrisma.prisma = _prisma;

    return _prisma;
  } catch (error) {
    _prismaError = error as Error;
    // Only log warnings in development, suppress during build
    if (process.env.NODE_ENV === "development") {
      console.warn("Prisma client initialization failed. Database features will be disabled.", error);
    }
    return null;
  }
}

// Lazy getter for prisma - only initializes when actually used
export function getPrisma(): PrismaClient | null {
  return globalForPrisma.prisma ?? createPrismaClient();
}

/**
 * Gracefully disconnect Prisma Client
 * Call this during application shutdown to close database connections
 */
export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = undefined;
    globalForPrisma.prisma = undefined;
  }
}

// Handle graceful shutdown
if (typeof process !== "undefined") {
  const shutdown = async () => {
    await disconnectPrisma();
    process.exit(0);
  };

  process.on("beforeExit", shutdown);
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

// Export prisma for backward compatibility, but make it lazy
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    if (!client) {
      throw new Error("Database is not configured. Please set up your DATABASE_URL environment variable.");
    }
    return (client as any)[prop];
  }
});
