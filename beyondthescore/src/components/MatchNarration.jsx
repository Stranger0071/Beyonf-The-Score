import { useState, useEffect } from 'react'

// Gemini API key
const GEMINI_API_KEY = "AIzaSyA9W3WjUYLDXKioWFRORYczobIONUj5fnA"

export default function MatchNarration({ match }) {
  const [reportType, setReportType] = useState('normal')
  const [normalNarration, setNormalNarration] = useState('')
  const [comprehensiveNarration, setComprehensiveNarration] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

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

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      if (error && error.includes("Quota Limit Reached")) {
        setError('')
      }
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const generateNarration = async (type) => {
    if (!GEMINI_API_KEY) return
    setLoading(true)
    setError('')
    try {
      const isComp = type === 'comprehensive'
      const prompt = isComp 
        ? `You are an expert cricket analyst and sports commentator. Write a highly detailed, comprehensive match report summarizing this match. 
           Please organize your report into the following sections with clear, bold headers and emojis:
           
           🏟️ VENUE & PITCH CONDITIONS:
           Analyze the venue (${match.venue}) and pitch behavior (spin, pace, bounce, boundary sizes) during this match, and how the toss decision played into this. Include realistic simulated weather details (temperature, humidity, and the crucial dew factor for evening matches) and how they influenced the gameplay (e.g., grip on the ball, swing).
           
           🏏 INNINGS BREAKDOWN & TURNING POINTS:
           A chronological analysis of the key phases of both innings, highlighting pivotal partnerships, critical bowling spells, and momentum-shifting moments.
           
           🎯 TACTICAL REVIEW & MOTM:
           Evaluate the captaincy decisions, tactical execution, and how the Player of the Match (${match.playerOfMatch}) carried their team to victory.
           
           Make it sound highly professional, expert-level, and dramatic. Use clean formatting with double line breaks between sections. Here are the match details:\n${matchContext}`
        : `You are an expert cricket commentator. Write a short, engaging, and highly concise narration (1 paragraph, max 5-6 sentences) summarizing this match. Make it sound professional, dramatic, and focusing on the overall result and key players. Here are the details:\n${matchContext}`

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          })
        }
      )

      // Handle Quota/Rate Limit directly via HTTP status code
      if (response.status === 429) {
        setCountdown(60)
        throw new Error("Quota exceeded")
      }

      const data = await response.json()
      
      // Handle Quota/Rate Limit inside response JSON
      if (data.error?.code === 429 || data.error?.status === "RESOURCE_EXHAUSTED" || (data.error?.message && /quota|exhausted|429/i.test(data.error.message))) {
        setCountdown(60)
        throw new Error("Quota exceeded")
      }

      if (data.error) throw new Error(data.error.message || 'Failed to generate narration')

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        if (isComp) {
          setComprehensiveNarration(text)
        } else {
          setNormalNarration(text)
        }
      }
    } catch (err) {
      if (err.message === "Quota exceeded" || /quota|exhausted|429/i.test(err.message)) {
        setCountdown(60)
        setError("Gemini API Quota Limit Reached! Please wait for the countdown to complete.")
      } else {
        setError(err.message || 'An error occurred while generating the summary.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Clear narration when match changes so we don't show old data
  useEffect(() => {
    setNormalNarration('')
    setComprehensiveNarration('')
    setReportType('normal')
    
    // If we are currently rate-limited, block the request
    if (countdown > 0) {
      setError("Gemini API Quota Limit Reached! Please wait for the countdown to complete.")
      return
    }

    if (GEMINI_API_KEY) {
      generateNarration('normal')
    } else {
      setError("Please add your Gemini API Key in src/components/MatchNarration.jsx (line 4)")
    }
  }, [match.id])

  const handleTypeChange = (type) => {
    setReportType(type)
    if (type === 'comprehensive' && !comprehensiveNarration && !loading) {
      generateNarration('comprehensive')
    } else if (type === 'normal' && !normalNarration && !loading) {
      generateNarration('normal')
    }
  }

  const currentContent = reportType === 'comprehensive' ? comprehensiveNarration : normalNarration

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span>✨</span> AI Match Narration
        </h2>
        <div className="h-px flex-grow bg-white/5" />
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
          Powered by Gemini 2.5 Flash
        </span>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="space-y-6">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-white/5 pb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                AI Match Commentary
              </p>
              <h3 className="text-lg font-bold text-white mt-1">
                {match.team1.short} vs {match.team2.short}
              </h3>
            </div>
            
            {/* Toggle Pills */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 w-fit shrink-0">
              <button
                onClick={() => handleTypeChange('normal')}
                disabled={loading || countdown > 0}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
                  reportType === 'normal'
                    ? 'bg-emerald-500 text-[#05070a] shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                } ${(loading || countdown > 0) ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                Quick Summary
              </button>
              <button
                onClick={() => handleTypeChange('comprehensive')}
                disabled={loading || countdown > 0}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${
                  reportType === 'comprehensive'
                    ? 'bg-emerald-500 text-[#05070a] shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                } ${(loading || countdown > 0) ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                Comprehensive Report
              </button>
            </div>
          </div>

          {/* Loader */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-xs font-bold text-emerald-500 animate-pulse uppercase tracking-widest">
                Generating {reportType === 'comprehensive' ? 'Comprehensive Report' : 'Quick Summary'}...
              </p>
            </div>
          ) : countdown > 0 ? (
            /* Rate Limit Countdown Card */
            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border border-amber-500/10 bg-amber-500/[0.03] text-center space-y-4 max-w-xl mx-auto shadow-xl backdrop-blur-md">
              <span className="text-4xl animate-bounce">⏳</span>
              <div>
                <h4 className="text-base font-black text-amber-400 uppercase tracking-widest">Gemini API Quota Exceeded</h4>
                <p className="mt-2 text-sm text-slate-300 font-medium">
                  The Google AI Studio free-tier rate limit has been temporarily reached.
                </p>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Please hold on for <span className="font-extrabold text-emerald-400 text-sm px-1 bg-emerald-500/10 rounded border border-emerald-500/10">{countdown}s</span> before requesting a new AI narration.
                </p>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden max-w-xs mt-2 ring-1 ring-white/10">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(countdown / 60) * 100}%` }}
                />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <p className="text-sm font-bold text-red-400">{error}</p>
            </div>
          ) : currentContent ? (
            <div className="relative">
              <span className="absolute -left-4 -top-4 text-6xl text-white/5 font-serif">"</span>
              <div className="text-slate-300 font-medium relative z-10 whitespace-pre-line leading-relaxed text-sm sm:text-base space-y-4">
                {currentContent}
              </div>
              <span className="absolute -bottom-8 right-0 text-6xl text-white/5 font-serif rotate-180">"</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
