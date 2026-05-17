export default function MatchScorecard({ match }) {
  return (
    <section id="section-scorecard" className="relative scroll-mt-20 overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-sm sm:p-10">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]"></div>
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-[100px]"></div>

      <div className="relative mb-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
          {match.competition}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1">
          {match.city} · {match.date}
          {match.stage ? ` · ${match.stage}` : ''}
        </span>
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-12">
        <TeamBlock team={match.team1} />
        <ResultBlock match={match} />
        <TeamBlock team={match.team2} align="left" />
      </div>

      <p className="mt-8 text-center text-xs font-medium text-slate-500">{match.venue}</p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Toss" value={match.tossWinner} sub={`chose to ${match.tossDecision}`} />
        <StatCard label="Margin" value={match.margin} sub={match.result === 'tie' ? 'Super Over' : 'Victory'} />
        <StatCard label="Player of Match" value={match.playerOfMatch || '—'} sub="Standout performance" />
        <StatCard
          label="Ball Control"
          value={`${match.matchStats?.avgDotPct ?? '—'}%`}
          sub="Average dot balls"
        />
      </div>
    </section>
  )
}

function TeamBlock({ team, align = 'right' }) {
  const alignCls = align === 'right' ? 'items-end text-right' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-3 ${alignCls}`}>
      <div className="relative">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black shadow-2xl transition-transform hover:scale-105 sm:h-20 sm:w-20 sm:text-2xl"
          style={{
            backgroundColor: team.color,
            color: ['SRH', 'CSK'].includes(team.short) ? '#05070a' : '#fff',
            boxShadow: `0 10px 40px -10px ${team.color}44`,
          }}
        >
          {team.short}
        </div>
        {team.isWinner && (
          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{team.name}</span>
        <p className="mt-1 text-3xl font-black tabular-nums tracking-tight text-white sm:text-5xl">
          {team.runs}<span className="text-xl text-slate-500 sm:text-2xl">/{team.wickets}</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{team.overs} <span className="text-[10px] uppercase">Overs</span></p>
      </div>
    </div>
  )
}

function ResultBlock({ match }) {
  return (
    <div className="px-4 text-center">
      <div className="mb-2 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
        Final Result
      </div>
      <p className="text-lg font-black tracking-tight text-white sm:text-xl">{match.winner}</p>
      <p className="mt-1 text-xs font-bold text-slate-500">{match.margin}</p>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.05]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 truncate text-sm font-extrabold text-white group-hover:text-emerald-400" title={String(value)}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-600">{sub}</p>
    </div>
  )
}
