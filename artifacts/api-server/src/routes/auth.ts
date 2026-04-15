import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken, requireAuth } from "../lib/auth.js";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { recordAccessLog } from "../lib/activity-log.js";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    await recordAccessLog(req, "register_failed", {
      email: typeof req.body?.email === "string" ? req.body.email : null,
      success: false,
      errorMessage: "validation_error",
    });
    res.status(400).json({ error: "Неверные данные запроса" });
    return;
  }

  const { email, password } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    await recordAccessLog(req, "register_failed", {
      userId: existing.id,
      email,
      success: false,
      errorMessage: "email_already_exists",
    });
    res.status(409).json({ error: "Пользователь с таким email уже существует" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const id = randomUUID();

  const [user] = await db.insert(usersTable).values({ id, email, passwordHash, role: "user" }).returning();
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await recordAccessLog(req, "register", {
    userId: user.id,
    email: user.email,
    success: true,
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    await recordAccessLog(req, "login_failed", {
      email: typeof req.body?.email === "string" ? req.body.email : null,
      success: false,
      errorMessage: "validation_error",
    });
    res.status(400).json({ error: "Неверные данные запроса" });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    await recordAccessLog(req, "login_failed", {
      email,
      success: false,
      errorMessage: "user_not_found",
    });
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordAccessLog(req, "login_failed", {
      userId: user.id,
      email: user.email,
      success: false,
      errorMessage: "invalid_password",
    });
    res.status(401).json({ error: "Неверный email или пароль" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await recordAccessLog(req, "login", {
    userId: user.id,
    email: user.email,
    success: true,
  });

  res.json({
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/guest", async (req, res): Promise<void> => {
  const id = randomUUID();
  const email = `guest_${id}@local`;
  const passwordHash = await hashPassword(randomUUID());

  const [user] = await db.insert(usersTable).values({ id, email, passwordHash, role: "user" }).returning();
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  await recordAccessLog(req, "guest_login", {
    userId: user.id,
    email: user.email,
    success: true,
  });

  res.status(201).json({
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.user!;
  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
  if (!dbUser) {
    await recordAccessLog(req, "app_open_failed", {
      userId: user.id,
      email: user.email,
      success: false,
      errorMessage: "user_not_found",
    });
    res.status(401).json({ error: "Пользователь не найден" });
    return;
  }
  await recordAccessLog(req, "app_open", {
    userId: dbUser.id,
    email: dbUser.email,
    success: true,
  });
  res.json({ id: dbUser.id, email: dbUser.email, role: dbUser.role, createdAt: dbUser.createdAt.toISOString() });
});

export default router;
