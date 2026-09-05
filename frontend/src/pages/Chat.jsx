import { useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import { saveChatMessage } from "../services/api";

const getAssistantReply = (message) => {
  const lower = message.toLowerCase();
  const mentionsMine =
    /(jayant|amlohri|nigahi|kusmunda|gevra|dipka|dudhichua|singrauli|korba)/.test(
      lower,
    );

  if (
    lower.includes("overdue") ||
    lower.includes("urgent") ||
    lower.includes("alert")
  ) {
    return "Priority response plan:\n1. Open Alerts and sort by Critical, then High.\n2. Assign one accountable owner and a due date for each item.\n3. Attach inspection evidence or compliance proof before closing it.\n4. Escalate unresolved critical safety issues to the mine manager immediately.";
  }
  if (lower.includes("inspection") || lower.includes("inspect")) {
    return `A complete inspection should include:\n1. Select the mine — its pin will move to the correct location.\n2. Record a specific title, observations, photos, and voice note.\n3. Add every violation with severity, corrective action, owner, and target date.\n4. Review the live preview before submitting.${mentionsMine ? "\n\nI noticed you mentioned a mine; confirm the pin matches the field location before creating the report." : ""}`;
  }
  if (lower.includes("risk") || lower.includes("safety")) {
    return "Safety prioritisation:\n• Act on critical and high-risk mines first.\n• Check unresolved violations, overdue corrective actions, and the latest risk score.\n• Put interim controls in place before the permanent fix.\n• Record the action owner and review date so the escalation remains traceable.";
  }
  if (lower.includes("compliance") || lower.includes("permit")) {
    return "Compliance workflow:\n1. Filter the register for overdue and due-this-month items.\n2. Verify the statutory reference and responsible person.\n3. Upload or record completion evidence.\n4. Set the next due date and keep the audit trail complete.";
  }
  if (lower.includes("contractor")) {
    return "For contractor oversight, review contract status, mine assignments, compliance score, induction records, and open corrective actions. The demo account for Ananya Singh at Shakti Infra & Mining Contractors is available on the login page.";
  }
  if (/\b(hello|hi|hey)\b/.test(lower)) {
    return "Hello. I can help you decide what to do next with inspections, overdue compliance, contractor performance, mine risk, or safety escalation. Tell me the mine and issue for a focused response.";
  }

  if (
    lower.includes("attention") ||
    lower.includes("today") ||
    lower.includes("summary")
  ) {
    return "Today’s recommended review order:\n1. Critical and high-severity alerts.\n2. Overdue compliance obligations.\n3. Inspections with open violations.\n4. Contractor records with lower compliance scores.\n\nOpen the dashboard first, then use Alerts and Compliances to assign and track actions.";
  }

  return "I can turn this into an operational next step. Tell me the mine, the issue, its severity, and whether an inspection or compliance deadline is involved; I will suggest a prioritised response.";
};

const prompts = [
  "What needs attention today?",
  "How do I create a good inspection?",
  "How should I handle an overdue compliance?",
];

export default function Chat() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: `Hello${user?.name ? ` ${user.name}` : ""}! I can help with inspections, compliance, mine safety, and dashboards.`,
    },
  ]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    const reply = getAssistantReply(message);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: message },
    ]);
    setSending(true);

    try {
      await saveChatMessage({ email: user?.email, message, reply });
      setMessages((current) => [
        ...current,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I could not process that right now. Please try again.",
        },
      ]);
      toast.error("Could not send your message");
    } finally {
      setSending(false);
    }
  };

  const askPrompt = (prompt) => {
    if (sending) return;
    const reply = getAssistantReply(prompt);
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: prompt },
      { id: Date.now() + 1, sender: "bot", text: reply },
    ]);
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8 dark:text-slate-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6b16]">
            {t.operationsAssistant}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#17314a] dark:text-white">
            {t.coalAi}
          </h1>
          <p className="mt-1 text-sm text-[#655b4e] dark:text-slate-400">
            {t.chatSubtitle}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#bfd9c8] bg-[#edf8f0] px-3 py-2 text-xs font-semibold text-[#267044] sm:flex">
          <ShieldCheck className="h-4 w-4" /> {t.secureSession}
        </div>
      </div>

      <div className="flex min-h-[520px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#d7c7ab] bg-[#fffdf9] shadow-[0_10px_30px_rgba(74,54,32,0.1)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="flex items-center gap-3 border-b border-[#e6dccb] bg-[#17314a] px-5 py-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5a416] text-[#17314a]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{t.coalAiAssistant}</p>
            <p className="text-xs text-[#c9d8e2]">{t.readyToHelp}</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f1e7] p-4 sm:p-6 dark:bg-slate-800">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Bot className="mb-1 h-4 w-4 shrink-0 text-[#9b6b16]" />
              )}
              <div
                className={`max-w-[min(80%,38rem)] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-sm bg-[#cfeaf9] text-[#10263d] dark:bg-sky-900/70 dark:text-sky-100" : "rounded-bl-sm bg-white text-[#3d392f] shadow-sm dark:bg-slate-700 dark:text-slate-100"}`}
              >
                {message.text}
              </div>
              {message.sender === "user" && (
                <User className="mb-1 h-4 w-4 shrink-0 text-[#17314a]" />
              )}
            </div>
          ))}
          {sending && (
            <p className="pl-6 text-xs text-[#786f63]">{t.thinking}</p>
          )}
          {messages.length === 1 && (
            <div className="ml-6 flex flex-wrap gap-2 pt-1">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askPrompt(prompt)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#d7c7ab] bg-white px-3 py-2 text-xs font-medium text-[#17314a] transition hover:border-[#9b6b16] hover:bg-[#fff8e8] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                >
                  <Sparkles className="h-3 w-3 text-[#b77909]" /> {prompt}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-[#e6dccb] bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 rounded-xl border border-[#cdbd9f] bg-[#fffdf9] px-3 py-2 focus-within:border-[#17314a] focus-within:ring-2 focus-within:ring-[#17314a]/10 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-sky-400">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.askCoalAi}
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-[#17314a] outline-none placeholder:text-[#958a7b] dark:text-white dark:placeholder:text-slate-500"
              disabled={sending}
              aria-label={t.messageCoalAi}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e5a416] text-[#151719] transition hover:bg-[#f5b82c] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
