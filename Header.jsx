export default function Header({ match, matches, season, seasons, yearRange, onMatchChange, onSeasonChange }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
            Live Intelligence
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Beyond <span className="text-emerald-500">The Score</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-400">
          IPL Data Analytics · {yearRange || '2008–2025'} · {matches.length} matches
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="group relative">
          <select
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            className="appearance-none rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 pr-10 text-sm font-semibold text-white transition-all hover:bg-white/10 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Filter by season"
          >
            <option value="all" className="bg-[#0d121a]">
              All seasons
            </option>
            {seasons.map((s) => (
              <option key={s} value={s} className="bg-[#0d121a]">
                IPL {s}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        <div className="group relative">
          <select
            value={match.id}
            onChange={(e) => onMatchChange(e.target.value)}
            className="max-w-[240px] appearance-none rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 pr-10 text-sm font-semibold text-white transition-all hover:bg-white/10 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Select match"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0d121a]">
                {m.team1} vs {m.team2} ({m.date})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-emerald-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
