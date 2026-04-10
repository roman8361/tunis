import { Router, type IRouter } from "express";
import { db, tournamentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import { calculateStats } from "../lib/tournament-generator.js";
import { UpdateRoundBody, UpdateRoundParams } from "@workspace/api-zod";
import type { PlayerRecord, RoundRecord } from "@workspace/db";

const router: IRouter = Router();

function toFull(t: typeof tournamentsTable.$inferSelect) {
  return {
    id: t.id,
    userId: t.userId,
    createdAt: t.createdAt.toISOString(),
    finishedAt: t.finishedAt ? t.finishedAt.toISOString() : null,
    targetScore: t.targetScore,
    status: t.status,
    players: t.players as PlayerRecord[],
    rounds: t.rounds as RoundRecord[],
  };
}

router.patch("/tournaments/:id/rounds/:roundNumber", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const rawRound = Array.isArray(req.params.roundNumber) ? req.params.roundNumber[0] : req.params.roundNumber;
  const params = UpdateRoundParams.safeParse({ id: rawId, roundNumber: Number(rawRound) });
  if (!params.success) {
    res.status(400).json({ error: "Неверные параметры запроса" });
    return;
  }

  const body = UpdateRoundBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Неверные данные запроса" });
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

  const rounds = [...(tournament.rounds as RoundRecord[])];
  const roundIndex = rounds.findIndex((r) => r.round === params.data.roundNumber);

  if (roundIndex === -1) {
    res.status(404).json({ error: "Тур не найден" });
    return;
  }

  const round = { ...rounds[roundIndex] };

  // Update teams if provided
  if (body.data.teamA != null && body.data.teamB != null) {
    const newTeamA = body.data.teamA as number[];
    const newTeamB = body.data.teamB as number[];

    if (newTeamA.length !== 2 || newTeamB.length !== 2) {
      res.status(400).json({ error: "В каждой команде должно быть по 2 игрока" });
      return;
    }

    const allActive = [...newTeamA, ...newTeamB];
    const hasDuplicates = new Set(allActive).size !== allActive.length;
    if (hasDuplicates) {
      res.status(400).json({ error: "Один игрок не может быть в обеих командах" });
      return;
    }

    // Verify resting player is not in any team
    if (allActive.includes(round.restingPlayerId)) {
      res.status(400).json({ error: "Игрок, пропускающий тур, не может участвовать в командах" });
      return;
    }

    round.teamA = newTeamA;
    round.teamB = newTeamB;
    round.manuallyEditedTeams = true;
  }

  // Update score if provided
  if (body.data.scoreA != null && body.data.scoreB != null) {
    const scoreA = body.data.scoreA;
    const scoreB = body.data.scoreB;
    const targetScore = tournament.targetScore;

    // Validation
    if (scoreA < 0 || scoreB < 0) {
      res.status(400).json({ error: "Счёт не может быть отрицательным" });
      return;
    }

    if (scoreA === scoreB) {
      res.status(400).json({ error: "Ничья недопустима" });
      return;
    }

    const winner = scoreA > scoreB ? "A" : "B";
    const winScore = Math.max(scoreA, scoreB);
    const loseScore = Math.min(scoreA, scoreB);

    if (winScore !== targetScore) {
      res.status(400).json({
        error: `Победитель должен набрать ровно ${targetScore} очков`,
      });
      return;
    }

    if (loseScore >= targetScore) {
      res.status(400).json({ error: `Проигравший должен набрать меньше ${targetScore} очков` });
      return;
    }

    round.scoreA = scoreA;
    round.scoreB = scoreB;
    round.winner = winner;
    round.completed = true;
  } else if (body.data.scoreA === null && body.data.scoreB === null) {
    // Reset score
    round.scoreA = null;
    round.scoreB = null;
    round.winner = null;
    round.completed = false;
  }

  rounds[roundIndex] = round;

  // Recalculate player stats from all completed rounds
  const originalPlayers = (tournament.players as PlayerRecord[]).map((p) => ({
    id: p.id,
    name: p.name,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    pointsDiff: 0,
  }));

  const updatedPlayers = calculateStats(originalPlayers, rounds);

  // Check if all rounds are completed
  const allCompleted = rounds.every((r) => r.completed);
  const status = allCompleted ? "finished" : "in_progress";
  const finishedAt = allCompleted ? new Date() : null;

  const [updated] = await db
    .update(tournamentsTable)
    .set({
      rounds,
      players: updatedPlayers,
      status,
      finishedAt: finishedAt ?? undefined,
    })
    .where(eq(tournamentsTable.id, params.data.id))
    .returning();

  res.json(toFull(updated));
});

export default router;
