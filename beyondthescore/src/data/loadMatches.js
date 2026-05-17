import { parseCsv } from '../utils/csvParser'
import index from './ipl-index.json'

let cachedMatchesCsv = null

export async function fetchMatchesCsv() {
  if (cachedMatchesCsv) return cachedMatchesCsv
  try {
    const res = await fetch('/matches.csv')
    const text = await res.text()
    cachedMatchesCsv = parseCsv(text)
    return cachedMatchesCsv
  } catch (e) {
    console.error('Failed to load matches.csv', e)
    return []
  }
}

const yearCache = new Map()

const indexSorted = [...index].sort(
  (a, b) => b.year - a.year || Number(b.id) - Number(a.id),
)

export const seasons = [...new Set(indexSorted.map((m) => m.year))].sort((a, b) => b - a)

export function getMatches(seasonFilter = 'all') {
  if (seasonFilter === 'all') return indexSorted
  return indexSorted.filter((m) => m.year === Number(seasonFilter))
}

export async function loadMatchFull(id, year) {
  if (!yearCache.has(year)) {
    const data = await import(`./ipl-by-year/${year}.json`)
    yearCache.set(year, data.default)
  }
  return yearCache.get(year).find((m) => m.id === String(id)) ?? null
}

export function getDatasetStats() {
  const total = indexSorted.length
  const tossWins = indexSorted.filter((m) => m.tossWinner === m.winner).length

  return {
    total,
    tossWinPct: Math.round((tossWins / total) * 100),
    runWinPct: 0,
    chaseWinPct: 0,
    seasons: seasons.length,
    yearRange: `${Math.min(...seasons)}–${Math.max(...seasons)}`,
    totalBalls: null,
  }
}

export async function enrichDatasetStats() {
  let totalBalls = 0
  let runWins = 0
  let chaseWins = 0
  for (const year of seasons) {
    const data = await import(`./ipl-by-year/${year}.json`)
    for (const m of data.default) {
      totalBalls += m.innings.reduce((s, inn) => s + inn.balls, 0)
      if (/runs/i.test(m.winOutcome || '')) runWins++
      if (/wicket/i.test(m.winOutcome || '')) chaseWins++
    }
  }
  return { totalBalls, runWinPct: Math.round((runWins / indexSorted.length) * 100), chaseWinPct: Math.round((chaseWins / indexSorted.length) * 100) }
}

export { indexSorted as allMatches }
