import { useLocation } from "wouter";

export default function TeamPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-card-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1 as any)}
            className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground hover:text-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-bold text-foreground">О команде</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-card border border-card-border rounded-2xl p-8">
          <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Мы — команда</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed">
            <p>
              Мы — энтузиасты, которые любят пляжный волейбол и технологии.
            </p>
            <p>
              Делаем этот сервис, чтобы проводить турниры было проще, удобнее и интереснее — и чтобы можно было больше играть, а не считать очки.
            </p>
            <p>
              Если у вас есть идеи, как сделать сервис лучше, или предложения по сотрудничеству — пишите нам:{" "}
              <a href="mailto:torex@inbox.ru" className="text-primary hover:underline font-medium">
                torex@inbox.ru
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
