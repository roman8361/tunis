import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTournament, useUpdateRound, getGetTournamentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
  judgeKey?: "A" | "B" | "C";
  scoreA: number | null;
  scoreB: number | null;
  winner: "A" | "B" | null;
  completed: boolean;
}

interface ClassicRound {
  round: number;
  pairs: { A: number[]; B: number[]; C?: number[] };
  games: ClassicGame[];
  completed: boolean;
}

export default function TournamentClassicPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: tournament, isLoading, error } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [selectedGame, setSelectedGame] = useState<number>(1);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [scoreError, setScoreError] = useState("");
  const [savedGame, setSavedGame] = useState<string | null>(null);

  const updateMutation = useUpdateRound({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetTournamentQueryKey(id ?? ""), data);
        setScoreError("");
        if (data.status === "finished") {
          navigate(`/tournaments/${id}/results`);
          return;
        }
        setSavedGame(`${selectedRound}-${selectedGame}`);
        setTimeout(() => setSavedGame(null), 1200);

        const updatedRounds = (data.rounds ?? []) as ClassicRound[];
        const curRound = updatedRounds.find((r) => r.round === selectedRound);
        if (curRound) {
          const nextGame = curRound.games.find((g) => !g.completed);
          if (nextGame) {
            setTimeout(() => setSelectedGame(nextGame.gameNumber), 400);
            return;
          }
        }
        const nextIncompleteRound = updatedRounds.find((r) => !r.completed);
        if (nextIncompleteRound) {
          setTimeout(() => {
            setSelectedRound(nextIncompleteRound.round);
            setSelectedGame(1);
          }, 600);
        }
      },
      onError: (err: any) => {
        setScoreError(err?.data?.error ?? "Ошибка сохранения");
      },
    },
  });

  const rounds = (tournament?.rounds ?? []) as ClassicRound[];
  const players = (tournament?.players ?? []) as Player[];
  const isRotating = tournament?.format?.startsWith("classic-rotating") || tournament?.format?.startsWith("classic4-rotating");
  const isBalanced = tournament?.format?.endsWith("-balanced") ?? false;

  useEffect(() => {
    if (rounds.length > 0) {
      const firstIncomplete = rounds.find((r) => !r.completed);
      if (firstIncomplete) {
        setSelectedRound(firstIncomplete.round);
        const firstIncompleteGame = firstIncomplete.games.find((g) => !g.completed);
        setSelectedGame(firstIncompleteGame?.gameNumber ?? 1);
      }
    }
  }, [tournament?.id]);

  const currentRound = rounds.find((r) => r.round === selectedRound);
  const currentGame = currentRound?.games.find((g) => g.gameNumber === selectedGame);

  useEffect(() => {
    if (currentGame) {
      setScoreA(currentGame.scoreA?.toString() ?? "");
      setScoreB(currentGame.scoreB?.toString() ?? "");
      setScoreError("");
    }
  }, [selectedRound, selectedGame, tournament]);

  function getPairName(roundData: ClassicRound, key: "A" | "B" | "C"): string {
    const pairIds = roundData.pairs[key] ?? [];
    return pairIds.map((pid) => players.find((p) => p.id === pid)?.name ?? `Игрок ${pid}`).join(" + ");
  }

  function handleScoreAChange(val: string) {
    setScoreA(val);
    setScoreError("");
    if (isBalanced) return;
    const num = parseInt(val);
    const target = tournament?.targetScore;
    if (!isNaN(num) && target) {
      if (num < target) setScoreB(target.toString());
      else if (num === target) setScoreB("");
    }
  }

  function handleScoreBChange(val: string) {
    setScoreB(val);
    setScoreError("");
    if (isBalanced) return;
    const num = parseInt(val);
    const target = tournament?.targetScore;
    if (!isNaN(num) && target) {
      if (num < target) setScoreA(target.toString());
      else if (num === target) setScoreA("");
    }
  }

  function handleSaveScore() {
    if (!/^\d+$/.test(scoreA) || !/^\d+$/.test(scoreB)) {
      setScoreError("Введите счёт для обеих пар");
      return;
    }
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (isBalanced && (a > 100 || b > 100)) {
      setScoreError("Счёт должен быть числом от 0 до 100");
      return;
    }
    setScoreError("");
    updateMutation.mutate({
      id,
      roundNumber: selectedRound,
      data: { scoreA: a, scoreB: b, teamA: null, teamB: null, gameNumber: selectedGame },
    });
  }

  const completedRounds = rounds.filter((r) => r.completed).length;
  const totalRounds = rounds.length || 1;
  const progress = (completedRounds / totalRounds) * 100;

  const sortedPlayers = isRotating
    ? [...players].sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff)
    : players;

  const pairs = !isRotating && (players.length === 6 || players.length === 4)
    ? Array.from({ length: players.length / 2 }, (_, i) => ({
        label: `Пара ${i + 1}`,
        players: [players[i * 2], players[i * 2 + 1]],
      })).map((pair) => ({
        ...pair,
        wins: pair.players.reduce((s, p) => s + p.wins, 0) / 2,
        losses: pair.players.reduce((s, p) => s + p.losses, 0) / 2,
        pointsDiff: pair.players.reduce((s, p) => s + p.pointsDiff, 0) / 2,
        gamesPlayed: pair.players.reduce((s, p) => s + p.gamesPlayed, 0) / 2,
      })).sort((a, b) => b.wins - a.wins || b.pointsDiff - a.pointsDiff)
    : [];

  if (isLoading) {
    return (
      <BeachBackground className="flex items-center justify-center">
        <div className="text-white">Загрузка турнира...</div>
      </BeachBackground>
    );
  }

  if (error || !tournament) {
    return (
      <BeachBackground className="flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Турнир не найден</p>
          <button onClick={() => navigate("/dashboard")} className="text-white underline">Вернуться</button>
        </div>
      </BeachBackground>
    );
  }

  return (
    <BeachBackground className="flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-1.5 hover:bg-sky-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  {players.map((p) => p.name).join(" · ")}
                </div>
                <div className="text-xs text-slate-400">
                  Классический · до {tournament.targetScore} очков ·{" "}
                  {isRotating ? "смена напарников" : "фиксированные пары"}
                  {isBalanced ? " · с балансом" : ""}
                </div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500">{completedRounds}/{totalRounds}</div>
          </div>
          <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #4BBCD4, #f97316)" }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 flex flex-col gap-4">

        {/* Round tabs — above main content */}
        <div>
          <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">Туры</div>
          <div className="flex gap-2">
            {rounds.map((r) => (
              <button
                key={r.round}
                onClick={() => {
                  setSelectedRound(r.round);
                  const firstIncomplete = r.games.find((g) => !g.completed);
                  setSelectedGame(firstIncomplete?.gameNumber ?? 1);
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedRound === r.round
                    ? "text-white shadow-sm"
                    : r.completed
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-white/70 text-slate-600 hover:bg-white/90 backdrop-blur-sm"
                }`}
                style={selectedRound === r.round ? { background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" } : {}}
              >
                {r.round}
              </button>
            ))}
          </div>
        </div>

        {/* Main card */}
        {currentRound && (
          <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-sm">
            {/* Round header */}
            <div className="bg-muted/50 px-5 py-3.5 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">Тур {currentRound.round}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-slate-600">A:</span> {getPairName(currentRound, "A")} &nbsp;·&nbsp;
                    <span className="font-medium text-slate-600">B:</span> {getPairName(currentRound, "B")}
                    {currentRound.pairs.C && (
                      <>
                        &nbsp;·&nbsp;<span className="font-medium text-slate-600">C:</span> {getPairName(currentRound, "C")}
                      </>
                    )}
                  </div>
                </div>
                {currentRound.completed && (
                  <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                    Завершён
                  </span>
                )}
              </div>
            </div>

            {/* Game tabs + content */}
            <div className="px-5 pt-4 pb-5">
              {/* Game tabs */}
              <div className="flex gap-2 mb-4">
                {currentRound.games.map((g) => {
                  const isSaved = savedGame === `${selectedRound}-${g.gameNumber}`;
                  return (
                    <button
                      key={g.gameNumber}
                      onClick={() => setSelectedGame(g.gameNumber)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                        isSaved
                          ? "bg-green-500 text-white scale-105 shadow-md"
                          : selectedGame === g.gameNumber
                          ? "text-white shadow-sm"
                          : g.completed
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      style={selectedGame === g.gameNumber && !isSaved ? { background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" } : {}}
                    >
                      Игра {g.gameNumber}
                    </button>
                  );
                })}
              </div>

              {currentGame && (
                <>
                  {currentGame.judgeKey && (
                    <div className="text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl px-3 py-2">
                      Судит пара <span className="font-semibold text-slate-700">{currentGame.judgeKey}</span>:{" "}
                      {getPairName(currentRound, currentGame.judgeKey)}
                    </div>
                  )}

                  {/* Teams */}
                  <div className="flex items-stretch gap-4 mb-5">
                    <div className={`flex-1 rounded-xl p-4 border-2 transition-all ${currentGame.completed && currentGame.winner === "A" ? "border-green-400 bg-green-50" : "border-border bg-background"}`}>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Пара {currentGame.pairAKey} {currentGame.completed && currentGame.winner === "A" && "🏆"}
                      </div>
                      <div className="font-semibold text-foreground">{getPairName(currentRound, currentGame.pairAKey)}</div>
                      {currentGame.completed && (
                        <div className="mt-2 text-2xl font-bold text-foreground">{currentGame.scoreA}</div>
                      )}
                    </div>

                    <div className="flex items-center justify-center text-muted-foreground font-bold text-lg">vs</div>

                    <div className={`flex-1 rounded-xl p-4 border-2 transition-all ${currentGame.completed && currentGame.winner === "B" ? "border-green-400 bg-green-50" : "border-border bg-background"}`}>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Пара {currentGame.pairBKey} {currentGame.completed && currentGame.winner === "B" && "🏆"}
                      </div>
                      <div className="font-semibold text-foreground">{getPairName(currentRound, currentGame.pairBKey)}</div>
                      {currentGame.completed && (
                        <div className="mt-2 text-2xl font-bold text-foreground">{currentGame.scoreB}</div>
                      )}
                    </div>
                  </div>

                  {/* Score input */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Счёт пары {currentGame.pairAKey}</label>
                      <input
                        type="number"
                        min="0"
                        max={isBalanced ? 100 : undefined}
                        step="1"
                        inputMode="numeric"
                        value={scoreA}
                        onChange={(e) => handleScoreAChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                      />
                    </div>
                    <div className="text-muted-foreground font-bold text-xl mt-5">:</div>
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Счёт пары {currentGame.pairBKey}</label>
                      <input
                        type="number"
                        min="0"
                        max={isBalanced ? 100 : undefined}
                        step="1"
                        inputMode="numeric"
                        value={scoreB}
                        onChange={(e) => handleScoreBChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {scoreError && (
                    <div className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 mb-3">
                      {scoreError}
                    </div>
                  )}

                  <button
                    onClick={handleSaveScore}
                    disabled={updateMutation.isPending}
                    className="w-full text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60 hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}
                  >
                    {updateMutation.isPending ? "Сохранение..." : "Сохранить результат игры"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Stats table — below main content */}
        <div>
          <div className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            {isRotating ? "Игроки" : "Пары"}
          </div>
          <div className="bg-white/85 backdrop-blur rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 gap-0 px-4 py-2 bg-white/50 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <div className="col-span-2">Имя</div>
              <div className="text-center">Победы</div>
              <div className="text-center">±</div>
            </div>
            {isRotating
              ? sortedPlayers.map((p, idx) => (
                  <div key={p.id} className={`grid grid-cols-4 gap-0 px-4 py-2.5 border-t border-white/40 ${idx === 0 && p.gamesPlayed > 0 ? "bg-yellow-50/80" : ""}`}>
                    <div className="col-span-2 font-medium text-slate-700 truncate text-sm">{p.name}</div>
                    <div className="text-center text-slate-600 text-sm">{p.wins}</div>
                    <div className={`text-center font-medium text-sm ${p.pointsDiff > 0 ? "text-green-600" : p.pointsDiff < 0 ? "text-red-500" : "text-slate-400"}`}>
                      {p.pointsDiff > 0 ? `+${p.pointsDiff}` : p.pointsDiff}
                    </div>
                  </div>
                ))
              : pairs.map((pair, idx) => (
                  <div key={pair.label} className={`grid grid-cols-4 gap-0 px-4 py-2.5 border-t border-white/40 ${idx === 0 && pair.gamesPlayed > 0 ? "bg-yellow-50/80" : ""}`}>
                    <div className="col-span-2 font-medium text-slate-700 truncate text-sm">
                      {pair.players.map((p) => p.name).join(" / ")}
                    </div>
                    <div className="text-center text-slate-600 text-sm">{pair.wins}</div>
                    <div className={`text-center font-medium text-sm ${pair.pointsDiff > 0 ? "text-green-600" : pair.pointsDiff < 0 ? "text-red-500" : "text-slate-400"}`}>
                      {pair.pointsDiff > 0 ? `+${pair.pointsDiff}` : pair.pointsDiff}
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

      </div>
    </BeachBackground>
  );
}
