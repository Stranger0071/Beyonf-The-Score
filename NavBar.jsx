import { useState, useEffect, useRef } from 'react'

const NAV_ITEMS = [
  { id: 'section-overview', label: 'Overview', icon: '◎' },
  { id: 'section-narration', label: 'AI Summary', icon: '✨' },
  { id: 'section-scorecard', label: 'Scorecard', icon: '🏏' },
  { id: 'section-analytics', label: 'Analytics', icon: '📊' },
  { id: 'section-performers', label: 'Performers', icon: '⭐' },
  { id: 'section-squad', label: 'Squads', icon: '👥' },
  { id: 'section-h2h', label: 'Head-to-Head', 'icon': '⚔️' },
  { id: 'section-venue', label: 'Venue', icon: '🏟️' },
  { id: 'section-insights', label: 'Insights', icon: '💡' },
  { id: 'section-timeline', label: 'Timeline', icon: '⏱' },
  { id: 'section-glossary', label: 'Glossary', icon: '📖' },
]

export default function NavBar({ activeTab, onTabChange }) {
  const [visible, setVisible] = useState(true)

  const handleTabClick = (id) => {
    onTabChange(id)
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex justify-center py-4 px-4 transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
    >
      <div className="flex w-fit max-w-full items-center justify-center gap-1 rounded-[1.5rem] border border-white/[0.08] bg-[#05070a]/80 px-2.5 py-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        {/* Logo pill */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mr-1 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#05070a] shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          BTS
        </button>

        <div className="h-6 w-px bg-white/10 shrink-0 mx-1" />

        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-[11px] font-bold tracking-tight transition-all duration-200 ${isActive
                  ? 'bg-white/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(52,211,153,0.15)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
            >
              <span className="text-[12px] opacity-90">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
              {isActive && (
                <div className="ml-1 h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
