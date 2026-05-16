import { useMemo } from 'react'
import { allMatches } from '../data/loadMatches'

const TEAM_ALIASES = {
  // Rebrands & Variations
  'Delhi Daredevils': 'Delhi Capitals',
  'Delhi Capitals': 'Delhi Capitals',
  'Kings XI Punjab': 'Punjab Kings',
  'Punjab Kings': 'Punjab Kings',
  'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
  'Royal Challengers Bengaluru': 'Royal Challengers Bengaluru',
  'Rising Pune Supergiant': 'Rising Pune Supergiants',
  'Rising Pune Supergiants': 'Rising Pune Supergiants',
  
  // Historical context (Optional: Some users count these together, some don't)
  // For most 'proper' derivations, we keep different franchises separate 
  // unless they are explicitly rebrands (like the ones above).
  // 'Deccan Chargers': 'Sunrisers Hyderabad', 
}

function normalize(name) {
  if (!name) return ''
  const trimmed = name.trim()
  return TEAM_ALIASES[trimmed] || trimmed
}

export default function HeadToHead({ match }) {
  const currentT1 = normalize(match.team1.name)
  const currentT2 = normalize(match.team2.name)

  const record = useMemo(() => {
    if (!currentT1 || !currentT2) return { total: 0, t1Wins: 0, t2Wins: 0, noResult: 0, last5: [] }

    // Filter matches involving both teams (or their aliases)
    const clashes = allMatches.filter((m) => {
      const m1 = normalize(m.team1Name)
      const m2 = normalize(m.team2Name)
      
      return (m1 === currentT1 && m2 === currentT2) || 
             (m1 === currentT2 && m2 === currentT1)
    })

    const t1Wins = clashes.filter((m) => normalize(m.winner) === currentT1).length
    const t2Wins = clashes.filter((m) => normalize(m.winner) === currentT2).length
    const noResult = clashes.length - t1Wins - t2Wins

    // Get last 5 meetings
    const last5 = clashes.slice(0, 5).map((m) => {
      const winNorm = normalize(m.winner)
      const won1 = winNorm === currentT1
      const won2 = winNorm === currentT2
      return {
        id: m.id,
        year: m.year,
        winner: winNorm,
        winnerShort: won1 ? match.team1.short : (won2 ? match.team2.short : 'NR'),
        isT1: won1,
        isT2: won2
      }
    })

    return { total: clashes.length, t1Wins, t2Wins, noResult, last5 }
  }, [currentT1, currentT2, match.team1.short, match.team2.short])

  if (record.total === 0) return null

  const t1Pct = Math.round((record.t1Wins / record.total) * 100)
  const t2Pct = Math.round((record.t2Wins / record.total) * 100)
  const drawPct = 100 - t1Pct - t2Pct

  return (
    <section id="section-h2h" className="scroll-mt-20 space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Head-to-Head Analytics</h2>
        <div className="h-px flex-grow bg-white/5" />
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          All-time IPL record
        </span>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {record.total} Meetings across all seasons
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-16">
          {/* Team 1 Card */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl text-xl font-black shadow-2xl transition-transform hover:scale-105 sm:h-24 sm:w-24"
              style={{
                backgroundColor: match.team1.color,
                color: ['SRH', 'CSK'].includes(match.team1.short) ? '#05070a' : '#fff',
                boxShadow: `0 20px 50px -12px ${match.team1.color}66`,
              }}
            >
              {match.team1.short}
            </div>
            <div className="text-center">
              <p className="text-5xl font-black tabular-nums tracking-tighter text-white sm:text-6xl">
                {record.t1Wins}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Victories</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase text-slate-400">
              VS
            </div>
            {record.noResult > 0 && (
              <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-500">
                {record.noResult} NR
              </div>
            )}
          </div>

          {/* Team 2 Card */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl text-xl font-black shadow-2xl transition-transform hover:scale-105 sm:h-24 sm:w-24"
              style={{
                backgroundColor: match.team2.color,
                color: ['SRH', 'CSK'].includes(match.team2.short) ? '#05070a' : '#fff',
                boxShadow: `0 20px 50px -12px ${match.team2.color}66`,
              }}
            >
              {match.team2.short}
            </div>
            <div className="text-center">
              <p className="text-5xl font-black tabular-nums tracking-tighter text-white sm:text-6xl">
                {record.t2Wins}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Victories</p>
            </div>
          </div>
        </div>

        {/* Dynamic Win Ratio Bar */}
        <div className="mt-16 space-y-3">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
            <span className="text-white">{t1Pct}%</span>
            <span className="text-slate-500">Dominance Ratio</span>
            <span className="text-white">{t2Pct}%</span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="absolute left-0 top-0 h-full transition-all duration-1000"
              style={{ width: `${t1Pct}%`, backgroundColor: match.team1.color }}
            />
            <div
              className="absolute right-0 top-0 h-full transition-all duration-1000"
              style={{ width: `${t2Pct}%`, backgroundColor: match.team2.color }}
            />
          </div>
        </div>

        {/* Timeline of Last 5 */}
        <div className="mt-16 border-t border-white/5 pt-10">
          <h3 className="mb-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Recent Match History
          </h3>
          <div className="flex justify-center gap-4">
            {record.last5.map((m) => (
              <div key={m.id} className="group relative flex flex-col items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-[10px] font-black transition-all duration-300 group-hover:-translate-y-1 ${
                    m.isT1 ? 'shadow-[0_8px_20px_-6px_rgba(var(--t1-rgb),0.5)]' : 
                    m.isT2 ? 'shadow-[0_8px_20px_-6px_rgba(var(--t2-rgb),0.5)]' : ''
                  }`}
                  style={{
                    backgroundColor: m.isT1 ? `${match.team1.color}20` : (m.isT2 ? `${match.team2.color}20` : 'rgba(255,255,255,0.03)'),
                    color: m.isT1 ? match.team1.color : (m.isT2 ? match.team2.color : '#475569'),
                    border: `1px solid ${m.isT1 ? match.team1.color + '40' : (m.isT2 ? match.team2.color + '40' : 'rgba(255,255,255,0.1)')}`
                  }}
                >
                  {m.winnerShort === 'NR' ? '—' : m.winnerShort}
                </div>
                <span className="text-[10px] font-bold text-slate-600">{m.year}</span>
                
                {/* Tooltip-like label */}
                <div className="absolute -top-10 scale-0 rounded bg-white px-2 py-1 text-[9px] font-bold text-black transition-transform group-hover:scale-100">
                  {m.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
