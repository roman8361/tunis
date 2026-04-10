import { useLocation } from "wouter";
import { useListTournaments, useDeleteTournament, useGetMe, useLogout, getListTournamentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процессе",
  finished: "Завершён",
};

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  finished: "bg-green-100 text-green-700 border-green-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        localStorage.removeItem("auth_token");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        navigate("/");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 shadow-sm border-b border-sky-100"
        style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shadow-sm animate-float">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5"/>
                <path d="M8 16 Q12 10 16 16 Q20 22 24 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Тунисский формат</h1>
              <p className="text-xs text-white/70 mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === "superadmin" && (
              <button
                onClick={() => navigate("/admin")}
                className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
              >
                Администрирование
              </button>
            )}
            <button
              onClick={() => navigate("/about")}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              О сервисе
            </button>
            <button
              onClick={() => navigate("/team")}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              О команде
            </button>
            <button
              onClick={() => logoutMutation.mutate({})}
              className="px-3 py-1.5 text-sm text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Wave under header */}
      <div className="overflow-hidden" style={{ marginTop: "-1px", height: "40px" }}>
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <path d="M0,20 C360,40 720,0 1080,20 C1260,30 1380,10 1440,20 L1440,0 L0,0 Z"
            fill="url(#headerGrad)"/>
          <defs>
            <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0ea5e9"/>
              <stop offset="100%" stopColor="#0284c7"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-foreground">Мои турниры</h2>
          <button
            onClick={() => navigate("/tournaments/new")}
            className="text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #f97316)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            Создать новый турнир
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Загрузка...</div>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <circle cx="12" cy="12" r="9"/>
                <path d="M5 12Q8 7 12 12Q16 17 19 12" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Нет турниров</h3>
            <p className="text-muted-foreground text-sm mb-6">Создайте первый турнир, чтобы начать</p>
            <button
              onClick={() => navigate("/tournaments/new")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Создать турнир
            </button>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {tournaments.map((t) => (
              <div
                key={t.id}
                onClick={() => navigate(t.status === "finished" ? `/tournaments/${t.id}/results` : `/tournaments/${t.id}`)}
                className="bg-card border border-card-border rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[t.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABELS[t.status] ?? t.status}
                      </span>
                      <span className="text-xs text-muted-foreground">до {t.targetScore} очков</span>
                      <span className="text-xs text-muted-foreground">{t.completedRounds}/15 туров</span>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {t.playerNames.join(" • ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatDate(t.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(t.id, e)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      title="Удалить турнир"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                      </svg>
                    </button>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground group-hover:text-foreground transition-colors">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
