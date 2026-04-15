import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import type { ClassicRoundRecord, PlayerRecord, RoundRecord } from "./tournaments";

export const appAccessLogsTable = pgTable("app_access_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  email: text("email"),
  event: text("event").notNull(),
  success: boolean("success").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  errorMessage: text("error_message"),
  details: jsonb("details").notNull().$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tournamentResultLogsTable = pgTable("tournament_result_logs", {
  id: text("id").primaryKey(),
  tournamentId: text("tournament_id").notNull(),
  userId: text("user_id").notNull(),
  format: text("format").notNull(),
  targetScore: integer("target_score").notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }).notNull(),
  players: jsonb("players").notNull().$type<PlayerRecord[]>(),
  rounds: jsonb("rounds").notNull().$type<RoundRecord[] | ClassicRoundRecord[]>(),
  results: jsonb("results").notNull().$type<Record<string, unknown>[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppAccessLogSchema = createInsertSchema(appAccessLogsTable).omit({ createdAt: true });
export const insertTournamentResultLogSchema = createInsertSchema(tournamentResultLogsTable).omit({ createdAt: true });

export type InsertAppAccessLog = z.infer<typeof insertAppAccessLogSchema>;
export type AppAccessLog = typeof appAccessLogsTable.$inferSelect;
export type InsertTournamentResultLog = z.infer<typeof insertTournamentResultLogSchema>;
export type TournamentResultLog = typeof tournamentResultLogsTable.$inferSelect;