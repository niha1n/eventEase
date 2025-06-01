import { PrismaClient, Role } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found");
      process.exit(1);
    }

    // Update the user's role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: Role.ADMIN },
    });

    console.log("Successfully updated user to admin:", {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    // Create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: "MAKE_ADMIN",
        userId: updatedUser.id,
        targetUserId: updatedUser.id,
        details: {
          previousRole: user.role,
          newRole: Role.ADMIN,
          method: "script",
        },
      },
    });

    console.log("Audit log created");
  } catch (error) {
    console.error("Error making user admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error("Please provide an email address");
  console.log("Usage: npx tsx scripts/make-admin.ts user@example.com");
  process.exit(1);
}

makeAdmin(email);
