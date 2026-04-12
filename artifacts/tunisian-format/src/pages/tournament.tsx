import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import {
  useGetTournament,
  useUpdateRound,
  getGetTournamentQueryKey,
} from "@workspace/api-client-react";
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

interface Round {
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

export default function TournamentPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: tournament, isLoading, error } = useGetTournament(id ?? "", {
    query: { enabled: !!id },
  });

  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [scoreError, setScoreError] = useState("");
  const [editingTeams, setEditingTeams] = useState(false);
  const [editTeamA, setEditTeamA] = useState<number[]>([]);
  const [editTeamB, setEditTeamB] = useState<number[]>([]);

  const [savedRound, setSavedRound] = useState<number | null>(null);

  const updateMutation = useUpdateRound({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetTournamentQueryKey(id ?? ""), data);
        setScoreError("");
        if (data.status === "finished") {
          navigate(`/tournaments/${id}/results`);
          return;
        }
        setSavedRound(selectedRound);
        setTimeout(() => setSavedRound(null), 1200);
        const updatedRounds = (data.rounds ?? []) as Round[];
        const nextIncomplete = updatedRounds.find((r) => !r.completed);
        if (nextIncomplete) {
          setTimeout(() => setSelectedRound(nextIncomplete.round), 600);
        }
      },
      onError: (err: any) => {
        setScoreError(err?.data?.error ?? "Ошибка сохранения");
      },
    },
  });

  const rounds = (tournament?.rounds ?? []) as Round[];
  const players = (tournament?.players ?? []) as Player[];

  useEffect(() => {
    if (tournament && rounds.length > 0) {
      const firstIncomplete = rounds.find((r) => !r.completed);
      if (firstIncomplete) setSelectedRound(firstIncomplete.round);
    }
  }, [tournament?.id]);

  const currentRound = rounds.find((r) => r.round === selectedRound);

  useEffect(() => {
    if (currentRound) {
      setScoreA(currentRound.scoreA?.toString() ?? "");
      setScoreB(currentRound.scoreB?.toString() ?? "");
      setScoreError("");
      setEditingTeams(false);
    }
  }, [selectedRound, tournament]);

  function getPlayerName(id: number) {
    return players.find((p) => p.id === id)?.name ?? `Игрок ${id}`;
  }

  function handleScoreAChange(val: string) {
    setScoreA(val);
    setScoreError("");
    const num = parseInt(val);
    const target = tournament?.targetScore;
    if (!isNaN(num) && target) {
      if (num < target) {
        // Минимально возможный счёт проигравшей команды → автоподстановка максимума
        setScoreB(target.toString());
      } else if (num === target) {
        // Максимальный счёт → противоположное поле оставить пустым
        setScoreB("");
      }
    }
  }

  function handleScoreBChange(val: string) {
    setScoreB(val);
    setScoreError("");
    const num = parseInt(val);
    const target = tournament?.targetScore;
    if (!isNaN(num) && target) {
      if (num < target) {
        setScoreA(target.toString());
      } else if (num === target) {
        setScoreA("");
      }
    }
  }

  function handleSaveScore() {
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b)) {
      setScoreError("Введите счёт для обеих команд");
      return;
    }
    setScoreError("");
    updateMutation.mutate({
      id,
      roundNumber: selectedRound,
      data: { scoreA: a, scoreB: b, teamA: null, teamB: null },
    });
  }

  function startEditingTeams() {
    if (!currentRound) return;
    setEditTeamA([...currentRound.teamA]);
    setEditTeamB([...currentRound.teamB]);
    setEditingTeams(true);
  }

  function togglePlayerInTeam(playerId: number, fromTeam: "A" | "B") {
    if (fromTeam === "A") {
      const swapWith = editTeamB[0];
      setEditTeamA((prev) => prev.map((id) => (id === playerId ? swapWith : id)));
      setEditTeamB((prev) => prev.map((id) => (id === swapWith ? playerId : id)));
    } else {
      const swapWith = editTeamA[0];
      setEditTeamB((prev) => prev.map((id) => (id === playerId ? swapWith : id)));
      setEditTeamA((prev) => prev.map((id) => (id === swapWith ? playerId : id)));
    }
  }

  function saveTeams() {
    updateMutation.mutate({
      id,
      roundNumber: selectedRound,
      data: { teamA: editTeamA, teamB: editTeamB, scoreA: null, scoreB: null },
    });
    setEditingTeams(false);
  }

  const completedRounds = rounds.filter((r) => r.completed).length;
  const progress = (completedRounds / 15) * 100;

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
          <button onClick={() => navigate("/dashboard")} className="text-white underline">
            Вернуться
          </button>
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
                <div className="text-xs text-slate-400">до {tournament.targetScore} очков</div>
              </div>
            </div>
            <div className="text-sm font-medium text-slate-500">{completedRounds}/15</div>
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
          <div className="grid grid-cols-5 gap-1.5">
            {rounds.map((r) => (
              <button
                key={r.round}
                onClick={() => setSelectedRound(r.round)}
                className={`py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  savedRound === r.round
                    ? "bg-green-500 text-white scale-110 shadow-md"
                    : selectedRound === r.round
                    ? "text-white shadow-sm"
                    : r.completed
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-white/70 text-slate-600 hover:bg-white/90 hover:text-foreground backdrop-blur-sm"
                }`}
                style={selectedRound === r.round && savedRound !== r.round ? { background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" } : {}}
              >
                {r.round}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {currentRound && (
            <>
              {/* Round card */}
              <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl overflow-hidden shadow-sm">
                {/* Round header */}
                <div className="bg-muted/50 px-6 py-4 flex items-center justify-between border-b border-border">
                  <div>
                    <div className="font-bold text-foreground">Тур {currentRound.round}</div>
                    <div className="text-sm text-muted-foreground">
                      Пропускает: <span className="font-medium text-foreground">{getPlayerName(currentRound.restingPlayerId)}</span>
                    </div>
                  </div>
                  {currentRound.completed && (
                    <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
                      Завершён
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {/* Teams */}
                  {!editingTeams ? (
                    <div className="flex items-stretch gap-4 mb-6">
                      {/* Team A */}
                      <div className={`flex-1 rounded-xl p-4 border-2 transition-all ${currentRound.completed && currentRound.winner === "A" ? "border-green-400 bg-green-50" : "border-border bg-background"}`}>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Команда A {currentRound.completed && currentRound.winner === "A" && "🏆"}
                        </div>
                        {currentRound.teamA.map((pid) => (
                          <div key={pid} className="font-semibold text-foreground py-0.5">{getPlayerName(pid)}</div>
                        ))}
                        {currentRound.completed && (
                          <div className="mt-2 text-2xl font-bold text-foreground">{currentRound.scoreA}</div>
                        )}
                      </div>

                      <div className="flex items-center justify-center text-muted-foreground font-bold text-lg">vs</div>

                      {/* Team B */}
                      <div className={`flex-1 rounded-xl p-4 border-2 transition-all ${currentRound.completed && currentRound.winner === "B" ? "border-green-400 bg-green-50" : "border-border bg-background"}`}>
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Команда Б {currentRound.completed && currentRound.winner === "B" && "🏆"}
                        </div>
                        {currentRound.teamB.map((pid) => (
                          <div key={pid} className="font-semibold text-foreground py-0.5">{getPlayerName(pid)}</div>
                        ))}
                        {currentRound.completed && (
                          <div className="mt-2 text-2xl font-bold text-foreground">{currentRound.scoreB}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        Перетасуйте игроков между командами. Пропускающий ({getPlayerName(currentRound.restingPlayerId)}) остаётся прежним.
                      </p>
                      <div className="flex gap-4">
                        <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Команда A</div>
                          {editTeamA.map((pid) => (
                            <button
                              key={pid}
                              onClick={() => togglePlayerInTeam(pid, "A")}
                              className="block w-full text-left font-semibold text-foreground py-1.5 px-3 rounded-lg hover:bg-blue-100 transition-all"
                            >
                              {getPlayerName(pid)}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center text-muted-foreground font-bold">⇄</div>
                        <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                          <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-3">Команда Б</div>
                          {editTeamB.map((pid) => (
                            <button
                              key={pid}
                              onClick={() => togglePlayerInTeam(pid, "B")}
                              className="block w-full text-left font-semibold text-foreground py-1.5 px-3 rounded-lg hover:bg-orange-100 transition-all"
                            >
                              {getPlayerName(pid)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={saveTeams}
                          className="bg-primary text-primary-foreground font-medium px-4 py-2 rounded-xl transition-all hover:bg-primary/90 text-sm"
                        >
                          Сохранить пары
                        </button>
                        <button
                          onClick={() => setEditingTeams(false)}
                          className="bg-muted text-muted-foreground font-medium px-4 py-2 rounded-xl transition-all hover:bg-muted/80 text-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Score input */}
                  {!editingTeams && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Счёт команды A</label>
                          <input
                            type="number"
                            min="0"
                            value={scoreA}
                            onChange={(e) => handleScoreAChange(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="0"
                          />
                        </div>
                        <div className="text-muted-foreground font-bold text-xl mt-5">:</div>
                        <div className="flex-1">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Счёт команды Б</label>
                          <input
                            type="number"
                            min="0"
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
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all disabled:opacity-60"
                      >
                        {updateMutation.isPending ? "Сохранение..." : "Сохранить результат тура"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </BeachBackground>
  );
}
