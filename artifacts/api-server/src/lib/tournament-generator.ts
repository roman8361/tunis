import type { PlayerRecord, RoundRecord } from "@workspace/db";

const TOTAL_ROUNDS = 15;
const TOTAL_PLAYERS = 5;

/**
 * Generate 15 rounds for a Tunisian format tournament with 5 players.
 * Rules:
 * - Each player rests exactly 3 times
 * - No consecutive rests for same player
 * - Pairs should be as diverse as possible (greedy algorithm)
 */
export function generateRounds(players: PlayerRecord[]): RoundRecord[] {
  const playerIds = players.map((p) => p.id);

  // Generate resting sequence: each player rests exactly 3 times, no consecutive
  const restingSequence = generateRestingSequence(playerIds);

  // For each round, generate pairs among active players
  const rounds: RoundRecord[] = [];
  const pairHistory: Map<string, number> = new Map(); // "a-b" -> count
  const opponentHistory: Map<string, number> = new Map(); // "a-b" -> count

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const restingPlayerId = restingSequence[i];
    const activePlayers = playerIds.filter((id) => id !== restingPlayerId);

    // Find best pair split among activePlayers (4 players -> 2 pairs)
    const [teamA, teamB] = selectBestPairs(activePlayers, pairHistory, opponentHistory);

    // Update history
    const pairKey = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;
    const teamAKey = pairKey(teamA[0], teamA[1]);
    const teamBKey = pairKey(teamB[0], teamB[1]);
    pairHistory.set(teamAKey, (pairHistory.get(teamAKey) ?? 0) + 1);
    pairHistory.set(teamBKey, (pairHistory.get(teamBKey) ?? 0) + 1);

    // Update opponent history
    for (const aPlayer of teamA) {
      for (const bPlayer of teamB) {
        const oppKey = pairKey(aPlayer, bPlayer);
        opponentHistory.set(oppKey, (opponentHistory.get(oppKey) ?? 0) + 1);
      }
    }

    rounds.push({
      round: i + 1,
      restingPlayerId,
      teamA,
      teamB,
      scoreA: null,
      scoreB: null,
      winner: null,
      completed: false,
      manuallyEditedTeams: false,
    });
  }

  return rounds;
}

function generateRestingSequence(playerIds: number[]): number[] {
  // Each player rests exactly 3 times in 15 rounds (15/5 = 3)
  const restCounts = new Map(playerIds.map((id) => [id, 0]));
  const sequence: number[] = [];

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    const lastResting = sequence[i - 1] ?? -1;

    // Eligible: hasn't rested 3 times, not the same as last round
    const eligible = playerIds.filter(
      (id) => id !== lastResting && (restCounts.get(id) ?? 0) < 3
    );

    if (eligible.length === 0) {
      // Fallback: anyone who hasn't rested 3 times
      const fallback = playerIds.filter((id) => (restCounts.get(id) ?? 0) < 3);
      const chosen = fallback[0];
      sequence.push(chosen);
      restCounts.set(chosen, (restCounts.get(chosen) ?? 0) + 1);
      continue;
    }

    // Prefer player who has rested least
    eligible.sort((a, b) => (restCounts.get(a) ?? 0) - (restCounts.get(b) ?? 0));

    // Among those with equal min rest count, pick semi-randomly (but deterministically)
    const minRest = restCounts.get(eligible[0]) ?? 0;
    const equalMin = eligible.filter((id) => (restCounts.get(id) ?? 0) === minRest);
    const chosen = equalMin[i % equalMin.length];

    sequence.push(chosen);
    restCounts.set(chosen, (restCounts.get(chosen) ?? 0) + 1);
  }

  return sequence;
}

function getPairKey(a: number, b: number): string {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function selectBestPairs(
  activePlayers: number[],
  pairHistory: Map<string, number>,
  opponentHistory: Map<string, number>
): [number[], number[]] {
  // There are 3 ways to split 4 players into 2 pairs:
  // [0,1] vs [2,3], [0,2] vs [1,3], [0,3] vs [1,2]
  const [a, b, c, d] = activePlayers;
  const splits: [number[], number[]][] = [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]],
  ];

  let bestScore = Infinity;
  let bestSplit = splits[0];

  for (const [teamA, teamB] of splits) {
    const pairScoreA = pairHistory.get(getPairKey(teamA[0], teamA[1])) ?? 0;
    const pairScoreB = pairHistory.get(getPairKey(teamB[0], teamB[1])) ?? 0;
    let oppScore = 0;
    for (const p1 of teamA) {
      for (const p2 of teamB) {
        oppScore += opponentHistory.get(getPairKey(p1, p2)) ?? 0;
      }
    }
    const totalScore = pairScoreA + pairScoreB + oppScore;
    if (totalScore < bestScore) {
      bestScore = totalScore;
      bestSplit = [teamA, teamB];
    }
  }

  return bestSplit;
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
