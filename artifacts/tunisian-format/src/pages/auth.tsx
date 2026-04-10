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
    if (!email.trim()) { setError("Введите электронную почту"); return; }
    if (!password.trim()) { setError("Введите пароль"); return; }
    if (mode === "login") {
      loginMutation.mutate({ data: { email, password } });
    } else {
      registerMutation.mutate({ data: { email, password } });
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 40%, #7dd3fc 70%, #fde68a 85%, #fbbf24 100%)" }}
    >
      {/* Sun */}
      <div className="absolute top-8 right-12 w-20 h-20 rounded-full opacity-90 animate-float"
        style={{ background: "radial-gradient(circle, #fef08a 40%, #fbbf24 100%)", boxShadow: "0 0 40px 10px rgba(251,191,36,0.4)" }}
      />

      {/* Volleyball floating */}
      <div className="absolute top-16 left-10 animate-float" style={{ animationDelay: "1s" }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.7">
          <circle cx="24" cy="24" r="22" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
          <path d="M5 24 Q12 10 24 14 Q36 18 43 24" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M5 24 Q12 38 24 34 Q36 30 43 24" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M24 2 Q30 12 24 24 Q18 36 24 46" stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Small volleyball */}
      <div className="absolute top-32 right-1/4 animate-float" style={{ animationDelay: "2.5s", animationDuration: "5s" }}>
        <svg width="28" height="28" viewBox="0 0 48 48" fill="none" opacity="0.5">
          <circle cx="24" cy="24" r="22" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
          <path d="M5 24 Q12 10 24 14 Q36 18 43 24" stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M5 24 Q12 38 24 34 Q36 30 43 24" stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M24 2 Q30 12 24 24 Q18 36 24 46" stroke="#0ea5e9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Animated Waves */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ height: "120px" }}>
        <div className="animate-wave" style={{ width: "200%", height: "100%" }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "50%", height: "100%", float: "left" }}>
            <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.5)"/>
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "50%", height: "100%", float: "left" }}>
            <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        <div className="animate-wave-slow absolute bottom-0 left-0" style={{ width: "200%", height: "80%" }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "50%", height: "100%", float: "left" }}>
            <path d="M0,40 C360,90 720,10 1080,60 C1260,80 1380,30 1440,50 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.35)"/>
          </svg>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: "50%", height: "100%", float: "left" }}>
            <path d="M0,40 C360,90 720,10 1080,60 C1260,80 1380,30 1440,50 L1440,120 L0,120 Z" fill="rgba(255,255,255,0.35)"/>
          </svg>
        </div>
      </div>

      {/* Form card */}
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-18 h-18 mb-4">
            <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-2xl shadow-lg flex items-center justify-center animate-float">
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#0ea5e9"/>
                <path d="M5 24 Q12 10 24 14 Q36 18 43 24" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M5 24 Q12 38 24 34 Q36 30 43 24" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M24 2 Q30 12 24 24 Q18 36 24 46" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight">Тунисский формат</h1>
          <p className="text-white/80 mt-1 drop-shadow-sm">Турниры по пляжному волейболу</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl p-8">
          <div className="flex rounded-xl bg-sky-50 p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "login" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "register" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                disabled={isLoading}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-white"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
            >
              {isLoading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
