import { Router, type IRouter } from "express";
import { randomUUID } from "crypto";
import { db, tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { generateRounds, calculateStats } from "../lib/tournament-generator.js";
import { generateClassicRounds } from "../lib/classic-generator.js";
import { CreateTournamentBody, GetTournamentParams, DeleteTournamentParams } from "@workspace/api-zod";
import type { PlayerRecord, RoundRecord, ClassicRoundRecord } from "@workspace/db";

const router: IRouter = Router();

function isClassicFormat(format: string | undefined): boolean {
  return format === "classic-fixed" || format === "classic-rotating" || format?.startsWith("classic4-fixed") === true || format?.startsWith("classic4-rotating") === true;
}

function isClassic4Format(format: string | undefined): boolean {
  return format?.startsWith("classic4-fixed") === true || format?.startsWith("classic4-rotating") === true;
}

function isRotatingFormat(format: string | undefined): boolean {
  return format === "classic-rotating" || format?.startsWith("classic4-rotating") === true;
}

function toSummary(t: typeof tournamentsTable.$inferSelect) {
  const players = t.players as PlayerRecord[];
  const rounds = t.rounds as (RoundRecord | ClassicRoundRecord)[];
  return {
    id: t.id,
    userId: t.userId,
    createdAt: t.createdAt.toISOString(),
    finishedAt: t.finishedAt ? t.finishedAt.toISOString() : null,
    targetScore: t.targetScore,
    format: t.format,
    status: t.status,
    playerNames: players.map((p) => p.name),
    completedRounds: rounds.filter((r) => r.completed).length,
  };
}

function toFull(t: typeof tournamentsTable.$inferSelect) {
  return {
    id: t.id,
    userId: t.userId,
    createdAt: t.createdAt.toISOString(),
    finishedAt: t.finishedAt ? t.finishedAt.toISOString() : null,
    targetScore: t.targetScore,
    format: t.format,
    status: t.status,
    players: t.players as PlayerRecord[],
    rounds: t.rounds as (RoundRecord | ClassicRoundRecord)[],
  };
}

router.get("/tournaments", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const tournaments = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.userId, userId))
    .orderBy(tournamentsTable.createdAt);
  res.json(tournaments.map(toSummary).reverse());
});

router.post("/tournaments", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTournamentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Неверные данные запроса" });
    return;
  }

  const { targetScore, playerNames, format } = parsed.data;
  const isClassic = isClassicFormat(format);
  const isClassic4 = isClassic4Format(format);

  if (!playerNames) {
    res.status(400).json({ error: "Необходимо указать имена игроков" });
    return;
  }

  const expectedCount = isClassic4 ? 4 : isClassic ? 6 : 5;
  if (playerNames.length !== expectedCount) {
    res.status(400).json({ error: `Необходимо ввести имена ровно ${expectedCount} игроков` });
    return;
  }

  if (![11, 15, 21].includes(targetScore)) {
    res.status(400).json({ error: "Лимит очков должен быть 11, 15 или 21" });
    return;
  }

  const trimmedNames = playerNames.map((n) => n.trim());
  for (const name of trimmedNames) {
    if (!name) {
      res.status(400).json({ error: "Имена игроков не должны быть пустыми" });
      return;
    }
  }

  const uniqueNames = new Set(trimmedNames.map((n) => n.toLowerCase()));
  if (uniqueNames.size !== expectedCount) {
    res.status(400).json({ error: "Имена игроков не должны повторяться" });
    return;
  }

  const players: PlayerRecord[] = trimmedNames.map((name, i) => ({
    id: i + 1,
    name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pointsDiff: 0,
  }));

  const rounds = isClassic
    ? generateClassicRounds(players, isRotatingFormat(format))
    : generateRounds(players);

  const id = randomUUID();
  const tournamentFormat = format ?? "tunisian";

  const [tournament] = await db
    .insert(tournamentsTable)
    .values({
      id,
      userId: req.user!.id,
      targetScore,
      format: tournamentFormat,
      status: "in_progress",
      players,
      rounds,
    })
    .returning();

  res.status(201).json(toFull(tournament));
});

router.get("/tournaments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetTournamentParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Неверный идентификатор" });
    return;
  }

  const [tournament] = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.id, params.data.id));

  if (!tournament) {
    res.status(404).json({ error: "Турнир не найден" });
    return;
  }

  const user = req.user!;
  if (tournament.userId !== user.id && user.role !== "superadmin") {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }

  res.json(toFull(tournament));
});

router.delete("/tournaments/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTournamentParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: "Неверный идентификатор" });
    return;
  }

  const [tournament] = await db
    .select()
    .from(tournamentsTable)
    .where(eq(tournamentsTable.id, params.data.id));

  if (!tournament) {
    res.status(404).json({ error: "Турнир не найден" });
    return;
  }

  const user = req.user!;
  if (tournament.userId !== user.id && user.role !== "superadmin") {
    res.status(403).json({ error: "Доступ запрещён" });
    return;
  }

  await db.delete(tournamentsTable).where(eq(tournamentsTable.id, params.data.id));
  res.json({ success: true });
});

export default router;
