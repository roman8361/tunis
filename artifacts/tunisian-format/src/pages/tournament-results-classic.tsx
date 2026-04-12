import { useParams, useLocation } from "wouter";
import { useGetTournament } from "@workspace/api-client-react";
import BeachBackground from "@/components/beach-background";

interface Player {
  id: number;
  name: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsDiff: number;
}

interface ClassicGame {
  gameNumber: number;
  pairAKey: "A" | "B" | "C";
  pairBKey: "A" | "B" | "C";
  judgeKey: "A" | "B" | "C";
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  completed: boolean;
}

interface ClassicRound {
  round: number;
  pairs: { A: number[]; B: number[]; C: number[] };
  games: ClassicGame[];
  completed: boolean;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function TournamentResultsClassicPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: tournament, isLoading } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  const players = (tournament?.players ?? []) as Player[];
  const rounds = (tournament?.rounds ?? []) as ClassicRound[];
  const isRotating = tournament?.format === "classic-rotating";

  const sortedPlayers = [...players].sort(
    (a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff
  );

  const pairStats = !isRotating && players.length === 6
    ? [
        { label: "Пара 1", players: [players[0], players[1]] },
        { label: "Пара 2", players: [players[2], players[3]] },
        { label: "Пара 3", players: [players[4], players[5]] },
      ].map((pair) => ({
        ...pair,
        wins: pair.players.reduce((s, p) => s + p.wins, 0),
        losses: pair.players.reduce((s, p) => s + p.losses, 0),
        pointsDiff: pair.players.reduce((s, p) => s + p.pointsDiff, 0),
        gamesPlayed: Math.round(pair.players.reduce((s, p) => s + p.gamesPlayed, 0) / 2),
      })).sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff)
    : [];

  function copyToClipboard() {
    const lines: string[] = [];
    if (isRotating) {
      lines.push(`Классический формат (смена напарников) — до ${tournament?.targetScore} очков`);
      lines.push("");
      sortedPlayers.forEach((p, i) => {
        lines.push(`${i + 1}. ${p.name} — ${p.wins}П / ${p.losses}П / ${p.pointsDiff > 0 ? "+" : ""}${p.pointsDiff}`);
      });
    } else {
      lines.push(`Классический формат (фиксированные пары) — до ${tournament?.targetScore} очков`);
      lines.push("");
      pairStats.forEach((pair, i) => {
        lines.push(`${i + 1}. ${pair.players.map((p) => p.name).join(" / ")} — ${pair.wins}П / ${pair.pointsDiff > 0 ? "+" : ""}${pair.pointsDiff}`);
      });
    }
    navigator.clipboard.writeText(lines.join("\n"));
  }

  if (isLoading) {
    return (
      <BeachBackground className="flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </BeachBackground>
    );
  }

  return (
    <BeachBackground>
      <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-sky-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-slate-700">Итоги турнира</h1>
            <p className="text-xs text-slate-400">
              Классический · {isRotating ? "смена напарников" : "фиксированные пары"} · до {tournament?.targetScore} очков
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {/* Podium */}
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-4 text-center">
            {isRotating ? "Личный зачёт" : "Зачёт по парам"}
          </h2>

          {isRotating ? (
            <div className="space-y-3">
              {sortedPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl ${idx === 0 ? "bg-yellow-50 border-2 border-yellow-300" : idx === 1 ? "bg-slate-50 border-2 border-slate-300" : idx === 2 ? "bg-orange-50 border-2 border-orange-300" : "bg-white border border-slate-100"}`}
                >
                  <div className="text-2xl w-8 text-center">{MEDAL[idx] ?? `${idx + 1}.`}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.wins} побед · {p.losses} пораж.</div>
                  </div>
                  <div className={`text-lg font-bold ${p.pointsDiff > 0 ? "text-green-600" : p.pointsDiff < 0 ? "text-red-500" : "text-slate-400"}`}>
                    {p.pointsDiff > 0 ? `+${p.pointsDiff}` : p.pointsDiff}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {pairStats.map((pair, idx) => (
                <div
                  key={pair.label}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl ${idx === 0 ? "bg-yellow-50 border-2 border-yellow-300" : idx === 1 ? "bg-slate-50 border-2 border-slate-300" : "bg-orange-50 border-2 border-orange-300"}`}
                >
                  <div className="text-2xl w-8 text-center">{MEDAL[idx] ?? `${idx + 1}.`}</div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{pair.players.map((p) => p.name).join(" / ")}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{pair.wins} побед · {pair.losses} пораж.</div>
                  </div>
                  <div className={`text-lg font-bold ${pair.pointsDiff > 0 ? "text-green-600" : pair.pointsDiff < 0 ? "text-red-500" : "text-slate-400"}`}>
                    {pair.pointsDiff > 0 ? `+${pair.pointsDiff}` : pair.pointsDiff}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Round-by-round summary */}
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-slate-700 mb-4">Результаты туров</h2>
          <div className="space-y-4">
            {rounds.map((round) => (
              <div key={round.round}>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Тур {round.round} &nbsp;·&nbsp;
                  A: {round.pairs.A.map((id) => players.find((p) => p.id === id)?.name).join("+")} &nbsp;·&nbsp;
                  B: {round.pairs.B.map((id) => players.find((p) => p.id === id)?.name).join("+")} &nbsp;·&nbsp;
                  C: {round.pairs.C.map((id) => players.find((p) => p.id === id)?.name).join("+")}
                </div>
                <div className="space-y-1">
                  {round.games.map((g) => {
                    if (!g.completed) return null;
                    const winnerPairName = g.winner === "A" ? `Пара ${g.pairAKey}` : `Пара ${g.pairBKey}`;
                    const loserPairName = g.winner === "A" ? `Пара ${g.pairBKey}` : `Пара ${g.pairAKey}`;
                    const winScore = g.winner === "A" ? g.scoreA : g.scoreB;
                    const loseScore = g.winner === "A" ? g.scoreB : g.scoreA;
                    return (
                      <div key={g.gameNumber} className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-3 py-1.5">
                        <span className="text-slate-400 text-xs">И{g.gameNumber}</span>
                        <span className="font-medium text-slate-700">{winnerPairName}</span>
                        <span className="text-green-600 font-bold">{winScore}:{loseScore}</span>
                        <span className="text-slate-400">vs {loserPairName}</span>
                        <span className="text-slate-400 text-xs ml-auto">судит {g.judgeKey}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className="flex-1 text-white font-semibold py-3 rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}
          >
            Скопировать результат
          </button>
          <button
            onClick={() => navigate("/tournaments/new")}
            className="flex-1 bg-white/80 text-slate-700 font-semibold py-3 rounded-xl border border-sky-200 hover:bg-white transition-all"
          >
            Новый турнир
          </button>
        </div>
      </main>
    </BeachBackground>
  );
}
