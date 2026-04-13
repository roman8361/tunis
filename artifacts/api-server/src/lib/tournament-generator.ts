import type { PlayerRecord, RoundRecord } from "@workspace/db";

const TOTAL_ROUNDS = 15;
const TOTAL_PLAYERS = 5;

const TUNISIAN_SCHEDULE: Array<[[number, number], [number, number]]> = [
  [[1, 2], [3, 4]],
  [[2, 4], [3, 5]],
  [[1, 5], [3, 4]],
  [[1, 2], [4, 5]],
  [[1, 3], [2, 5]],
  [[1, 4], [2, 3]],
  [[2, 5], [3, 4]],
  [[1, 3], [4, 5]],
  [[1, 4], [2, 5]],
  [[1, 5], [2, 3]],
  [[1, 3], [2, 4]],
  [[2, 3], [4, 5]],
  [[1, 4], [3, 5]],
  [[1, 5], [2, 4]],
  [[1, 2], [3, 5]],
];

/**
 * Generate 15 rounds for a Tunisian format tournament with 5 players.
 * Rules:
 * Uses the fixed 15-round schedule for player positions 1-5.
 */
export function generateRounds(players: PlayerRecord[]): RoundRecord[] {
  if (players.length !== TOTAL_PLAYERS) {
    throw new Error(`Tunisian format requires exactly ${TOTAL_PLAYERS} players`);
  }

  const playerIds = players.map((p) => p.id);

  return TUNISIAN_SCHEDULE.map(([teamAPositions, teamBPositions], index) => {
    const teamA = teamAPositions.map((position) => playerIds[position - 1]);
    const teamB = teamBPositions.map((position) => playerIds[position - 1]);
    const activePlayerIds = new Set([...teamA, ...teamB]);
    const restingPlayerId = playerIds.find((id) => !activePlayerIds.has(id));

    if (restingPlayerId === undefined) {
      throw new Error(`Unable to determine resting player for round ${index + 1}`);
    }

    return {
      round: index + 1,
      restingPlayerId,
      teamA,
      teamB,
      scoreA: null,
      scoreB: null,
      winner: null,
      completed: false,
      manuallyEditedTeams: false,
    };
  });
}

/**
 * Calculate player statistics from completed rounds
 */
export function calculateStats(
  players: PlayerRecord[],
  rounds: RoundRecord[]
): PlayerRecord[] {
  const stats = new Map(
    players.map((p) => [
      p.id,
      { id: p.id, name: p.name, gamesPlayed: 0, wins: 0, losses: 0, pointsDiff: 0 },
    ])
  );

  for (const round of rounds) {
    if (!round.completed || round.scoreA === null || round.scoreB === null) continue;

    const diff = Math.abs(round.scoreA - round.scoreB);
    const winningTeam = round.scoreA > round.scoreB ? round.teamA : round.teamB;
    const losingTeam = round.scoreA > round.scoreB ? round.teamB : round.teamA;

    for (const playerId of winningTeam) {
      const s = stats.get(playerId);
      if (s) {
        s.gamesPlayed += 1;
        s.wins += 1;
        s.pointsDiff += diff;
      }
    }

    for (const playerId of losingTeam) {
      const s = stats.get(playerId);
      if (s) {
        s.gamesPlayed += 1;
        s.losses += 1;
        s.pointsDiff -= diff;
      }
    }
  }

  return Array.from(stats.values());
}
