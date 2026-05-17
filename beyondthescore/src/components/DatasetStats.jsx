export default function DatasetStats({ stats }) {
  const cards = [
    { label: 'Total Matches', value: stats.total, hint: 'Since 2008' },
    { label: 'Toss Win Impact', value: `${stats.tossWinPct}%`, hint: 'Advantage' },
    { label: 'Defense Success', value: `${stats.runWinPct}%`, hint: 'Wins by runs' },
    { label: 'Chase Success', value: `${stats.chaseWinPct}%`, hint: 'Wins by wkts' },
    { label: 'IPL Span', value: stats.yearRange || stats.seasons, hint: 'Timeline' },
    { label: 'Balls Processed', value: stats.totalBalls?.toLocaleString() ?? '—', hint: 'Big data' },
  ]

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/20 p-8 sm:p-10">
      <div className="mb-8">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Dataset Intelligence</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Global IPL aggregates from ball-by-ball processing ({stats.yearRange || '2008–2025'})
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="group rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]">
            <p className="text-2xl font-black tabular-nums tracking-tight text-emerald-400 group-hover:scale-105 transition-transform">{c.value}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">{c.label}</p>
            <p className="mt-1 text-[10px] font-medium text-slate-700 italic">{c.hint}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
