import { useState } from "react";
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

const MEDAL_EMOJI: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_STYLES: Record<number, string> = {
  1: "bg-amber-50 border-amber-200",
  2: "bg-slate-50 border-slate-200",
  3: "bg-orange-50 border-orange-200",
};

function EmailModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend: (emails: string) => void;
}) {
  const [emails, setEmails] = useState("");
  const [error, setError] = useState("");

  function handleSend() {
    const trimmed = emails.trim();
    if (!trimmed) { setError("Введите хотя бы один адрес"); return; }
    const list = trimmed.split(",").map((e) => e.trim()).filter(Boolean);
    const invalid = list.filter((e) => !e.includes("@"));
    if (invalid.length > 0) { setError(`Некорректный адрес: ${invalid[0]}`); return; }
    onSend(list.join(","));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Отправить результаты</h3>
            <p className="text-xs text-slate-400">Несколько адресов — через запятую</p>
          </div>
        </div>

        <textarea
          value={emails}
          onChange={(e) => { setEmails(e.target.value); setError(""); }}
          placeholder="ivan@example.ru, maria@example.ru"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-sky-200 text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none text-sm"
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TournamentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [showEmailModal, setShowEmailModal] = useState(false);

  const { data: tournament, isLoading } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #c8eef8, #fff8e8)" }}>
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #c8eef8, #fff8e8)" }}>
        <div className="text-center">
          <p className="text-slate-400 mb-4">Турнир не найден</p>
          <button onClick={() => navigate("/dashboard")} className="text-sky-500 hover:underline">Вернуться</button>
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

  function buildEmailBody(): string {
    const sep = "─".repeat(40);
    const winner = sortedPlayers[0];
    let body = `🏐 ИТОГИ ТУРНИРА — ТУНИССКИЙ ФОРМАТ\n`;
    body += `Лимит очков: ${tournament.targetScore}\n`;
    body += `${sep}\n\n`;
    body += `🏆 ПОБЕДИТЕЛЬ: ${winner?.name ?? "—"}\n`;
    body += `   Побед: ${winner?.wins ?? 0}  |  Разница очков: ${winner?.pointsDiff ?? 0}\n\n`;
    body += `ИТОГОВАЯ ТАБЛИЦА\n${sep}\n`;
    body += `Место  Игрок            Сыграно  Побед  Пораж.  Очки\n`;
    sortedPlayers.forEach((p, i) => {
      const medal = MEDAL_EMOJI[i + 1] ?? "  ";
      body += `${medal} ${String(i + 1).padEnd(4)} ${p.name.padEnd(16)} ${String(p.gamesPlayed).padEnd(8)} ${String(p.wins).padEnd(6)} ${String(p.losses).padEnd(7)} ${p.pointsDiff > 0 ? "+" : ""}${p.pointsDiff}\n`;
    });
    body += `\n${sep}\nСВОДКА ТУРОВ\n${sep}\n`;
    rounds.forEach((r) => {
      const teamA = r.teamA.map(getPlayerName).join(" & ");
      const teamB = r.teamB.map(getPlayerName).join(" & ");
      const score = r.completed ? `${r.scoreA} : ${r.scoreB}` : "не сыгран";
      const rest = getPlayerName(r.restingPlayerId);
      body += `Тур ${r.round}: ${teamA} vs ${teamB} — ${score} (пропускает: ${rest})\n`;
    });
    body += `\n${sep}\nОтправлено из сервиса «Тунисский формат»`;
    return body;
  }

  function handleSendEmail(emails: string) {
    const subject = encodeURIComponent("Итоги турнира — Тунисский формат");
    const body = encodeURIComponent(buildEmailBody());
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`);
    setShowEmailModal(false);
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #c8eef8 0%, #e8f8fd 40%, #fff8e8 100%)" }}>
      {showEmailModal && (
        <EmailModal
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-sky-100">
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
        <div className="bg-white/80 backdrop-blur border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
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
        <div className="bg-white/80 backdrop-blur border border-sky-100 rounded-2xl overflow-hidden shadow-sm">
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
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex-1 py-3 rounded-xl border-2 border-orange-200 bg-white text-orange-500 font-semibold hover:border-orange-400 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Отправить результаты
          </button>
        </div>
      </main>
    </div>
  );
}
