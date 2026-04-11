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

interface Round {
  round: number;
  restingPlayerId: number;
  teamA: number[];
  teamB: number[];
  scoreA: number | null;
  scoreB: number | null;
  winner: string | null;
  completed: boolean;
}

const MEDAL_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_STYLES: Record<number, string> = {
  1: "bg-amber-50 border-amber-200",
  2: "bg-slate-50 border-slate-200",
  3: "bg-orange-50 border-orange-200",
};

export default function TournamentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: tournament, isLoading } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  if (isLoading) {
    return (
      <BeachBackground className="flex items-center justify-center">
        <div className="text-white">Загрузка...</div>
      </BeachBackground>
    );
  }

  if (!tournament) {
    return (
      <BeachBackground className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Турнир не найден</p>
          <button onClick={() => navigate("/dashboard")} className="text-white underline">Вернуться</button>
        </div>
      </BeachBackground>
    );
  }

  const players = (tournament.players ?? []) as Player[];
  const rounds = (tournament.rounds ?? []) as Round[];

  const sortedPlayers = [...players].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsDiff - a.pointsDiff;
  });

  function getPlayerName(pid: number) {
    return players.find((p) => p.id === pid)?.name ?? `Игрок ${pid}`;
  }

  function exportCSV() {
    const header = "Место,Игрок,Сыграно,Побед,Поражений,Очки\n";
    const rows = sortedPlayers.map((p, i) =>
      `${i + 1},${p.name},${p.gamesPlayed},${p.wins},${p.losses},${p.pointsDiff}`
    );
    const csv = header + rows.join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `турнир-итоги.csv`;
    a.click();
  }

  return (
    <BeachBackground>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-sky-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-slate-800">Итоги турнира</h1>
            <p className="text-xs text-slate-400">до {tournament.targetScore} очков</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Winner */}
        {sortedPlayers[0] && (
          <div className="rounded-2xl p-6 text-center shadow-sm border border-amber-200 animate-slide-up"
            style={{ background: "linear-gradient(135deg, #fef9e7, #fef3c7)" }}
          >
            <div className="text-5xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-slate-800">{sortedPlayers[0].name}</div>
            <div className="text-sm text-amber-600 font-medium mt-1">Победитель турнира</div>
            <div className="flex justify-center gap-8 mt-3 text-sm">
              <span className="text-slate-500">Побед: <strong className="text-slate-700">{sortedPlayers[0].wins}</strong></span>
              <span className="text-slate-500">Очков: <strong className={sortedPlayers[0].pointsDiff >= 0 ? "text-green-600" : "text-red-500"}>
                {sortedPlayers[0].pointsDiff > 0 ? `+${sortedPlayers[0].pointsDiff}` : sortedPlayers[0].pointsDiff}
              </strong></span>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-sky-50">
            <h2 className="font-bold text-slate-700">Итоговая таблица</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #f0fbff, #e8f8fd)" }}>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Место</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Игрок</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Сыграно</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Побед</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Пораж.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Очки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {sortedPlayers.map((player, i) => (
                  <tr key={player.id} className={`transition-colors ${MEDAL_STYLES[i + 1] ?? "hover:bg-sky-50/50"}`}>
                    <td className="px-6 py-4">
                      <span className="text-xl">{MEDAL_EMOJI[i + 1] ?? `${i + 1}.`}</span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{player.name}</td>
                    <td className="px-4 py-4 text-center text-slate-400">{player.gamesPlayed}</td>
                    <td className="px-4 py-4 text-center font-bold text-green-600">{player.wins}</td>
                    <td className="px-4 py-4 text-center text-slate-400">{player.losses}</td>
                    <td className={`px-4 py-4 text-center font-bold ${player.pointsDiff > 0 ? "text-green-600" : player.pointsDiff < 0 ? "text-red-400" : "text-slate-400"}`}>
                      {player.pointsDiff > 0 ? `+${player.pointsDiff}` : player.pointsDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rounds summary */}
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-sky-50">
            <h2 className="font-bold text-slate-700">Сводка туров</h2>
          </div>
          <div className="divide-y divide-sky-50">
            {rounds.map((r) => (
              <div key={r.round} className="px-6 py-3 flex items-center gap-3 text-sm">
                <span className="w-12 text-slate-400 shrink-0 font-medium">Тур {r.round}</span>
                <span className="flex-1 text-slate-600">
                  <span className={r.winner === "A" ? "font-bold text-green-600" : ""}>{r.teamA.map(getPlayerName).join(" & ")}</span>
                  {r.completed ? (
                    <span className="mx-2 text-slate-400">{r.scoreA} : {r.scoreB}</span>
                  ) : (
                    <span className="mx-2 text-slate-300">vs</span>
                  )}
                  <span className={r.winner === "B" ? "font-bold text-green-600" : ""}>{r.teamB.map(getPlayerName).join(" & ")}</span>
                </span>
                <span className="text-xs text-slate-300 shrink-0">пропуск: {getPlayerName(r.restingPlayerId)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={() => navigate("/tournaments/new")}
            className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
            style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}
          >
            Начать новый турнир
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 py-3 rounded-xl border-2 border-sky-200 bg-white text-slate-600 font-semibold hover:border-sky-400 hover:bg-sky-50 transition-all"
          >
            Скачать CSV
          </button>
        </div>
      </main>
    </BeachBackground>
  );
}
