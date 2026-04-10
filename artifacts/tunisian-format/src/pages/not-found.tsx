import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl font-bold text-muted-foreground/30 mb-4">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Страница не найдена</h1>
        <p className="text-muted-foreground mb-6">Запрошенная страница не существует.</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
        >
          На главную
        </button>
      </div>
    </div>
  );
}
