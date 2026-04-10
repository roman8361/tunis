import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTournament, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const TARGET_SCORES = [11, 15, 21];

export default function NewTournamentPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState(["", "", "", "", ""]);
  const [errors, setErrors] = useState<string[]>([]);
  const [globalError, setGlobalError] = useState("");

  const createMutation = useCreateTournament({
    mutation: {
      onSuccess: (tournament) => {
        queryClient.invalidateQueries({ queryKey: getListTournamentsQueryKey() });
        navigate(`/tournaments/${tournament.id}`);
      },
      onError: (err: any) => {
        setGlobalError(err?.data?.error ?? "Ошибка создания турнира");
      },
    },
  });

  function updateName(index: number, value: string) {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
    const newErrors = [...errors];
    newErrors[index] = "";
    setErrors(newErrors);
    setGlobalError("");
  }

  function validate() {
    const newErrors = ["", "", "", "", ""];
    let valid = true;

    if (!targetScore) {
      setGlobalError("Выберите лимит очков");
      return false;
    }

    const trimmed = playerNames.map((n) => n.trim());
    for (let i = 0; i < 5; i++) {
      if (!trimmed[i]) {
        newErrors[i] = "Введите имя игрока";
        valid = false;
      }
    }

    const uniqueNames = new Set(trimmed.filter(Boolean).map((n) => n.toLowerCase()));
    if (uniqueNames.size !== trimmed.filter(Boolean).length) {
      setGlobalError("Имена игроков не должны повторяться");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate({
      data: {
        targetScore: targetScore!,
        playerNames: playerNames.map((n) => n.trim()),
      },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-foreground">Новый турнир</h1>
            <p className="text-xs text-muted-foreground">Тунисский формат — 5 игроков, 15 туров</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target score */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Лимит очков</h2>
            <div className="flex gap-3">
              {TARGET_SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setTargetScore(score)}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border-2 ${
                    targetScore === score
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Игроки</h2>
            <div className="space-y-3">
              {playerNames.map((name, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateName(i, e.target.value)}
                      placeholder={`Игрок ${i + 1}`}
                      className={`flex-1 px-3.5 py-2.5 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all ${errors[i] ? "border-destructive" : "border-input"}`}
                      disabled={createMutation.isPending}
                    />
                  </div>
                  {errors[i] && (
                    <p className="text-xs text-destructive mt-1 ml-11">{errors[i]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {globalError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
              {globalError}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all shadow-sm disabled:opacity-60"
          >
            {createMutation.isPending ? "Создание..." : "Начать турнир"}
          </button>
        </form>
      </main>
    </div>
  );
}
