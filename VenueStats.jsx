import { useState, useEffect, useMemo } from 'react'
import { fetchMatchesCsv } from '../data/loadMatches'

const TEAM_ALIASES = {
  'Delhi Daredevils': 'Delhi Capitals',
  'Delhi Capitals': 'Delhi Capitals',
  'Kings XI Punjab': 'Punjab Kings',
  'Punjab Kings': 'Punjab Kings',
  'Royal Challengers Bangalore': 'Royal Challengers Bengaluru',
  'Royal Challengers Bengaluru': 'Royal Challengers Bengaluru',
  'Rising Pune Supergiant': 'Rising Pune Supergiants',
  'Rising Pune Supergiants': 'Rising Pune Supergiants',
}

function normalizeTeamName(name) {
  if (!name || name === 'NA') return ''
  const trimmed = name.trim()
  return TEAM_ALIASES[trimmed] || trimmed
}

export default function VenueStats({ match }) {
  const [csvData, setCsvData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const currentVenue = match.venue
  const t1Name = match.team1.name
  const t2Name = match.team2.name

  useEffect(() => {
    let mounted = true
    fetchMatchesCsv()
      .then(data => {
        if (mounted) {
          setCsvData(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (mounted) {
          console.error(err)
          setError("Failed to load historical data")
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, [])

  const stats = useMemo(() => {
    if (!csvData.length) return null

    // Fuzzy match for venue names
    // Normalize: lowercase, remove punctuation, remove city names if present in ", City" format
    const normalizeVenue = (name) => {
      if (!name) return ''
      return name.split(',')[0].toLowerCase().replace(/[^a-z0-9]/g, '').trim()
    }

    const targetNorm = normalizeVenue(currentVenue)
    const atVenue = csvData.filter((m) => {
      const mNorm = normalizeVenue(m.venue)
      // Check if one contains the other or they match after normalization
      return mNorm.includes(targetNorm) || targetNorm.includes(mNorm) || mNorm === targetNorm
    })

    const total = atVenue.length
    if (!total) {
      // Fallback: If no matches found with fuzzy match, try searching by city if available
      return null
    }

    // Bat / chase win rate
    const batFirstWins = atVenue.filter((m) => Number(m.win_by_runs) > 0).length
    const chaseWins = atVenue.filter((m) => Number(m.win_by_wickets) > 0).length
    const batFirstPct = Math.round((batFirstWins / total) * 100)
    const chasePct = Math.round((chaseWins / total) * 100)

    // Toss Factor
    const tossWins = atVenue.filter((m) => m.toss_winner === m.winner).length
    const tossWinPct = Math.round((tossWins / total) * 100)

    // Most successful teams
    const teamWins = {}
    for (const m of atVenue) {
      const normWinner = normalizeTeamName(m.winner)
      if (normWinner) {
        teamWins[normWinner] = (teamWins[normWinner] || 0) + 1
      }
    }

    const topTeams = Object.entries(teamWins)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, wins]) => ({
        name,
        wins,
        pct: Math.round((wins / total) * 100),
      }))

    // Specific stats for current teams
    const getTeamWins = (name) => atVenue.filter(m => normalizeTeamName(m.winner) === normalizeTeamName(name)).length
    const t1Wins = getTeamWins(t1Name)
    const t2Wins = getTeamWins(t2Name)

    return {
      total,
      batFirstPct,
      chasePct,
      tossWinPct,
      topTeams,
      t1Wins,
      t1Pct: Math.round((t1Wins / total) * 100),
      t2Wins,
      t2Pct: Math.round((t2Wins / total) * 100)
    }
  }, [currentVenue, csvData, t1Name, t2Name])

  if (loading) return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-white/5 bg-slate-900/20 p-12">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Scanning matches.csv intelligence...</p>
    </div>
  )

  if (error) return (
    <div className="rounded-[2.5rem] border border-red-500/10 bg-red-500/5 p-12 text-center text-red-400">
      {error}
    </div>
  )

  if (!stats) return (
    <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/20 p-12 text-center text-slate-500">
      <p className="text-lg font-black text-white/20">No Historical Data</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-widest opacity-50">Could not find matches played at "{currentVenue}"</p>
    </div>
  )

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-white">Venue Intelligence</h2>
        <div className="h-px flex-grow bg-white/5" />
        <div className="flex gap-2">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            {stats.total} Matches
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Stats Card */}
        <div className="lg:col-span-2 overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Historical Venue Performance</p>
            <h3 className="mt-2 text-2xl font-black text-white">{currentVenue}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <MetricTile label="Bat 1st" value={`${stats.batFirstPct}%`} color="emerald" icon="🏏" />
            <MetricTile label="Chase" value={`${stats.chasePct}%`} color="sky" icon="🎯" />
            <MetricTile label="Toss Advantage" value={`${stats.tossWinPct}%`} color="amber" icon="🪙" />
          </div>

          {/* Win Bar */}
          <div className="mt-12 space-y-4">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
              <span className="text-emerald-400">Bat First ({stats.batFirstPct}%)</span>
              <span className="text-sky-400">Chase ({stats.chasePct}%)</span>
            </div>
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000"
                style={{ width: `${stats.batFirstPct}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-sky-600 to-sky-400 transition-all duration-1000"
                style={{ width: `${stats.chasePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Team Track Record */}
        <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <p className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Current Teams at Venue</p>
          <div className="space-y-6">
            <TeamVenueStat name={match.team1.short} color={match.team1.color} wins={stats.t1Wins} pct={stats.t1Pct} total={stats.total} />
            <TeamVenueStat name={match.team2.short} color={match.team2.color} wins={stats.t2Wins} pct={stats.t2Pct} total={stats.total} />
          </div>
        </div>
      </div>

      {/* Success Board */}
      <div className="rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl">
        <p className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">All-Time Venue Leaders</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.topTeams.map((t, i) => (
            <div key={t.name} className="group flex items-center gap-4 rounded-2xl bg-white/[0.03] p-5 transition-all hover:bg-white/[0.06] hover:translate-y-[-2px]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                #{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-white">{t.name}</p>
                <p className="text-[10px] font-bold text-slate-500">{t.wins} wins · {t.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MetricTile({ label, value, color, icon }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    sky: 'text-sky-400 bg-sky-500/5 border-sky-500/10',
    amber: 'text-amber-400 bg-amber-500/5 border-amber-500/10'
  }
  return (
    <div className={`rounded-2xl border p-5 transition-transform hover:scale-[1.02] ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
      </div>
      <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  )
}

function TeamVenueStat({ name, color, wins, pct, total }) {
  return (
    <div className="group space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-lg font-black text-white">{name}</p>
          <p className="text-[10px] font-bold text-slate-500">{wins} wins in {total} games</p>
        </div>
        <p className="text-xl font-black" style={{ color }}>{pct}%</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full transition-all duration-1000 group-hover:brightness-125"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
