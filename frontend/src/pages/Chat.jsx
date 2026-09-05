import { useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import { saveChatMessage } from "../services/api";

const getAssistantReply = (message, language = "en") => {
  const lower = message.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
  const isHindi = language === "hi";
  const has = (...terms) =>
    terms.some((term) => {
      const normalizedTerm = term.toLowerCase().trim();
      if (!normalizedTerm) return false;
      if (normalizedTerm.includes(" ")) return lower.includes(normalizedTerm);
      return new RegExp(`(?:^|\\s)${normalizedTerm}(?:$|\\s)`, "u").test(
        lower,
      );
    });
  const mineNames = [
    "Jayant",
    "Amlohri",
    "Nigahi",
    "Kusmunda",
    "Gevra",
    "Dipka",
    "Dudhichua",
    "Singrauli",
    "Korba",
  ];
  const mentionedMine = mineNames.find((mine) =>
    lower.includes(mine.toLowerCase()),
  );
  const mineNote = mentionedMine
    ? isHindi
      ? `\n\n${mentionedMine} के लिए कार्रवाई दर्ज करते समय सही खदान फ़िल्टर और निरीक्षण स्थान की पुष्टि करें।`
      : `\n\nFor ${mentionedMine}, confirm the mine filter and inspection location before recording the action.`
    : "";

  if (has("hello", "hi", "hey", "नमस्ते", "हेलो")) {
    return isHindi
      ? "नमस्ते। मैं अलर्ट, निरीक्षण, अनुपालन, जोखिम, ठेकेदार और डैशबोर्ड कार्रवाई में मदद कर सकता हूँ। उदाहरण के लिए पूछें: ‘आज सबसे जरूरी क्या है?’"
      : "Hello. I can help with alerts, inspections, compliance, risk, contractors, and dashboard actions. Try asking, ‘What needs attention today?’";
  }

  if (has("help", "what can you do", "मदद", "क्या कर सकते")) {
    return isHindi
      ? "मैं इन कामों में मदद कर सकता हूँ:\n• आज की प्राथमिकताएँ और critical alerts\n• निरीक्षण और corrective actions\n• overdue compliance और permits\n• mine risk और trend review\n• contractor compliance\n\nकिसी खदान का नाम, समस्या और deadline दें, मैं अगला action plan बनाऊँगा।"
      : "I can help with:\n• Today’s priorities and critical alerts\n• Inspections and corrective actions\n• Overdue compliance and permits\n• Mine risk and trend review\n• Contractor compliance\n\nShare the mine, issue, and deadline and I’ll turn it into a clear action plan.";
  }

  if (has("go", "open", "show", "demo", "navigate", "जाएँ", "खोलें")) {
    if (has("dashboard", "डैशबोर्ड")) {
      return isHindi
        ? "डैशबोर्ड खोलकर पहले risk distribution, high-risk inspections और recent alerts देखें। फिर किसी item को खोलकर owner और due date असाइन करें।"
        : "Open the dashboard and start with risk distribution, high-risk inspections, and recent alerts. Open an item next, then assign an owner and due date.";
    }
    if (has("alert", "अलर्ट")) {
      return isHindi
        ? "Alerts में Critical और High को पहले फ़िल्टर करें। प्रभावित खदान, तत्काल नियंत्रण, owner और due date की पुष्टि करें।"
        : "In Alerts, filter Critical and High first. Confirm the affected mine, interim control, owner, and due date before closing anything.";
    }
    if (has("inspection", "निरीक्षण")) {
      return isHindi
        ? "Inspections खोलें, सही खदान चुनें और नया निरीक्षण बनाएँ। हर finding में severity, corrective action, owner और target date भरें।"
        : "Open Inspections, choose the correct mine, and create a new inspection. Add severity, corrective action, owner, and target date for every finding.";
    }
    return isHindi
      ? "मैं आपको सही मॉड्यूल तक ले जा सकता हूँ। Dashboard, alerts, inspections, compliance या contractors में से कौन सा खोलना है?"
      : "I can guide you to the right module. Should we open the dashboard, alerts, inspections, compliance, or contractors?";
  }

  if (
    has(
      "today",
      "attention",
      "summary",
      "priority",
      "urgent",
      "आज",
      "ध्यान",
      "सारांश",
      "जरूरी",
    )
  ) {
    return isHindi
      ? "आज की प्राथमिकता:\n1. Alerts में Critical और High आइटम खोलें।\n2. Overdue अनुपालन को जिम्मेदार व्यक्ति और तारीख दें।\n3. खुले उल्लंघनों वाले निरीक्षणों की समीक्षा करें।\n4. कम compliance score वाले ठेकेदार देखें।\n\nहर कार्रवाई का मालिक, अंतरिम नियंत्रण और अगली समीक्षा तिथि दर्ज करें।"
      : "Today’s priority:\n1. Open Critical and High items in Alerts.\n2. Assign an owner and due date to overdue compliance.\n3. Review inspections with open violations.\n4. Check contractors with lower compliance scores.\n\nRecord an owner, interim control, and next review date for every action.";
  }

  if (
    has(
      "alert",
      "overdue",
      "late",
      "escalat",
      "अलर्ट",
      "समय सीमा",
      "समयसीमा",
      "तत्काल",
    )
  ) {
    return isHindi
      ? `अलर्ट कार्रवाई योजना:\n1. Critical, फिर High के अनुसार छाँटें।\n2. प्रभावित खदान और तत्काल खतरे की पुष्टि करें।\n3. जिम्मेदार व्यक्ति, समय-सीमा और अंतरिम नियंत्रण जोड़ें।\n4. प्रमाण संलग्न करके ही आइटम बंद करें; गंभीर सुरक्षा मुद्दे प्रबंधक तक पहुँचाएँ।${mineNote}`
      : `Alert action plan:\n1. Sort Critical first, then High.\n2. Confirm the affected mine and immediate hazard.\n3. Add an accountable owner, due date, and interim control.\n4. Attach evidence before closing; escalate critical safety issues to the mine manager.${mineNote}`;
  }

  if (has("inspection", "inspect", "checklist", "निरीक्षण", "जांच", "जाँच")) {
    return isHindi
      ? `निरीक्षण चेकलिस्ट:\n1. सही खदान और स्थान चुनें।\n2. स्पष्ट शीर्षक, तथ्यात्मक अवलोकन, फोटो और वॉइस नोट जोड़ें।\n3. हर उल्लंघन में गंभीरता, सुधारात्मक कार्रवाई, मालिक और लक्ष्य तिथि भरें।\n4. सबमिट करने से पहले प्रीव्यू और प्रमाण जाँचें।${mineNote}`
      : `Inspection checklist:\n1. Select the correct mine and location.\n2. Add a specific title, factual observations, photos, and a voice note.\n3. For each violation, set severity, corrective action, owner, and target date.\n4. Review the preview and evidence before submitting.${mineNote}`;
  }

  if (has("risk", "safety", "hazard", "danger", "जोखिम", "सुरक्षा", "खतरा")) {
    return isHindi
      ? `सुरक्षा प्राथमिकता:\n• पहले Critical और High जोखिम पर काम करें।\n• खुले उल्लंघन, लंबित सुधार और नवीनतम risk score देखें।\n• स्थायी समाधान तक अंतरिम नियंत्रण लागू रखें।\n• कार्रवाई और समीक्षा का ऑडिट रिकॉर्ड बनाएँ।${mineNote}`
      : `Safety prioritisation:\n• Act on Critical and High risk first.\n• Check open violations, overdue corrective actions, and the latest risk score.\n• Keep interim controls in place until the permanent fix.\n• Preserve an auditable record of the action and review.${mineNote}`;
  }

  if (
    has(
      "compliance",
      "permit",
      "renew",
      "statutory",
      "अनुपालन",
      "परमिट",
      "नवीनीकरण",
    )
  ) {
    return isHindi
      ? "अनुपालन कार्यप्रवाह:\n1. Overdue और इस महीने देय रिकॉर्ड फ़िल्टर करें।\n2. वैधानिक संदर्भ, मालिक और अगली देय तिथि की पुष्टि करें।\n3. प्रमाण अपलोड करें और कमी होने पर सुधारात्मक कार्रवाई बनाएँ।\n4. पूरा होने के बाद ऑडिट ट्रेल अपडेट करें।"
      : "Compliance workflow:\n1. Filter overdue and due-this-month records.\n2. Verify the statutory reference, owner, and next due date.\n3. Upload evidence and create corrective action for any gap.\n4. Update the audit trail after completion.";
  }

  if (has("contractor", "vendor", "ठेकेदार")) {
    return isHindi
      ? "ठेकेदार समीक्षा में अनुबंध स्थिति, खदान असाइनमेंट, compliance score, induction रिकॉर्ड और खुले सुधार देखें। कम स्कोर या समाप्त अनुबंध वाले रिकॉर्ड को पहले एस्केलेट करें।"
      : "For contractor oversight, review contract status, mine assignments, compliance score, induction records, and open corrective actions. Escalate low-score or expired-contract records first.";
  }

  if (
    has(
      "analytics",
      "trend",
      "report",
      "dashboard",
      "विश्लेषण",
      "रिपोर्ट",
      "डैशबोर्ड",
    )
  ) {
    return isHindi
      ? "डैशबोर्ड में पहले risk distribution और high-risk inspections देखें, फिर Alerts और Compliances में कार्रवाई असाइन करें। रुझान समझने के लिए समान अवधि और समान खदानों की तुलना करें।"
      : "Start with risk distribution and high-risk inspections on the dashboard, then assign actions in Alerts and Compliances. Compare the same period and the same mines when checking trends.";
  }

  return isHindi
    ? "मैं इस अनुरोध को बेहतर तरीके से संभालने के लिए थोड़ा संदर्भ चाहता हूँ। क्या आप alerts, inspections, compliance, risk, contractors या dashboard के बारे में पूछ रहे हैं? खदान का नाम, समस्या और deadline भी दें।"
    : "I need a little more context to give a useful answer. Are you asking about alerts, inspections, compliance, risk, contractors, or the dashboard? Include the mine, issue, and deadline when you can.";
};

const prompts = {
  en: [
    "What needs attention today?",
    "How do I create a good inspection?",
    "How should I handle an overdue compliance?",
  ],
  hi: [
    "आज किस बात पर ध्यान देना चाहिए?",
    "मैं अच्छा निरीक्षण कैसे बनाऊँ?",
    "समय-सीमा पार अनुपालन को कैसे संभालूँ?",
  ],
};

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
      text:
        language === "hi"
          ? `नमस्ते${user?.name ? ` ${user.name}` : ""}! मैं निरीक्षण, अनुपालन, खदान सुरक्षा और डैशबोर्ड में आपकी मदद कर सकता हूँ।`
          : `Hello${user?.name ? ` ${user.name}` : ""}! I can help with inspections, compliance, mine safety, and dashboards.`,
    },
  ]);

  const handleSend = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    const reply = getAssistantReply(message, language);
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
          text:
            language === "hi"
              ? "मैं अभी इसे संसाधित नहीं कर सका। कृपया फिर प्रयास करें।"
              : "I could not process that right now. Please try again.",
        },
      ]);
      toast.error("Could not send your message");
    } finally {
      setSending(false);
    }
  };

  const askPrompt = (prompt) => {
    if (sending) return;
    const reply = getAssistantReply(prompt, language);
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
              className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Bot className="mt-1 h-4 w-4 shrink-0 text-[#9b6b16]" />
              )}
              <div
                className={`max-w-[min(80%,38rem)] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-sm bg-[#cfeaf9] text-[#10263d] dark:bg-sky-900/70 dark:text-sky-100" : "rounded-bl-sm bg-white text-[#3d392f] shadow-sm dark:bg-slate-700 dark:text-slate-100"}`}
              >
                {message.text}
              </div>
              {message.sender === "user" && (
                <User className="mt-1 h-4 w-4 shrink-0 text-[#17314a]" />
              )}
            </div>
          ))}
          {sending && (
            <p className="pl-6 text-xs text-[#786f63]">{t.thinking}</p>
          )}
          {messages.length === 1 && (
            <div className="ml-6 flex flex-wrap gap-2 pt-1">
              {prompts[language].map((prompt) => (
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
          autoComplete="off"
          className="border-t border-[#e6dccb] bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 rounded-xl border border-[#cdbd9f] bg-[#fffdf9] px-3 py-2 focus-within:border-[#17314a] focus-within:ring-2 focus-within:ring-[#17314a]/10 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-sky-400">
            <input
              id="chat-message"
              name="message"
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
