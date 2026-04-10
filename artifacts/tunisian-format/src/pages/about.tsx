import { useLocation } from "wouter";

export default function AboutPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-card-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-bold text-foreground">О сервисе</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-card border border-card-border rounded-2xl p-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <circle cx="12" cy="12" r="9"/>
              <path d="M5 12Q8 7 12 12Q16 17 19 12" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Тунисский формат</h2>
          <p className="text-foreground/80 leading-relaxed text-base">
            Сервис создан для удобного проведения турниров по пляжному волейболу.
          </p>
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-semibold text-foreground mb-3">Как это работает</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                5 игроков, 15 туров — каждый игрок пропускает ровно 3 тура
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                Формат 2 на 2 — пары формируются автоматически с максимальным разнообразием
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                Выбор лимита очков: 11, 15 или 21
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                Автоматический подсчёт статистики и итоговых мест
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
