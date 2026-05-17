import { useState, useEffect } from 'react'

// Replace this string with your actual Gemini API key or use .env.local
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""

// Clean markdown formatting characters like **, *, ## from LLM responses
const cleanMarkdown = (text) => {
  if (!text) return ''
  return text
    // Convert markdown list bullet points (* or -) to actual bullet character •
    .replace(/^\s*[\-\*]\s+/gm, '• ')
    // Remove bold markdown (**text**)
    .replace(/\*\*/g, '')
    // Remove italic markdown (*text*)
    .replace(/\*/g, '')
    // Remove markdown headers like ## or ### from any line but preserve emojis and text
    .replace(/^[#\s]+/gm, '')
    .trim()
}

export default function MatchNarration({ match }) {
  const [reportType, setReportType] = useState('normal')
  const [normalNarration, setNormalNarration] = useState('')
  const [comprehensiveNarration, setComprehensiveNarration] = useState('')
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

  const generateNarration = async (keyToUse, type) => {
    if (!keyToUse) return
    setLoading(true)
    setError('')
    try {
      const isComp = type === 'comprehensive'
      const prompt = isComp 
        ? `You are an expert cricket analyst and sports commentator. Write a highly detailed, comprehensive match report summarizing this match. 
           Please organize your report into the following sections using double line breaks. 
           DO NOT use markdown bold marks (**) or header symbols (# or ##). Write clean, standard plain text with clear uppercase headers and emojis:
           
           🏟️ VENUE & PITCH CONDITIONS:
           Analyze the venue (${match.venue}) and pitch behavior (spin, pace, bounce, boundary sizes) during this match, and how the toss decision played into this. Include realistic simulated weather details (temperature, humidity, and the crucial dew factor for evening matches) and how they influenced the gameplay (e.g., grip on the ball, swing).
           
           🏏 INNINGS BREAKDOWN & TURNING POINTS:
           A chronological analysis of the key phases of both innings, highlighting pivotal partnerships, critical bowling spells, and momentum-shifting moments.
           
           🎯 TACTICAL REVIEW & MOTM:
           Evaluate the captaincy decisions, tactical execution, and how the Player of the Match (${match.playerOfMatch}) carried their team to victory.
           
           Make it sound highly professional, expert-level, and dramatic. Use clean formatting with double line breaks between sections. Here are the match details:\n${matchContext}`
        : `You are an expert cricket commentator. Write a short, engaging, and highly concise narration (1 paragraph, max 5-6 sentences) summarizing this match. 
           DO NOT use any markdown characters like ** for bolding or #/## for headers. Make it sound professional, dramatic, and focusing on the overall result and key players. Here are the details:\n${matchContext}`

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

      const data = await response.json()
      if (data.error) throw new Error(data.error.message || 'Failed to generate narration')

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) {
        const cleanedText = cleanMarkdown(text)
        if (isComp) {
          setComprehensiveNarration(cleanedText)
        } else {
          setNormalNarration(cleanedText)
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the summary.')
    } finally {
      setLoading(false)
    }
  }

  // Clear narration when match changes so we don't show old data
  useEffect(() => {
    setNormalNarration('')
    setComprehensiveNarration('')
    setReportType('normal')
    if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_API_KEY_HERE") {
      generateNarration(GEMINI_API_KEY, 'normal')
    } else {
      setError("Please add your Gemini API Key directly in src/components/MatchNarration.jsx (line 4)")
    }
  }, [match.id])

  const handleTypeChange = (type) => {
    setReportType(type)
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
                disabled={loading}
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
                disabled={loading}
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
            <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 text-center">
              <p className="text-sm font-bold text-red-400">{error}</p>
            </div>
          ) : currentContent ? (
            <div className="relative">
              <span className="absolute -left-4 -top-4 text-6xl text-white/5 font-serif">"</span>
              <div className="relative z-10 space-y-6 text-sm sm:text-base leading-relaxed">
                {currentContent.split('\n\n').filter(p => p.trim() !== '').map((paragraph, idx) => {
                  const isHeader = /^[🏟️🏏🎯🌟🔥🏆👑📢]/.test(paragraph.trim())
                  if (isHeader) {
                    return (
                      <h4 key={idx} className="text-base sm:text-lg font-black tracking-tight text-white border-b border-white/5 pb-2 pt-4 first:pt-0">
                        {paragraph}
                      </h4>
                    )
                  }
                  return (
                    <p key={idx} className="whitespace-pre-line text-slate-300 font-normal">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
              <span className="absolute -bottom-8 right-0 text-6xl text-white/5 font-serif rotate-180">"</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
