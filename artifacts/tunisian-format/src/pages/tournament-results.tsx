import { useParams, useLocation } from "wouter";
import { useGetTournament } from "@workspace/api-client-react";

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

const MEDALS: Record<number, string> = {
  1: "золото",
  2: "серебро",
  3: "бронза",
};

const MEDAL_STYLES: Record<number, string> = {
  1: "bg-amber-50 border-amber-300",
  2: "bg-slate-50 border-slate-300",
  3: "bg-orange-50 border-orange-300",
};

export default function TournamentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: tournament, isLoading } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Турнир не найден</p>
          <button onClick={() => navigate("/dashboard")} className="text-primary hover:underline">Вернуться</button>
        </div>
      </div>
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

  function copyResults() {
    const lines = ["Итоги турнира\n", "Место | Игрок | Сыграно | Побед | Поражений | Очки"];
    sortedPlayers.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.name} | ${p.gamesPlayed} | ${p.wins} | ${p.losses} | ${p.pointsDiff}`);
    });
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      alert("Скопировано в буфер обмена");
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-foreground">Итоги турнира</h1>
            <p className="text-xs text-muted-foreground">до {tournament.targetScore} очков</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Winner highlight */}
        {sortedPlayers[0] && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-xl font-bold text-foreground">{sortedPlayers[0].name}</div>
            <div className="text-sm text-amber-700 mt-1">Победитель турнира</div>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <span className="text-muted-foreground">Побед: <strong className="text-foreground">{sortedPlayers[0].wins}</strong></span>
              <span className="text-muted-foreground">Очков: <strong className={sortedPlayers[0].pointsDiff >= 0 ? "text-green-600" : "text-red-500"}>{sortedPlayers[0].pointsDiff > 0 ? `+${sortedPlayers[0].pointsDiff}` : sortedPlayers[0].pointsDiff}</strong></span>
            </div>
          </div>
        )}

        {/* Results table */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Итоговая таблица</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Место</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Игрок</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Сыграно</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Побед</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Поражений</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Очки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPlayers.map((player, i) => (
                  <tr key={player.id} className={`transition-colors ${MEDAL_STYLES[i + 1] ?? "hover:bg-muted/30"}`}>
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground">{i + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-foreground">{player.name}</div>
                      {MEDALS[i + 1] && <div className="text-xs text-muted-foreground capitalize">{MEDALS[i + 1]}</div>}
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{player.gamesPlayed}</td>
                    <td className="px-4 py-4 text-center font-bold text-green-600">{player.wins}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground">{player.losses}</td>
                    <td className={`px-4 py-4 text-center font-bold ${player.pointsDiff > 0 ? "text-green-600" : player.pointsDiff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {player.pointsDiff > 0 ? `+${player.pointsDiff}` : player.pointsDiff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rounds summary */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Сводка туров</h2>
          </div>
          <div className="divide-y divide-border">
            {rounds.map((r) => (
              <div key={r.round} className="px-6 py-3 flex items-center gap-4 text-sm">
                <span className="w-14 text-muted-foreground shrink-0">Тур {r.round}</span>
                <span className="text-muted-foreground shrink-0">
                  Пропускает: <span className="text-foreground">{getPlayerName(r.restingPlayerId)}</span>
                </span>
                <span className="flex-1 text-center text-foreground">
                  {r.teamA.map(getPlayerName).join(" & ")}
                  {r.completed && (
                    <span className={`mx-2 font-bold ${r.winner === "A" ? "text-green-600" : "text-foreground"}`}>
                      {r.scoreA}
                    </span>
                  )}
                  {!r.completed && <span className="mx-2 text-muted-foreground">vs</span>}
                  {r.completed && (
                    <span className={`mx-2 font-bold ${r.winner === "B" ? "text-green-600" : "text-foreground"}`}>
                      {r.scoreB}
                    </span>
                  )}
                  {r.teamB.map(getPlayerName).join(" & ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/tournaments/new")}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-sm text-center"
          >
            Начать новый турнир
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 bg-card border border-border text-foreground font-semibold py-3 rounded-xl transition-all hover:bg-muted text-center"
          >
            Скачать CSV
          </button>
          <button
            onClick={copyResults}
            className="flex-1 bg-card border border-border text-foreground font-semibold py-3 rounded-xl transition-all hover:bg-muted text-center"
          >
            Копировать результаты
          </button>
        </div>
      </main>
    </div>
  );
}
