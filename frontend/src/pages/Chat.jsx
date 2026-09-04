import { useState } from 'react'
import { Bot, Send, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../store/authStore'
import { saveChatMessage } from '../services/api'

const getAssistantReply = (message) => {
  const lower = message.toLowerCase()

  if (lower.includes('inspection') || lower.includes('inspect')) {
    return 'You can review inspection status, photos, and voice notes from the dashboard and inspection module.'
  }
  if (lower.includes('risk') || lower.includes('safety')) {
    return 'I can help prioritize high-risk mines and track safety escalations in real time.'
  }
  if (lower.includes('compliance') || lower.includes('permit')) {
    return 'Compliance tracking is available for permits, deadlines, and alert follow-up across all mines.'
  }
  if (lower.includes('contractor')) {
    return 'You can review team compliance, contractor performance, and approval history from the contractor section.'
  }
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hi! I can help you navigate inspections, alerts, risk trends, and site compliance.'
  }

  return 'I can help you with mine governance, compliance, inspection workflows, and operational risk analysis.'
}

export default function Chat() {
  const { user } = useAuthStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello${user?.name ? ` ${user.name}` : ''}! I can help with inspections, compliance, mine safety, and dashboards.`,
    },
  ])

  const handleSend = async (event) => {
    event.preventDefault()
    const message = input.trim()
    if (!message || sending) return

    const reply = getAssistantReply(message)
    setInput('')
    setMessages((current) => [...current, { id: Date.now(), sender: 'user', text: message }])
    setSending(true)

    try {
      await saveChatMessage({ email: user?.email, message, reply })
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, sender: 'bot', text: reply },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, sender: 'bot', text: 'I could not process that right now. Please try again.' },
      ])
      toast.error('Could not send your message')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8 dark:text-slate-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b16]">Operations assistant</p>
          <h1 className="mt-1 text-3xl font-bold text-[#17314a] dark:text-white">Coal AI</h1>
          <p className="mt-1 text-sm text-[#655b4e] dark:text-slate-400">Ask questions about mine safety, inspections, compliance, or risk.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#bfd9c8] bg-[#edf8f0] px-3 py-2 text-xs font-semibold text-[#267044] sm:flex">
          <ShieldCheck className="h-4 w-4" /> Secure session
        </div>
      </div>

      <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#d7c7ab] bg-[#fffdf9] shadow-[0_10px_30px_rgba(74,54,32,0.1)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center gap-3 border-b border-[#e6dccb] bg-[#17314a] px-5 py-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5a416] text-[#17314a]"><Bot className="h-5 w-5" /></div>
          <div>
            <p className="font-semibold">Coal AI assistant</p>
            <p className="text-xs text-[#c9d8e2]">Ready to help with your operations</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f1e7] p-4 sm:p-6 dark:bg-slate-800">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.sender === 'bot' && <Bot className="mb-1 h-4 w-4 shrink-0 text-[#9b6b16]" />}
              <div className={`max-w-[min(80%,38rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === 'user' ? 'rounded-br-sm bg-[#cfeaf9] text-[#10263d] dark:bg-sky-900/70 dark:text-sky-100' : 'rounded-bl-sm bg-white text-[#3d392f] shadow-sm dark:bg-slate-700 dark:text-slate-100'}`}>
                {message.text}
              </div>
              {message.sender === 'user' && <User className="mb-1 h-4 w-4 shrink-0 text-[#17314a]" />}
            </div>
          ))}
          {sending && <p className="pl-6 text-xs text-[#786f63]">Coal AI is thinking...</p>}
        </div>

        <form onSubmit={handleSend} className="border-t border-[#e6dccb] bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 rounded-xl border border-[#cdbd9f] bg-[#fffdf9] px-3 py-2 focus-within:border-[#17314a] focus-within:ring-2 focus-within:ring-[#17314a]/10 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-sky-400">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Coal AI a question..."
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[#17314a] outline-none placeholder:text-[#958a7b] dark:text-white dark:placeholder:text-slate-500"
              disabled={sending}
              aria-label="Message Coal AI"
            />
            <button type="submit" disabled={sending || !input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e5a416] text-[#151719] transition hover:bg-[#f5b82c] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Send message" title="Send message">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
