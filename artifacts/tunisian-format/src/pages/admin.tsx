import { useState } from "react";
import { useLocation } from "wouter";
import {
  useAdminListUsers,
  useAdminDeleteUser,
  useAdminListUserTournaments,
  getAdminListUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: "В процессе",
  finished: "Завершён",
};

export default function AdminPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useAdminListUsers();
  const { data: userTournaments } = useAdminListUserTournaments(selectedUserId ?? "", {
    query: { enabled: !!selectedUserId },
  });

  const deleteMutation = useAdminDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        setSelectedUserId(null);
      },
    },
  });

  const filteredUsers = users?.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  function handleDeleteUser(userId: string) {
    if (confirm("Удалить пользователя и все его данные? Это действие необратимо.")) {
      deleteMutation.mutate({ userId });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-card-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-foreground">Панель администратора</h1>
            <p className="text-xs text-muted-foreground">Управление пользователями</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Users list */}
        <div className="w-80 shrink-0">
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="search"
                  placeholder="Поиск по email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="divide-y divide-border max-h-[calc(100vh-200px)] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Загрузка...</div>
              ) : filteredUsers?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Пользователи не найдены</div>
              ) : filteredUsers?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-all ${selectedUserId === user.id ? "bg-primary/5 border-r-2 border-r-primary" : ""}`}
                >
                  <div className="font-medium text-foreground text-sm truncate">{user.email}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                      {user.role === "superadmin" ? "Администратор" : "Пользователь"}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.tournamentCount} турн.</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User detail */}
        <div className="flex-1">
          {!selectedUserId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p className="text-muted-foreground">Выберите пользователя</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User card */}
              {selectedUser && (
                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{selectedUser.email}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${selectedUser.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-muted text-muted-foreground"}`}>
                          {selectedUser.role === "superadmin" ? "Администратор" : "Пользователь"}
                        </span>
                        <span className="text-xs text-muted-foreground">Зарегистрирован: {formatDate(selectedUser.createdAt)}</span>
                      </div>
                    </div>
                    {selectedUser.role !== "superadmin" && (
                      <button
                        onClick={() => handleDeleteUser(selectedUser.id)}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
                      >
                        Удалить пользователя
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* User tournaments */}
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">
                    Турниры пользователя ({userTournaments?.length ?? 0})
                  </h3>
                </div>
                {!userTournaments || userTournaments.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">Нет турниров</div>
                ) : (
                  <div className="divide-y divide-border">
                    {userTournaments.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/tournaments/${t.id}`)}
                        className="px-6 py-4 hover:bg-muted/30 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-foreground">{t.playerNames.join(" · ")}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">{STATUS_LABELS[t.status] ?? t.status}</span>
                            <span className="text-xs text-muted-foreground">до {t.targetScore} очков</span>
                            <span className="text-xs text-muted-foreground">{t.completedRounds}/15 туров</span>
                            <span className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</span>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
