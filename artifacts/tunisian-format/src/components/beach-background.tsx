export default function BeachBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`min-h-screen relative overflow-hidden ${className}`}
      style={{ background: "linear-gradient(180deg, #0ea5e9 0%, #38bdf8 42%, #7dd3fc 65%, #fde68a 83%, #fbbf24 100%)" }}
    >
      {/* Sun — только солнце, никаких других символов */}
      <div
        className="absolute top-8 right-12 w-20 h-20 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #fef08a 40%, #fbbf24 100%)",
          boxShadow: "0 0 40px 12px rgba(251,191,36,0.45)",
        }}
      />
      {children}
    </div>
  );
}
