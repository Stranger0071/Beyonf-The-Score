const styles = {
  highlight: 'border-emerald-500/20 bg-emerald-500/[0.03] text-emerald-400',
  warning: 'border-amber-500/20 bg-amber-500/[0.03] text-amber-400',
  tip: 'border-sky-500/20 bg-sky-500/[0.03] text-sky-400',
}

const icons = { highlight: '★', warning: '⚡', tip: '💡' }

export default function InsightCards({ insights }) {
  return (
    <section id="section-insights" className="scroll-mt-20 space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Match Insights</h2>
        <div className="h-px flex-grow bg-white/5"></div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {insights.map((item, i) => (
          <InsightCard key={i} item={item} />
        ))}
      </div>
    </section>
  )
}

function InsightCard({ item }) {
  const style = styles[item.type] || styles.tip
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl border p-6 transition-all hover:bg-slate-900/40 ${style}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-lg" aria-hidden="true">
          {icons[item.type]}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          {item.stat}
        </span>
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-emerald-400 transition-colors">{item.title}</h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400">{item.body}</p>
    </article>
  )
}
