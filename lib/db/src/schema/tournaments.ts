import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tournamentsTable = pgTable("tournaments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  targetScore: integer("target_score").notNull(),
  status: text("status").notNull().default("in_progress"),
  players: jsonb("players").notNull().$type<PlayerRecord[]>(),
  rounds: jsonb("rounds").notNull().$type<RoundRecord[]>(),
});

export interface PlayerRecord {
  id: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsDiff: number;
}

export interface RoundRecord {
  round: number;
  restingPlayerId: number;
  teamA: number[];
  teamB: number[];
  scoreA: number | null;
  scoreB: number | null;
  winner: string | null;
  completed: boolean;
  manuallyEditedTeams: boolean;
}

export const insertTournamentSchema = createInsertSchema(tournamentsTable).omit({ createdAt: true });
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournamentsTable.$inferSelect;
