import { PrismaClient, Prisma, Role, RSVPStatus, Event } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Secure password generator
function generateSecurePassword(role: string): string {
  const basePassword = "Admin@123"; // Base password that meets requirements
  const rolePrefix = role.toLowerCase().charAt(0);
  return `${rolePrefix}${basePassword}`; // e.g., aAdmin@123 for admin, sAdmin@123 for staff
}

// Helper function to generate a random date between now and 3 months from now
function getRandomFutureDate() {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  return faker.date.between({ from: now, to: future });
}

// Helper function to generate a random date in the past 3 months
function getRandomPastDate() {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - 3);
  return faker.date.between({ from: past, to: now });
}

// Generate random event data with more realistic content
function generateEventData(userId: string) {
  const startDate = getRandomFutureDate();
  const endDate = faker.datatype.boolean()
    ? new Date(
        startDate.getTime() + faker.number.int({ min: 1, max: 6 }) * 3600000
      )
    : null;

  const eventTypes = [
    "Conference",
    "Workshop",
    "Seminar",
    "Networking Event",
    "Training Session",
    "Product Launch",
    "Team Building",
    "Annual Meeting",
  ];

  const eventType = faker.helpers.arrayElement(eventTypes);
  const title = `${eventType}: ${faker.company.catchPhrase()}`;

  return {
    title,
    description: `${faker.company.catchPhrase()}. ${faker.lorem.paragraph()}`,
    location: `${faker.company.name()}, ${faker.location.streetAddress()}, ${faker.location.city()}`,
    startDate,
    endDate,
    userId,
    isPublished: faker.datatype.boolean(0.7), // 70% chance of being published
    customFields: faker.datatype.boolean(0.8) // 80% chance of having custom fields
      ? {
          maxAttendees: faker.number.int({ min: 20, max: 100 }),
          requiresApproval: faker.datatype.boolean(0.6),
          allowWaitlist: faker.datatype.boolean(0.7),
          registrationDeadline: faker.date.between({
            from: new Date(),
            to: startDate,
          }),
        }
      : Prisma.JsonNull,
  };
}

// Generate random RSVP data with more realistic content
function generateRSVPData(eventId: string) {
  const statuses = [
    RSVPStatus.CONFIRMED,
    RSVPStatus.PENDING,
    RSVPStatus.DECLINED,
  ] as const;
  const dietaryOptions = [
    "None",
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Halal",
    "Kosher",
    "Dairy-Free",
  ] as const;

  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(statuses),
    responses: faker.datatype.boolean(0.9) // 90% chance of having responses
      ? {
          dietaryRestrictions: faker.helpers.arrayElement(dietaryOptions),
          specialRequirements: faker.datatype.boolean(0.3)
            ? faker.lorem.sentence()
            : null,
          additionalNotes: faker.datatype.boolean(0.2)
            ? faker.lorem.sentence()
            : null,
        }
      : Prisma.JsonNull,
    eventId,
  };
}

