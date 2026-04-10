import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth.js";
import { logger } from "./logger.js";

export async function seedAdmin(): Promise<void> {
  const adminEmail = "admin@local";
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, adminEmail));

  if (existing) {
    logger.info("Admin user already exists, skipping seed");
    return;
  }

  const passwordHash = await hashPassword("admin");
  await db.insert(usersTable).values({
    id: randomUUID(),
    email: adminEmail,
    passwordHash,
    role: "superadmin",
  });

  logger.info("Admin user created: admin@local / admin");
}
