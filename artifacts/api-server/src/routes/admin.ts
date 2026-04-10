import { Router, type IRouter } from "express";
import { db, usersTable, tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireSuperadmin } from "../lib/auth.js";
import { AdminDeleteUserParams, AdminListUserTournamentsParams } from "@workspace/api-zod";
import type { PlayerRecord, RoundRecord } from "@workspace/db";

const router: IRouter = Router();

function toSummary(t: typeof tournamentsTable.$inferSelect) {
  const players = t.players as PlayerRecord[];
  const rounds = t.rounds as RoundRecord[];
  return {
    id: t.id,
    userId: t.userId,
    createdAt: t.createdAt.toISOString(),
    finishedAt: t.finishedAt ? t.finishedAt.toISOString() : null,
    targetScore: t.targetScore,
    status: t.status,
    playerNames: players.map((p) => p.name),
    completedRounds: rounds.filter((r) => r.completed).length,
  };
}

router.get("/admin/users", requireAuth, requireSuperadmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  // Get tournament counts per user
  const tournaments = await db.select({ id: tournamentsTable.id, userId: tournamentsTable.userId }).from(tournamentsTable);
  const countMap = new Map<string, number>();
  for (const t of tournaments) {
    countMap.set(t.userId, (countMap.get(t.userId) ?? 0) + 1);
  }

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
    tournamentCount: countMap.get(u.id) ?? 0,
  }));

  res.json(result);
});

router.delete("/admin/users/:userId", requireAuth, requireSuperadmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const params = AdminDeleteUserParams.safeParse({ userId: rawId });
  if (!params.success) {
    res.status(400).json({ error: "Неверный идентификатор" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.userId));
  if (!user) {
    res.status(404).json({ error: "Пользователь не найден" });
    return;
  }

  // Delete all user's tournaments first
  await db.delete(tournamentsTable).where(eq(tournamentsTable.userId, params.data.userId));
  // Delete user
  await db.delete(usersTable).where(eq(usersTable.id, params.data.userId));

  res.json({ success: true });
});

router.get("/admin/users/:userId/tournaments", requireAuth, requireSuperadmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const params = AdminListUserTournamentsParams.safeParse({ userId: rawId });
  if (!params.success) {
    res.status(400).json({ error: "Неверный идентификатор" });
    return;
  }

  const tournaments = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.userId, params.data.userId))
    .orderBy(tournamentsTable.createdAt);

  res.json(tournaments.map(toSummary).reverse());
});

export default router;
