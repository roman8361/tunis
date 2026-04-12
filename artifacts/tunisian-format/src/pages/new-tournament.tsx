import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useCreateTournament, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import BeachBackground from "@/components/beach-background";

const TARGET_SCORES = [11, 15, 21];

const DEFAULT_NAMES_TUNISIAN = [
  "Мыськив",
  "Архипов",
  "Веретюк",
  "Егорова",
  "Мотрич",
];

const DEFAULT_NAMES_CLASSIC = [
  "Мыськив",
  "Архипов",
  "Веретюк",
  "Егорова",
  "Мотрич",
  "Ганенко",
];

export default function NewTournamentPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isClassic = params.get("mode") === "classic";

  const defaultNames = isClassic ? DEFAULT_NAMES_CLASSIC : DEFAULT_NAMES_TUNISIAN;
  const playerCount = isClassic ? 6 : 5;

  const queryClient = useQueryClient();
  const [targetScore, setTargetScore] = useState<number | null>(null);
  const [playerNames, setPlayerNames] = useState(Array(playerCount).fill(""));
  const [errors, setErrors] = useState<string[]>(Array(playerCount).fill(""));
  const [globalError, setGlobalError] = useState("");
  const [newPartnerEachRound, setNewPartnerEachRound] = useState(false);

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

  function getEffectiveName(index: number): string {
    return playerNames[index].trim() || defaultNames[index];
  }

  function validate() {
    const newErrors = Array(playerCount).fill("");
    let valid = true;

    if (!targetScore) {
      setGlobalError("Выберите лимит очков");
      return false;
    }

    const effective = playerNames.map((_, i) => getEffectiveName(i));
    const uniqueNames = new Set(effective.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== effective.length) {
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
        playerNames: playerNames.map((_, i) => getEffectiveName(i)),
      },
    });
  }

  return (
    <BeachBackground>
      {/* Header */}
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
            <h1 className="font-bold text-slate-700">Новый турнир</h1>
            <p className="text-xs text-slate-400">
              {isClassic
                ? "Классический формат — 6 игроков, 5 туров"
                : "Тунисский формат — 5 игроков, 15 туров"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target score */}
          <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4">Лимит очков</h2>
            <div className="flex gap-3">
              {TARGET_SCORES.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setTargetScore(score)}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all border-2 ${
                    targetScore === score
                      ? "text-white border-transparent shadow-sm"
                      : "bg-white text-slate-600 border-sky-200 hover:border-sky-400"
                  }`}
                  style={targetScore === score ? { background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" } : {}}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Players */}
          <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-slate-700 mb-4">Игроки</h2>
            <div className="space-y-3">
              {playerNames.map((name, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0" style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}>
                      {i + 1}
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateName(i, e.target.value)}
                      placeholder={defaultNames[i]}
                      maxLength={20}
                      className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border bg-white text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${errors[i] ? "border-red-300 focus:ring-red-200" : "border-sky-200 focus:ring-sky-200"}`}
                      disabled={createMutation.isPending}
                    />
                  </div>
                  {errors[i] && (
                    <p className="text-xs text-red-400 mt-1 ml-11">{errors[i]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Classic mode extra option */}
            {isClassic && (
              <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
                <div
                  onClick={() => setNewPartnerEachRound((v) => !v)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                    newPartnerEachRound
                      ? "border-transparent"
                      : "border-sky-300 bg-white"
                  }`}
                  style={newPartnerEachRound ? { background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" } : {}}
                >
                  {newPartnerEachRound && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-slate-600 text-sm font-medium">со сменой напарника каждый тур</span>
              </label>
            )}
          </div>

          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-xl px-4 py-3">
              {globalError}
            </div>
          )}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full text-white font-semibold py-3 rounded-xl transition-all shadow-sm disabled:opacity-60 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}
          >
            {createMutation.isPending ? "Создание..." : "Начать турнир"}
          </button>
        </form>
      </main>
    </BeachBackground>
  );
}
