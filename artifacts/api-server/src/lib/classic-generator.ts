import type { PlayerRecord, ClassicRoundRecord, ClassicGameRecord } from "@workspace/db";

const TOTAL_ROUNDS_6 = 5;
const TOTAL_ROUNDS_4 = 3;

// Rotating schedule: all 15 unique pairs (C(6,2)) covered exactly once over 5 rounds
// Each round has 3 pairs: A, B, C
// Each round has 3 games: A vs B (C judges), A vs C (B judges), B vs C (A judges)
const ROTATING_SCHEDULE_0BASED: [number[], number[], number[]][] = [
  [[0, 1], [2, 3], [4, 5]],
  [[0, 2], [1, 4], [3, 5]],
  [[0, 3], [1, 5], [2, 4]],
  [[0, 4], [1, 3], [2, 5]],
  [[0, 5], [1, 2], [3, 4]],
];

function makeGames(): ClassicGameRecord[] {
  return [
    { gameNumber: 1, pairAKey: "A", pairBKey: "B", judgeKey: "C", scoreA: null, scoreB: null, winner: null, completed: false },
    { gameNumber: 2, pairAKey: "A", pairBKey: "C", judgeKey: "B", scoreA: null, scoreB: null, winner: null, completed: false },
    { gameNumber: 3, pairAKey: "B", pairBKey: "C", judgeKey: "A", scoreA: null, scoreB: null, winner: null, completed: false },
  ];
}

function makeFourPlayerGames(): ClassicGameRecord[] {
  return [
    { gameNumber: 1, pairAKey: "A", pairBKey: "B", scoreA: null, scoreB: null, winner: null, completed: false },
  ];
}

export function generateClassicRounds(players: PlayerRecord[], rotating: boolean): ClassicRoundRecord[] {
  const ids = players.map((p) => p.id);

  if (players.length === 4) {
    const rotatingSchedule: [number[], number[]][] = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]],
    ];

    return Array.from({ length: TOTAL_ROUNDS_4 }, (_, i) => {
      const [pairAIdx, pairBIdx] = rotating
        ? rotatingSchedule[i]
        : [[0, 1], [2, 3]];

      return {
        round: i + 1,
        pairs: {
          A: pairAIdx.map((idx) => ids[idx]),
          B: pairBIdx.map((idx) => ids[idx]),
        },
        games: makeFourPlayerGames(),
        completed: false,
      };
    });
  }

  return Array.from({ length: TOTAL_ROUNDS_6 }, (_, i) => {
    let pairA: number[], pairB: number[], pairC: number[];

    if (rotating) {
      const schedule = ROTATING_SCHEDULE_0BASED[i];
      pairA = schedule[0].map((idx) => ids[idx]);
      pairB = schedule[1].map((idx) => ids[idx]);
      pairC = schedule[2].map((idx) => ids[idx]);
    } else {
      // Fixed pairs: (1,2), (3,4), (5,6) every round
      pairA = [ids[0], ids[1]];
      pairB = [ids[2], ids[3]];
      pairC = [ids[4], ids[5]];
    }

    return {
      round: i + 1,
      pairs: { A: pairA, B: pairB, C: pairC },
      games: makeGames(),
      completed: false,
    };
  });
}

/**
 * Recalculate individual player stats from all completed classic rounds.
 * Each game: winning pair players get +1 win +diff, losing pair get +1 loss -diff.
 * Judging pair: no change.
 */
export function calculateClassicStats(
  players: PlayerRecord[],
  rounds: ClassicRoundRecord[]
): PlayerRecord[] {
  const stats = new Map(
    players.map((p) => [
      p.id,
      { id: p.id, name: p.name, gamesPlayed: 0, wins: 0, losses: 0, pointsDiff: 0 },
    ])
  );

  for (const round of rounds) {
    for (const game of round.games) {
      if (!game.completed || game.scoreA === null || game.scoreB === null) continue;

      const pairA = round.pairs[game.pairAKey];
      const pairB = round.pairs[game.pairBKey];

      const diff = Math.abs(game.scoreA - game.scoreB);
      const winnerPair = game.winner === "A" ? pairA : pairB;
      const loserPair = game.winner === "A" ? pairB : pairA;

      for (const pid of winnerPair) {
        const s = stats.get(pid);
        if (s) { s.gamesPlayed += 1; s.wins += 1; s.pointsDiff += diff; }
      }
      for (const pid of loserPair) {
        const s = stats.get(pid);
        if (s) { s.gamesPlayed += 1; s.losses += 1; s.pointsDiff -= diff; }
      }
    }
  }

  return Array.from(stats.values());
}
