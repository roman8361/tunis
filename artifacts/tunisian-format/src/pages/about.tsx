import { useLocation } from "wouter";
import BeachBackground from "@/components/beach-background";

export default function AboutPage() {
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
          <h1 className="font-bold text-slate-700">О сервисе</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white/90 backdrop-blur border border-white/60 rounded-2xl p-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #4BBCD4, #3aa8be)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9"/>
              <path d="M5 12Q8 7 12 12Q16 17 19 12" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Тунисский формат</h2>
          <p className="text-slate-600 leading-relaxed text-base">
            Сервис создан для удобного проведения турниров по пляжному волейболу.
          </p>
          <div className="mt-6 pt-6 border-t border-sky-100">
            <h3 className="font-semibold text-slate-700 mb-3">Как это работает</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                5 игроков, 15 туров — каждый игрок пропускает ровно 3 тура
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                Формат 2 на 2 — пары формируются автоматически с максимальным разнообразием
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                Выбор лимита очков: 11, 15 или 21
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                Автоматический подсчёт статистики и итоговых мест
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-sky-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Классический формат</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Дополнительно доступен классический формат для игры полной группой без пропусков.
            </p>
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-3">Как это работает</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  6 игроков, 5 туров — все игроки участвуют в каждом туре
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  Формат 2 на 2 — в каждом туре формируются 3 пары
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  Каждая пара играет с каждой — 3 игры за тур
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  <span>
                    Возможны два режима:
                    <span className="block mt-1 pl-4">фиксированные пары</span>
                    <span className="block pl-4">или со сменой напарника каждый тур</span>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  Выбор лимита очков: 11, 15 или 21 (игра без баланса)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  Автоматический подсчёт статистики после каждой игры и тура
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "#4BBCD4" }}/>
                  <span>
                    Итоговые места:
                    <span className="block mt-1 pl-4">по парам (при фиксированных командах)</span>
                    <span className="block pl-4">или индивидуально (при смене напарников)</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </BeachBackground>
  );
}
