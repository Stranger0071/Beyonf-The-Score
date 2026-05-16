import { formatBattingHand } from '../utils/playerLookup'

export default function PlayerSpotlight({ playerOfMatch }) {
  if (!playerOfMatch) return null

  const { profile, name } = playerOfMatch

  return (
    <section id="section-performers" className="scroll-mt-20 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-orange-500/5 p-5 text-left">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-400">
        Player of the Match
      </p>
      <PlayerHeader name={name} profile={profile} />
      {profile && <ProfileGrid profile={profile} />}
      {playerOfMatch.matchStats && <MatchStatsBlock stats={playerOfMatch.matchStats} />}
      <p className="mt-4 text-sm leading-relaxed text-amber-100/90">{playerOfMatch.fanTakeaway}</p>
    </section>
  )
}

function PlayerHeader({ name, profile }) {
  const initials = profile?.initials ?? name.slice(0, 2).toUpperCase()
  return (
    <div className="mt-3 flex flex-wrap items-start gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-xl font-bold text-amber-200">{initials}</div>
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl font-bold text-white">{name}</h2>
        {profile ? (
          <p className="mt-1 text-sm text-amber-100/80">
            {profile.country} · {profile.battingLabel}
            {profile.bowlingSkill ? ` · ${profile.bowlingSkill}` : ''}
          </p>
        ) : (
          <p className="mt-1 text-sm text-amber-200/60">Player profile unavailable</p>
        )}
      </div>
    </div>
  )
}

function ProfileGrid({ profile }) {
  return (
    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Detail label="Date of birth" value={profile.dobDisplay ?? '—'} />
      <Detail label="Age" value={profile.age != null ? `${profile.age} yrs` : '—'} />
      <Detail label="Batting" value={formatBattingHand(profile.battingHand)} />
      <Detail label="Bowling" value={profile.bowlingSkill || '—'} />
    </dl>
  )
}

function MatchStatsBlock({ stats }) {
  if (stats.runs != null) {
    return (
      <div className="mt-4 rounded-lg bg-black/20 p-3">
        <p className="text-xs font-medium uppercase text-amber-400/80">This match</p>
        <p className="mt-2 text-sm text-white">
          {stats.runs} runs · {stats.balls} balls · SR {stats.strikeRate ?? (stats.balls ? ((stats.runs / stats.balls) * 100).toFixed(2) : '—')}
          {stats.fours != null ? ` · ${stats.fours}×4 ${stats.sixes}×6` : ''}
        </p>
      </div>
    )
  }
  if (stats.wickets != null) {
    return (
      <div className="mt-4 rounded-lg bg-black/20 p-3">
        <p className="text-xs font-medium uppercase text-amber-400/80">This match</p>
        <p className="mt-2 text-sm text-white">
          {stats.wickets} wickets · {stats.balls} balls · Economy {stats.economy}
        </p>
      </div>
    )
  }
  return null
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg bg-black/20 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-white">{value}</dd>
    </div>
  )
}
