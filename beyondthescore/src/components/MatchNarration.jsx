import { useState, useEffect } from 'react'

// Replace this string with your actual Gemini API key or use .env.local
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

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

  // Timer Effect to decrement the countdown and auto-retry when it finishes
  useEffect(() => {
    if (countdown <= 0) {
      if (error === 'quota_exceeded') {
        setError('')
        if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_HERE") {
          generateNarration(GEMINI_API_KEY, reportType)
        }
      }
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown, error])

  const generateNarration = async (keyToUse, type) => {
    if (!keyToUse) return
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${keyToUse}`,
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

      if (response.status === 429) {
        setCountdown(60)
        throw new Error('quota_exceeded')
      }

      const data = await response.json()
      if (data.error) {
        if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED' || /quota/i.test(data.error.message)) {
          setCountdown(60)
          throw new Error('quota_exceeded')
        }
        throw new Error(data.error.message || 'Failed to generate narration')
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        if (isComp) {
          setComprehensiveNarration(text)
        } else {
          setNormalNarration(text)
        }
      }
    } catch (err) {
      if (err.message === 'quota_exceeded') {
        setError('quota_exceeded')
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
    
    if (countdown > 0) {
      setError('quota_exceeded')
      return
    }

    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_HERE") {
      generateNarration(GEMINI_API_KEY, 'normal')
    } else {
      setError("Please add your Gemini API Key directly in src/components/MatchNarration.jsx (line 4)")
    }
  }, [match.id])

  const handleTypeChange = (type) => {
    setReportType(type)
    if (countdown > 0) {
      setError('quota_exceeded')
      return
    }
    
    if (type === 'comprehensive' && !comprehensiveNarration && !loading) {
      generateNarration(GEMINI_API_KEY, 'comprehensive')
    } else if (type === 'normal' && !normalNarration && !loading) {
      generateNarration(GEMINI_API_KEY, 'normal')
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
                }`}
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
                }`}
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
          ) : error ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center space-y-4">
              {error === 'quota_exceeded' ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-4">
                  <div className="flex justify-center text-5xl animate-bounce">⚠️</div>
                  <p className="text-lg font-black text-amber-400">
                    API Quota Limit Exceeded
                  </p>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto font-medium">
                    You've reached the free tier limit (15 requests/min) for the Gemini API. 
                    To ensure smooth performance, requests are temporarily paused.
                  </p>
                  <div className="inline-flex items-center gap-3 rounded-full bg-amber-500/10 px-5 py-2.5 border border-amber-500/25">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="text-sm font-black text-amber-400 tracking-wider">
                      Auto-retrying in {countdown}s
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold text-red-400">{error}</p>
              )}
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