// Generate random audit log data with more specific actions
function generateAuditLogData(userId: string, targetUserId?: string) {
  const actions = [
    "CREATE_EVENT",
    "UPDATE_EVENT",
    "PUBLISH_EVENT",
    "UNPUBLISH_EVENT",
    "MANAGE_RSVP",
    "UPDATE_SETTINGS",
    "VIEW_ANALYTICS",
    "MANAGE_USERS",
  ] as const;

  return {
    action: faker.helpers.arrayElement(actions),
    userId,
    targetUserId,
    details: {
      timestamp: new Date(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      browser: faker.helpers.arrayElement([
        "Chrome",
        "Firefox",
        "Safari",
        "Edge",
      ]),
      os: faker.helpers.arrayElement([
        "Windows",
        "MacOS",
        "Linux",
        "iOS",
        "Android",
      ]),
    },
  };
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Create users with different roles
    const adminPassword = await hash(generateSecurePassword("admin"), 12);
    const staffPassword = await hash(generateSecurePassword("staff"), 12);
    const ownerPassword = await hash(generateSecurePassword("owner"), 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        id: "admin_1",
        email: "admin@eventease.com",
        name: "Admin User",
        emailVerified: true,
        role: Role.ADMIN,
        createdAt: getRandomPastDate(),
        updatedAt: new Date(),
      },
    });

    // Create staff user
    const staff = await prisma.user.create({
      data: {
        id: "staff_1",
        email: "staff@eventease.com",
        name: "Staff User",
        emailVerified: true,
        role: Role.STAFF,
        createdAt: getRandomPastDate(),
        updatedAt: new Date(),
      },
    });

    // Create 2 event owner users
    const eventOwners = await Promise.all(
      Array.from({ length: 2 }, async (_, i) => {
        return prisma.user.create({
          data: {
            id: `owner_${i + 1}`,
            email: `eventowner${i + 1}@eventease.com`,
            name: faker.person.fullName(),
            emailVerified: true,
            role: Role.EVENT_OWNER,
            createdAt: getRandomPastDate(),
            updatedAt: new Date(),
          },
        });
      })
    );

    // Create accounts for users
    await Promise.all([
      ...eventOwners.map((owner) =>
        prisma.account.create({
          data: {
            id: `acc_${owner.id}`,
            accountId: owner.id,
            providerId: "credentials",
            userId: owner.id,
            password: ownerPassword,
            createdAt: owner.createdAt,
            updatedAt: owner.updatedAt,
          },
        })
      ),
      prisma.account.create({
        data: {
          id: "acc_admin",
          accountId: admin.id,
          providerId: "credentials",
          userId: admin.id,
          password: adminPassword,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      }),
      prisma.account.create({
        data: {
          id: "acc_staff",
          accountId: staff.id,
          providerId: "credentials",
          userId: staff.id,
          password: staffPassword,
          createdAt: staff.createdAt,
          updatedAt: staff.updatedAt,
        },
      }),
    ]);

    // Create 2-3 events for each event owner
    const events: Event[] = [];
    for (const owner of eventOwners) {
      const ownerEvents = await Promise.all(
        Array.from(
          { length: faker.number.int({ min: 2, max: 3 }) },
          async () => {
            const event = await prisma.event.create({
              data: generateEventData(owner.id),
            });
            events.push(event);
            return event;
          }
        )
      );
    }

    // Create RSVPs and views for each event
    for (const event of events) {
      // Create 8-15 RSVPs per event
      const rsvpCount = faker.number.int({ min: 8, max: 15 });
      for (let i = 0; i < rsvpCount; i++) {
        await prisma.rSVP.create({
          data: generateRSVPData(event.id),
        });
      }

      // Create 15-30 views per event
      const viewCount = faker.number.int({ min: 15, max: 30 });
      for (let i = 0; i < viewCount; i++) {
        await prisma.eventView.create({
          data: {
            eventId: event.id,
            createdAt: faker.date.between({
              from: event.createdAt,
              to: new Date(),
            }),
            source: faker.helpers.arrayElement([
              "direct",
              "social",
              "email",
              "search",
              "referral",
              "newsletter",
            ]),
          },
        });
      }
    }

    // Create 15 audit logs
    const allUsers = [admin, staff, ...eventOwners];
    const auditLogCount = 15;
    await Promise.all(
      Array.from({ length: auditLogCount }, async () => {
        const user = faker.helpers.arrayElement(allUsers);
        const targetUser = faker.datatype.boolean()
          ? faker.helpers.arrayElement(allUsers)
          : undefined;
        return prisma.auditLog.create({
          data: generateAuditLogData(user.id, targetUser?.id),
        });
      })
    );

    console.log("\n==========================================");
    console.log("🚀 DATABASE SEEDED SUCCESSFULLY!");
    console.log("==========================================");
    console.log("\n📋 DEMO USER CREDENTIALS");
    console.log("==========================================");
    console.log("\n👑 ADMIN USER");
    console.log("------------------------------------------");
    console.log("Email:    admin@eventease.com");
    console.log("Password: aAdmin@123");
    console.log("\n👥 STAFF USER");
    console.log("------------------------------------------");
    console.log("Email:    staff@eventease.com");
    console.log("Password: sAdmin@123");
    console.log("\n🎯 EVENT OWNERS");
    console.log("------------------------------------------");
    console.log("Event Owner 1:");
    console.log("Email:    eventowner1@eventease.com");
    console.log("Password: oAdmin@123");
    console.log("\nEvent Owner 2:");
    console.log("Email:    eventowner2@eventease.com");
    console.log("Password: oAdmin@123");
    console.log("\n==========================================");
    console.log("💡 TIP: All passwords meet security requirements:");
    console.log("• At least one uppercase letter");
    console.log("• At least one lowercase letter");
    console.log("• At least one number");
    console.log("• At least one special character");
    console.log("==========================================\n");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
