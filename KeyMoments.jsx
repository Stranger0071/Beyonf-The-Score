const eventColors = {
  Wicket: 'bg-red-500/20 text-red-300',
  Six: 'bg-emerald-500/20 text-emerald-300',
  Milestone: 'bg-amber-500/20 text-amber-300',
  Win: 'bg-emerald-500/20 text-emerald-300',
  Toss: 'bg-sky-500/20 text-sky-300',
  Tie: 'bg-purple-500/20 text-purple-300',
  Note: 'bg-slate-500/20 text-slate-300',
}

export default function KeyMoments({ moments }) {
  return (
    <section id="section-timeline" className="scroll-mt-20 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
      <h2 className="mb-4 text-lg font-semibold text-white">Match Timeline</h2>
      <ol className="space-y-3">
        {moments.map((m, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-14 shrink-0 text-sm font-mono font-bold text-emerald-400">
              {m.over}
            </span>
            <div className="min-w-0 flex-1 border-l border-white/10 pl-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${eventColors[m.event] || 'bg-slate-600/50 text-slate-300'}`}
                >
                  {m.event}
                </span>
                <span className="font-medium text-white">{m.player}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-400">{m.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
