export default function MatchSquad({ squad, match }) {
  if (!squad) return null

  const hasPlayers = squad.team1.length > 0 || squad.team2.length > 0
  if (!hasPlayers) return null

  return (
    <section id="section-squad" className="scroll-mt-20 text-left">
      <h2 className="mb-1 text-lg font-semibold text-white">Match squads</h2>
      <p className="mb-4 text-sm text-slate-400">
        Players who batted or bowled in this match
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamSquad team={match.team1} players={squad.team1} />
        <TeamSquad team={match.team2} players={squad.team2} />
      </div>
    </section>
  )
}

function TeamSquad({ team, players }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: team.color }}
        >
          {team.short}
        </span>
        <div>
          <h3 className="font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-slate-500">{players.length} players with season data</p>
        </div>
      </div>
      {players.length === 0 ? (
        <p className="text-sm text-slate-500">No squad players linked for this season in the dataset.</p>
      ) : (
        <ul className="space-y-2">
          {players.map((p) => (
            <PlayerRow key={p.name} player={p} />
          ))}
        </ul>
      )}
    </div>
  )
}

function PlayerRow({ player }) {
  const p = player.profile
  return (
    <li
      className={`rounded-lg px-3 py-2.5 ${player.isPoM ? 'border border-amber-500/40 bg-amber-500/10' : 'bg-black/20'}`}
    >
      <SquadRowHeader player={player} />
      <SquadRowStats player={player} profile={p} />
    </li>
  )
}

function SquadRowHeader({ player }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-semibold text-white">{player.name}</span>
      {player.isPoM && (
        <span className="rounded bg-amber-500/30 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
          PoM
        </span>
      )}
    </div>
  )
}

function SquadRowStats({ player, profile }) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
      {profile ? (
        <>
          <span>{profile.country}</span>
          <span>{profile.battingLabel}</span>
          {profile.bowlingSkill && <span>{profile.bowlingSkill}</span>}
        </>
      ) : (
        <span>Profile unavailable</span>
      )}
      {player.matchStats && (
        <span className="text-emerald-400/90">
          {player.matchStats.runs != null
            ? `${player.matchStats.runs} (${player.matchStats.balls}) SR ${player.matchStats.strikeRate ?? (player.matchStats.balls ? ((player.matchStats.runs / player.matchStats.balls) * 100).toFixed(2) : '—')}`
            : `${player.matchStats.wickets} wkts · Econ ${player.matchStats.economy}`}
        </span>
      )}
    </div>
  )
}
