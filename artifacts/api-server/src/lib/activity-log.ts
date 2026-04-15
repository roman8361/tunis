import { randomUUID } from "crypto";
import type { Request } from "express";
import {
  appAccessLogsTable,
  db,
  tournamentResultLogsTable,
  type ClassicRoundRecord,
  type PlayerRecord,
  type RoundRecord,
  type Tournament,
} from "@workspace/db";
import { logger } from "./logger.js";

type AccessLogInput = {
  userId?: string | null;
  email?: string | null;
  success: boolean;
  errorMessage?: string | null;
  details?: Record<string, unknown>;
};

function getRequestIp(req: Request): string | null {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(",")[0]?.trim() || null;
  }
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || null;
  }
  return req.ip || req.socket.remoteAddress || null;
}

export async function recordAccessLog(
  req: Request,
  event: string,
  input: AccessLogInput,
): Promise<void> {
  try {
    await db.insert(appAccessLogsTable).values({
      id: randomUUID(),
      userId: input.userId ?? null,
      email: input.email ?? null,
      event,
      success: input.success,
      ipAddress: getRequestIp(req),
      userAgent: req.get("user-agent") ?? null,
      errorMessage: input.errorMessage ?? null,
      details: input.details ?? {},
    });
  } catch (err) {
    logger.error({ err, event, userId: input.userId, email: input.email }, "Failed to write app access log");
  }
}

export async function recordTournamentResultLog(tournament: Tournament): Promise<void> {
  const players = tournament.players as PlayerRecord[];
  const rounds = tournament.rounds as RoundRecord[] | ClassicRoundRecord[];
  const finishedAt = tournament.finishedAt ?? new Date();
  const results = [...players]
    .sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff || a.losses - b.losses || a.name.localeCompare(b.name, "ru"))
    .map((player, index) => ({
      place: index + 1,
      id: player.id,
      name: player.name,
      gamesPlayed: player.gamesPlayed,
      wins: player.wins,
      losses: player.losses,
      pointsDiff: player.pointsDiff,
    }));

  try {
    await db.insert(tournamentResultLogsTable).values({
      id: randomUUID(),
      tournamentId: tournament.id,
      userId: tournament.userId,
      format: tournament.format,
      targetScore: tournament.targetScore,
      finishedAt,
      players,
      rounds,
      results,
    });
  } catch (err) {
    logger.error({ err, tournamentId: tournament.id }, "Failed to write tournament result log");
  }
}