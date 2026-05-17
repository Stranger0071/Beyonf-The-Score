import { useEffect, useMemo, useState } from 'react'
import { getMatches, getDatasetStats, loadMatchFull, seasons, enrichDatasetStats } from './data/loadMatches'
import { getMatchPlayers } from './data/loadPlayers'
import { glossary } from './data/glossary'
import Header from './components/Header'
import MatchScorecard from './components/MatchScorecard'
import MatchAnalytics from './components/MatchAnalytics'
import InsightCards from './components/InsightCards'
import KeyMoments from './components/KeyMoments'
import PlayerSpotlight from './components/PlayerSpotlight'
import MatchSquad from './components/MatchSquad'
import DatasetStats from './components/DatasetStats'
import Glossary from './components/Glossary'
import NavBar from './components/NavBar'
import HeadToHead from './components/HeadToHead'
import VenueStats from './components/VenueStats'
function App() {
  const [season, setSeason] = useState('all')
  const filtered = useMemo(() => getMatches(season), [season])
  const [matchId, setMatchId] = useState(filtered[0]?.id)
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(() => getDatasetStats())
  const [activeTab, setActiveTab] = useState('section-scorecard')

  const indexEntry = filtered.find((m) => m.id === matchId) ?? filtered[0]

  useEffect(() => {
    enrichDatasetStats().then((extra) => setStats((s) => ({ ...s, ...extra })))
  }, [])

  useEffect(() => {
    if (!indexEntry) {
      setMatch(null)
      setLoading(false)
      return
    }
    setLoading(true)
    loadMatchFull(indexEntry.id, indexEntry.year)
      .then((full) => setMatch(full))
      .finally(() => setLoading(false))
  }, [indexEntry?.id, indexEntry?.year])

  const squad = useMemo(() => (match ? getMatchPlayers(match) : null), [match])

  const handleSeasonChange = (value) => {
    setSeason(value)
    const next = getMatches(value)
    if (next.length) setMatchId(next[0].id)
  }

  if (!indexEntry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f14] text-white">
        No matches found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a] px-4 py-10 text-white sm:px-6 lg:py-16">
      <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="mx-auto max-w-6xl space-y-12">
        <Header
          match={match ?? indexEntry}
          matches={filtered}
          season={season}
          seasons={seasons}
          yearRange={stats.yearRange}
          onMatchChange={setMatchId}
          onSeasonChange={handleSeasonChange}
        />
        {activeTab === 'section-overview' && <DatasetStats stats={stats} />}

        {loading && (
          <p className="rounded-xl border border-white/10 bg-white/5 py-12 text-center text-slate-400">
            Loading ball-by-ball data…
          </p>
        )}

        {!loading && match && (
          <div className="min-h-[400px]">
            {activeTab === 'section-scorecard' && <MatchScorecard match={match} />}
            {activeTab === 'section-analytics' && <MatchAnalytics match={match} />}
            {activeTab === 'section-performers' && <PlayerSpotlight playerOfMatch={squad?.playerOfMatch} />}
            {activeTab === 'section-squad' && <MatchSquad squad={squad} match={match} />}
            {activeTab === 'section-h2h' && <HeadToHead match={match} />}
            {activeTab === 'section-venue' && <VenueStats match={match} />}
            {activeTab === 'section-insights' && <InsightCards insights={match.insights} />}
            {activeTab === 'section-timeline' && <KeyMoments moments={match.keyMoments} />}
            {activeTab === 'section-glossary' && <Glossary terms={glossary} />}
          </div>
        )}

        <footer className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          Beyond The Score · {stats.total} matches ({stats.yearRange})
        </footer>
      </div>
    </div>
  )
}

export default App
