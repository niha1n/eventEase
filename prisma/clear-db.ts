import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("Starting database cleanup...");

    // Clear tables in order of dependencies
    console.log("Clearing EventView table...");
    await prisma.eventView.deleteMany({});

    console.log("Clearing RSVP table...");
    await prisma.rSVP.deleteMany({});

    console.log("Clearing Event table...");
    await prisma.event.deleteMany({});

    console.log("Clearing AuditLog table...");
    await prisma.auditLog.deleteMany({});

    console.log("Clearing Session table...");
    await prisma.session.deleteMany({});

    console.log("Clearing Account table...");
    await prisma.account.deleteMany({});

    console.log("Clearing Verification table...");
    await prisma.verification.deleteMany({});

    console.log("Clearing User table...");
    await prisma.user.deleteMany({});

    console.log("Database cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
