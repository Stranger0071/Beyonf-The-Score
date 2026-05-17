export default function MatchAnalytics({ match }) {
  const { matchStats, innings } = match
  if (!innings?.length) return null

  return (
    <section id="section-analytics" className="scroll-mt-20 space-y-10 text-left">
      <AnalyticsHeader year={match.year} />
      <MatchMetrics stats={matchStats} />
      <div className="grid gap-6 lg:grid-cols-2">
        {innings.map((inn, i) => (
          <InningsPanel key={inn.innings} inn={inn} index={i} />
        ))}
      </div>
    </section>
  )
}

function AnalyticsHeader({ year }) {
  return (
    <div className="flex items-end justify-between border-b border-white/5 pb-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-white">Advanced Analytics</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">Ball-by-ball deep dive · IPL {year}</p>
      </div>
      <div className="hidden h-px flex-grow bg-gradient-to-r from-transparent via-white/5 to-transparent mx-8 sm:block"></div>
      <div className="text-right">
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
          Stat Engine v4.0
        </span>
      </div>
    </div>
  )
}

function MatchMetrics({ stats }) {
  const items = [
    { label: 'Dot Ball %', value: `${stats.avgDotPct}%`, hint: 'Precision' },
    { label: 'Boundary %', value: `${stats.avgBoundaryPct}%`, hint: 'Agression' },
    { label: 'Total Runs', value: stats.totalRuns, hint: 'Volume' },
    { label: 'Wickets', value: stats.totalWickets, hint: 'Impact' },
    { label: 'Max Sixes', value: stats.totalSixes, hint: 'Power' },
    { label: 'Extras', value: stats.totalExtras, hint: 'Discipline' },
  ]
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <MetricCard key={item.label} label={item.label} value={item.value} hint={item.hint} />
      ))}
    </div>
  )
}

function InningsPanel({ inn, index }) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/5 bg-slate-900/20 p-6 transition-all hover:bg-slate-900/40 sm:p-8">
      <InningsHeader inn={inn} index={index} />
      <div className="mt-6">
        <InningsStatsGrid inn={inn} />
      </div>
      <div className="mt-8 space-y-3">
        <PhaseRow title="Powerplay" range="1–6" phase={inn.powerplay} />
        <PhaseRow title="Middle Overs" range="7–15" phase={inn.middle} />
        <PhaseRow title="Death Overs" range="16–20" phase={inn.death} />
      </div>
      <TopPerformers inn={inn} />
    </div>
  )
}

function InningsHeader({ inn, index }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-slate-400">
          0{index + 1}
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{inn.battingTeam}</h3>
          <p className="text-[10px] font-medium text-slate-600">First Innings</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-3xl font-black tabular-nums tracking-tight text-white">
          {inn.runs}<span className="text-lg text-emerald-500">/{inn.wickets}</span>
        </span>
        <p className="text-xs font-bold text-slate-500">{inn.overs} Overs</p>
      </div>
    </div>
  )
}

function InningsStatsGrid({ inn }) {
  const stats = [
    { label: 'Run Rate', value: inn.runRate },
    { label: 'Dot Ball %', value: `${inn.dotBallPct}%`, highlight: true },
    { label: 'Boundary %', value: `${inn.boundaryPct}%` },
    { label: 'Total Dots', value: inn.dotBalls },
    { label: 'Boundaries', value: `${inn.fours + inn.sixes}` },
    { label: 'Strike Rate', value: ((inn.runs / inn.balls) * 100).toFixed(1) },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((s) => (
        <MiniStat key={s.label} label={s.label} value={s.value} highlight={s.highlight} />
      ))}
    </div>
  )
}

function TopPerformers({ inn }) {
  if (!inn.topBatters?.length && !inn.topBowlers?.length) return null
  return (
    <div className="mt-10 grid gap-6 border-t border-white/5 pt-8 sm:grid-cols-2">
      {inn.topBatters?.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Elite Batters</p>
            <div className="h-px flex-grow bg-white/5 ml-4"></div>
          </div>
          <ul className="space-y-3">
            {inn.topBatters.slice(0, 3).map((b) => (
              <li key={b.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-white">{b.name}</span>
                  <span className="font-black text-emerald-400">{b.runs}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                   <div className="h-full bg-emerald-500/50" style={{ width: `${Math.min(100, (b.runs/100)*100)}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>{b.balls} Balls</span>
                    <span>SR {b.strikeRate ?? ((b.runs / b.balls) * 100).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {inn.topBowlers?.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Elite Bowlers</p>
            <div className="h-px flex-grow bg-white/5 ml-4"></div>
          </div>
          <ul className="space-y-3">
            {inn.topBowlers.slice(0, 3).map((b) => (
              <li key={b.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-white">{b.name}</span>
                  <span className="font-black text-blue-400">{b.wickets}<span className="text-[10px] text-slate-500"> wkts</span></span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                   <div className="h-full bg-blue-500/50" style={{ width: `${(b.wickets/5)*100}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>{Math.floor(b.balls / 6)}.{b.balls % 6} Overs</span>
                  <span>Econ {b.economy}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-800 transition-colors group-hover:bg-emerald-500"></div>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-white group-hover:text-emerald-400">{value}</p>
      <p className="mt-1 text-[10px] font-bold text-slate-600">{hint}</p>
    </div>
  )
}

function MiniStat({ label, value, highlight }) {
  return (
    <div className={`rounded-xl p-3 transition-colors ${highlight ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-white/[0.02] border border-white/5'}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-black ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function PhaseRow({ title, range, phase }) {
  if (!phase?.balls) return null
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3 border border-white/5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</p>
        <p className="text-[10px] font-medium text-slate-600">Overs {range}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-white">
          {phase.runs}<span className="text-[10px] text-slate-500"> runs</span> · {phase.runRate}<span className="text-[10px] text-slate-500"> RR</span>
        </p>
        <p className="text-[10px] font-bold text-emerald-500">{phase.dotPct}% Dots</p>
      </div>
    </div>
  )
}
