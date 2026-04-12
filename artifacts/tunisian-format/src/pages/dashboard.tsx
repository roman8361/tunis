import { useLocation } from "wouter";
import { useListTournaments, useDeleteTournament, useGetMe, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import BeachBackground from "@/components/beach-background";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процессе",
  finished: "Завершён",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-sky-100 text-sky-700 border-sky-200",
  finished: "bg-green-100 text-green-700 border-green-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VolleyballIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="22" fill="#4BBCD4" stroke="#3aa8be" strokeWidth="1"/>
      <path d="M5 24 Q12 10 24 14 Q36 18 43 24" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M5 24 Q12 38 24 34 Q36 30 43 24" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M24 2 Q30 12 24 24 Q18 36 24 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { data: user } = useGetMe();
  const { data: tournaments, isLoading } = useListTournaments();

  const deleteMutation = useDeleteTournament({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTournamentsQueryKey() });
      },
    },
  });

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Удалить этот турнир? Это действие необратимо.")) {
      deleteMutation.mutate({ id });
    }
  }

  return (
    <BeachBackground>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <VolleyballIcon size={32} className="shrink-0" />
            <h1 className="font-extrabold text-lg leading-none" style={{ color: "#f97316" }}>
              ТУНИССКИЙ ФОРМАТ
            </h1>
          </div>
          {user?.role === "superadmin" && (
            <button
              onClick={() => navigate("/admin")}
              className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            >
              Адмін
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Action buttons */}
        <div className="space-y-3 mb-8 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/about")}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-white/60 bg-white/50 text-white font-medium hover:bg-white/70 hover:text-slate-700 transition-all backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round"/>
              </svg>
              О сервисе
            </button>
            <button
              onClick={() => navigate("/team")}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-white/60 bg-white/50 text-white font-medium hover:bg-white/70 hover:text-slate-700 transition-all backdrop-blur-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              О команде
            </button>
          </div>

          <button
            onClick={() => navigate("/tournaments/new")}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            style={{ background: "linear-gradient(135deg, #4BBCD4 0%, #3aa8be 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            играть тунис (5 человек)
          </button>

          <button
            onClick={() => navigate("/tournaments/new")}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-bold text-lg shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
            style={{ background: "linear-gradient(135deg, #4BBCD4 0%, #3aa8be 100%)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            играть (6 человек)
          </button>
        </div>

        {/* Tournaments */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl font-bold text-white drop-shadow-sm">Мои турниры</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-white/70">Загрузка...</div>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="bg-white/60 border-2 border-dashed border-white/50 rounded-2xl py-12 text-center backdrop-blur-sm">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-white font-medium mb-1">Пока нет турниров.</p>
            <p className="text-white/70 text-sm">Создайте первый, чтобы начать игру!</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(t.status === "finished" ? `/tournaments/${t.id}/results` : `/tournaments/${t.id}`)}
                className="bg-white/85 border border-white/60 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[t.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                      <span className="text-xs text-slate-400">до {t.targetScore} очков</span>
                      <span className="text-xs text-slate-400">{t.completedRounds}/15 туров</span>
                    </div>
                    <div className="text-sm font-medium text-slate-600 truncate">
                      {t.playerNames.join(" • ")}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{formatDate(t.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(t.id, e)}
                      className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                      title="Удалить турнир"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 group-hover:text-slate-500 transition-colors">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </BeachBackground>
  );
}
