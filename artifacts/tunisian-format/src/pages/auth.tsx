import { useState } from "react";
import { useLocation } from "wouter";
import { useRegister, useLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("auth_token", data.token);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        navigate("/dashboard");
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Ошибка входа");
      },
    },
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem("auth_token", data.token);
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        navigate("/dashboard");
      },
      onError: (err: any) => {
        setError(err?.data?.error ?? "Ошибка регистрации");
      },
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Введите email");
      return;
    }
    if (!password.trim()) {
      setError("Введите пароль");
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ data: { email, password } });
    } else {
      registerMutation.mutate({ data: { email, password } });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="2.5"/>
              <path d="M8 16 Q12 10 16 16 Q20 22 24 16" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M8 16 Q12 22 16 16 Q20 10 24 16" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Тунисский формат</h1>
          <p className="text-muted-foreground mt-1">Турниры по пляжному волейболу</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-muted p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Электронная почта</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ваш@email.ru"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
