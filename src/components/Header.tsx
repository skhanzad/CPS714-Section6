interface HeaderProps {
  subtitle?: string;
}

export default function Header({ subtitle = "Event Creation • Room & Resource Booking" }: HeaderProps) {
  return (
    <header
      className="w-full py-5 bg-white/90 backdrop-blur sticky top-0 z-20 border-b-2"
      style={{ borderBottomColor: "var(--tmu-blue)" }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 items-center">
        <div className="flex items-center gap-3">
          <div className="badge">TMU</div>
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--tmu-blue)" }}
          >
            CampusConnect
          </h1>
        </div>
        <p className="justify-self-end text-sm text-black/70">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
