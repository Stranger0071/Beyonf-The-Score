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

  // Custom API key configuration states
  const [customKey, setCustomKey] = useState(() => localStorage.getItem('bts_gemini_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [tempKey, setTempKey] = useState(localStorage.getItem('bts_gemini_api_key') || '')

  // Resolve which key to use (custom key has priority)
  const activeApiKey = customKey || GEMINI_API_KEY

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
        setError("Gemini API Quota Limit Reached! Please wait for the countdown below to complete or enter a custom key.")
        setShowKeyInput(true) // Expand key setup panel automatically so the user can bypass it immediately
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
    
    // If we are currently rate-limited, block the request and maintain the error display
    if (countdown > 0) {
      setError("Gemini API Quota Limit Reached! Please wait for the countdown below to complete or enter a custom key.")
      return
    }

    if (activeApiKey && activeApiKey !== "YOUR_API_KEY_HERE") {
      generateNarration(activeApiKey, 'normal')
    } else {
      setError("Please add your Gemini API Key directly in src/components/MatchNarration.jsx (line 4) or enter one below.")
    }
  }, [match.id, activeApiKey])

  const handleTypeChange = (type) => {
    setReportType(type)
    if (type === 'comprehensive' && !comprehensiveNarration && !loading) {
      generateNarration(activeApiKey, 'comprehensive')
    } else if (type === 'normal' && !normalNarration && !loading) {
      generateNarration(activeApiKey, 'normal')
    }
  }

  const saveCustomKey = (key) => {
    const trimmed = key.trim()
    if (trimmed) {
      localStorage.setItem('bts_gemini_api_key', trimmed)
      setCustomKey(trimmed)
      setCountdown(0) // Cancel countdown since we are using a fresh key with fresh limits
      setError('')
    }
  }

  const clearCustomKey = () => {
    localStorage.removeItem('bts_gemini_api_key')
    setCustomKey('')
    setTempKey('')
    setCountdown(0)
    setError('')
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
            /* Premium Rate Limit Countdown Card with Call-To-Action */
            <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border border-amber-500/10 bg-amber-500/[0.03] text-center space-y-4 max-w-xl mx-auto shadow-xl backdrop-blur-md">
              <span className="text-4xl animate-bounce">⏳</span>
              <div>
                <h4 className="text-base font-black text-amber-400 uppercase tracking-widest">Gemini API Quota Exceeded</h4>
                <p className="mt-2 text-sm text-slate-300 font-medium">
                  The Google AI Studio free-tier rate limit (15 requests/min) has been temporarily reached.
                </p>
                <p className="mt-1 text-xs text-slate-400 font-medium">
                  Please hold on for <span className="font-extrabold text-emerald-400 text-sm px-1 bg-emerald-500/10 rounded border border-emerald-500/10">{countdown}s</span> or enter your own Gemini API Key below to bypass shared limits.
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

      {/* Dynamic API Key Setup Panel */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              🔑 Gemini API Key Configuration
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              {customKey 
                ? "Active: Using your custom Gemini API key. All quota limits belong to your personal Google AI Studio account." 
                : "Active: Using system API Key. Running out of quota? Paste your own API key below to bypass shared limits."
              }
            </p>
          </div>
          
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-all uppercase tracking-widest bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/15 hover:bg-emerald-500/20 active:scale-95"
          >
            {showKeyInput ? "Hide Settings" : (customKey ? "Update Custom Key" : "Enter Custom Key")}
          </button>
        </div>

        {showKeyInput && (
          <div className="mt-5 pt-5 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="Paste your Gemini API key (AIzaSy...)"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="flex-1 bg-[#05070a]/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveCustomKey(tempKey)}
                  className="px-4 py-2.5 text-xs font-black uppercase tracking-wider bg-emerald-500 text-[#05070a] rounded-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  Save Key
                </button>
                {customKey && (
                  <button
                    onClick={clearCustomKey}
                    className="px-4 py-2.5 text-xs font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Reset Default
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              💡 Get your own free API key in 10 seconds by visiting <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300 font-bold">Google AI Studio</a>.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
