import { useState, useEffect } from 'react'

// Replace this string with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyBgpxjAuUYbfm2kOfXBOzTsomwG7Ar-9YE"

export default function MatchNarration({ match }) {
  const [narration, setNarration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Construct match context for the AI
  const matchContext = `
    Match: ${match.team1.name} vs ${match.team2.name} (${match.year} season)
    Venue: ${match.venue}
    Toss: ${match.tossWinner} won and chose to ${match.tossDecision}
    First Innings: ${match.team1.runs}/${match.team1.wickets} in ${match.team1.overs} overs
    Second Innings: ${match.team2.runs}/${match.team2.wickets} in ${match.team2.overs} overs
    Result: ${match.winner} won by ${match.margin}
    Player of the Match: ${match.playerOfMatch}
  `

  const generateNarration = async (keyToUse) => {
    if (!keyToUse) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert cricket commentator. Write a short, engaging, and highly concise narration (1 paragraph) summarizing this IPL match. Make it sound professional and dramatic. Here are the details:\n${matchContext}`
                  }
                ]
              }
            ]
          })
        }
      )

      const data = await response.json()
      if (data.error) throw new Error(data.error.message || 'Failed to generate narration')

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) setNarration(text)
    } catch (err) {
      setError(err.message || 'An error occurred while generating the summary.')
    } finally {
      setLoading(false)
    }
  }

  // Clear narration when match changes so we don't show old data
  useEffect(() => {
    setNarration('')
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_HERE") {
      generateNarration(GEMINI_API_KEY)
    } else {
      setError("Please add your Gemini API Key directly in src/components/MatchNarration.jsx (line 4)")
    }
  }, [match.id])

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span>✨</span> AI Match Narration
        </h2>
        <div className="h-px flex-grow bg-white/5" />
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
          Powered by Gemini
        </span>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              AI Match Commentary
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-xs font-bold text-emerald-500 animate-pulse uppercase tracking-widest">Generating Narration...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <p className="text-sm font-bold text-red-400">{error}</p>
            </div>
          ) : narration ? (
            <div className="relative">
              <span className="absolute -left-4 -top-4 text-6xl text-white/5 font-serif">"</span>
              <p className="text-lg leading-relaxed text-slate-300 font-medium relative z-10">
                {narration}
              </p>
              <span className="absolute -bottom-8 right-0 text-6xl text-white/5 font-serif rotate-180">"</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
