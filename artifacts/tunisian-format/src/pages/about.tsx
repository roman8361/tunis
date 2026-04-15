import { useLocation } from "wouter";
import BeachBackground from "@/components/beach-background";

export default function AboutPage() {
  const [, navigate] = useLocation();

  const bulletClass = "flex items-start gap-2";
  const bulletDot = (
    <span
      className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
      style={{ background: "#4BBCD4" }}
    />
  );

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
          <h2 className="text-2xl font-bold text-slate-800 mb-4">О сервисе</h2>
          <p className="text-slate-600 leading-relaxed text-base">
            Сервис создан для удобного проведения турниров по пляжному волейболу.
          </p>
          <div className="mt-6 pt-6 border-t border-sky-100">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Доступные форматы</h3>
            <h4 className="font-semibold text-slate-700 mb-2">Классический формат (4 игрока)</h4>
            <p className="text-slate-600 leading-relaxed text-base mb-4">
              Формат для быстрой игры в полной четвёрке.
            </p>
            <h5 className="font-semibold text-slate-700 mb-3">Как это работает:</h5>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className={bulletClass}>
                {bulletDot}
                4 игрока, 2 пары, 3 тура играют друг против друга
              </li>
              <li className={bulletClass}>
                {bulletDot}
                Выбор лимита очков: 11, 15 или 21
              </li>
              <li className={bulletClass}>
                {bulletDot}
                <span>
                  Возможны два варианта игры:
                  <span className="block mt-1 pl-4">фиксированные пары</span>
                  <span className="block pl-4">или смена напарника перед каждым туром</span>
                </span>
              </li>
              <li className={bulletClass}>
                {bulletDot}
                Автоматический подсчёт статистики и итоговых мест
              </li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-sky-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Тунисский формат (5 игроков)</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Формат с ротацией игроков и максимальным разнообразием пар.
            </p>
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-3">Как это работает:</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className={bulletClass}>
                  {bulletDot}
                  5 игроков, 15 туров — каждый игрок пропускает ровно 3 тура
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Формат 2 на 2 — пары формируются автоматически с максимальным разнообразием
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Выбор лимита очков: 11, 15 или 21
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Автоматический подсчёт статистики и итоговых мест
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-sky-100">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Классический формат (6 игроков)</h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Формат для полной группы с возможностью смены напарников.
            </p>
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-3">Как это работает:</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className={bulletClass}>
                  {bulletDot}
                  6 игроков, 5 туров — все игроки участвуют в каждом туре
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Формат 2 на 2 — в каждом туре формируются 3 пары
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Каждая пара играет с каждой — 3 игры за тур
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  <span>
                    Возможны два режима:
                    <span className="block mt-1 pl-4">фиксированные пары</span>
                    <span className="block pl-4">или со сменой напарника каждый тур</span>
                  </span>
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Выбор лимита очков: 11, 15 или 21 (игра без баланса)
                </li>
                <li className={bulletClass}>
                  {bulletDot}
                  Автоматический подсчёт статистики после каждой игры и тура
                </li>
                <li className={bulletClass}>
                  {bulletDot}
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
