import { useLocation } from "wouter";
import BeachBackground from "@/components/beach-background";

export default function TeamPage() {
  const [, navigate] = useLocation();

  return (
    <BeachBackground>
      <header className="bg-white/95 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-sky-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-sky-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="font-bold text-slate-700">О команде</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Мы — команда</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Мы — энтузиасты, которые любят пляжный волейбол и технологии.
            </p>
            <p>
              Делаем этот сервис, чтобы проводить турниры было проще, удобнее и интереснее — и чтобы можно было больше играть, а не считать очки.
            </p>
            <p>
              Если у вас есть идеи, как сделать сервис лучше, или предложения по сотрудничеству — пишите нам:{" "}
              <a href="mailto:torex@inbox.ru" className="font-medium hover:underline" style={{ color: "#4BBCD4" }}>
                torex@inbox.ru
              </a>
            </p>
          </div>
        </div>
      </main>
    </BeachBackground>
  );
}
