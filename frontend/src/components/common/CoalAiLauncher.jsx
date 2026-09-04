import { useEffect, useState } from 'react'
import { Bot, MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CoalAiLauncher() {
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true)
      setOpen(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        className={`pointer-events-auto w-[min(320px,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl border border-[#29414b] bg-[#101c24] text-white shadow-[0_16px_35px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out dark:border-slate-700 dark:bg-slate-900 ${open && ready ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-4 scale-95 opacity-0'}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5a416] text-[#17232a]"><Bot className="h-4 w-4" /></div>
            <div>
              <p className="text-sm font-semibold">Coal AI</p>
              <p className="text-[10px] text-[#9db0b5]">Ready to help</p>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Minimize Coal AI" title="Minimize Coal AI">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm leading-6 text-[#d5dfdf]">Ask about inspections, compliance, mine safety, or operational risk.</p>
          <button type="button" onClick={() => navigate('/app/chat')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#e5a416] px-4 py-2.5 text-sm font-bold text-[#151719] transition hover:bg-[#f5b82c]">
            <MessageCircle className="h-4 w-4" />
            Open Coal AI
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#dfe6ee] bg-[#f7f4ef] text-[#17314a] shadow-[0_8px_22px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 dark:border-slate-200 ${open && ready ? 'rotate-0' : 'rotate-0'}`}
        aria-label={open ? 'Minimize Coal AI' : 'Open Coal AI'}
        title={open ? 'Minimize Coal AI' : 'Open Coal AI'}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>
    </div>
  )
}
