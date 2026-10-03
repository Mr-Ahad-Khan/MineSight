import { useEffect, useRef, useState } from "react";
import { Bot, Mic, MicOff, PhoneCall, Send, ShieldCheck, Sparkles, User, Volume2, VolumeX } from "lucide-react";
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

  if (
    has(
      "customer care",
      "customer support",
      "support number",
      "contact support",
      "helpline",
      "hotline",
      "कस्टमर केयर",
      "ग्राहक सेवा",
      "हेल्पलाइन",
      "संपर्क नंबर",
    )
  ) {
    return isHindi
      ? "MineSight तकनीकी ग्राहक सहायता: +91 800-419-7890 (24/7) या support@minesight.cil.gov.in। ऐप में ग्राहक सहायता कार्यालय का भौतिक पता उपलब्ध नहीं है।\n\nआपातकालीन बचाव सेवा: Central Coalfields Rescue Station, धनबाद / सिंगरौली — 0326-2202356 (धनबाद) या 07805-266120 (सिंगरौली), 24/7।\n\nराष्ट्रीय खान आपातकालीन नियंत्रण कक्ष: 1800-345-3467।"
      : "MineSight technical customer care: +91 800-419-7890 (24/7) or support@minesight.cil.gov.in. The app does not list a physical customer-care office address.\n\nEmergency rescue service locations: Central Coalfields Rescue Station serves Dhanbad (0326-2202356) and Singrauli (07805-266120), 24/7.\n\nDGMS National Mine Emergency Control Room: 1800-345-3467.";
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
    "Customer care number and location",
  ],
  hi: [
    "आज किस बात पर ध्यान देना चाहिए?",
    "मैं अच्छा निरीक्षण कैसे बनाऊँ?",
    "समय-सीमा पार अनुपालन को कैसे संभालूँ?",
    "ग्राहक सेवा नंबर और स्थान",
  ],
};

export default function Chat() {
  const { user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language];
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(
    () => localStorage.getItem("speakChatReplies") === "true",
  );
  const recognitionRef = useRef(null);
  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
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

  useEffect(
    () => () => recognitionRef.current?.stop(),
    [],
  );

  const speakReply = (text) => {
    if (!speechEnabled || !speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      if (transcript) {
        setInput(transcript);
        void sendMessage(transcript);
      }
    };
    recognition.onerror = () => {
      toast.error(
        language === "hi"
          ? "वॉइस इनपुट उपलब्ध नहीं हो सका। माइक्रोफ़ोन अनुमति जाँचें।"
          : "Voice input failed. Check microphone permission and try again.",
      );
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      toast.error(
        language === "hi"
          ? "वॉइस इनपुट शुरू नहीं हो सका। फिर प्रयास करें।"
          : "Could not start voice input. Please try again.",
      );
    }
  };

  const toggleVoiceConversation = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    if (speechSupported) {
      window.speechSynthesis.cancel();
      setSpeechEnabled(true);
      localStorage.setItem("speakChatReplies", "true");
    }
    toggleVoiceInput();
  };

  const sendMessage = async (message) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage || sending) return;

    const reply = getAssistantReply(normalizedMessage, language);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: normalizedMessage },
      { id: Date.now() + 1, sender: "bot", text: reply },
    ]);
    speakReply(reply);
    setSending(true);

    try {
      await saveChatMessage({ email: user?.email, message: normalizedMessage, reply });
    } catch (error) {
      toast.error(
        language === "hi"
          ? "जवाब मिल गया, लेकिन चैट इतिहास सहेजा नहीं जा सका।"
          : "Reply received, but chat history could not be saved.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSend = (event) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const askPrompt = (prompt) => {
    if (sending) return;
    const reply = getAssistantReply(prompt, language);
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", text: prompt },
      { id: Date.now() + 1, sender: "bot", text: reply },
    ]);
    speakReply(reply);
  };

  return (
    <section className="mx-auto flex h-[calc(100dvh-2rem)] min-h-[680px] max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8 dark:text-slate-100">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
        <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:items-end">
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {language === "hi" ? "ग्राहक सहायता · 24/7" : "Customer care · 24/7"}
            </p>
            <a
              href="tel:+918004197890"
              className="mt-0.5 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-bold text-[#17314a] transition-colors hover:text-[#d45b00] dark:text-white dark:hover:text-orange-300"
            >
              <PhoneCall className="h-4 w-4 text-[#d45b00]" /> +91 800-419-7890
            </a>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#bfd9c8] bg-[#edf8f0] px-3 py-1.5 text-xs font-semibold text-[#267044]">
            <ShieldCheck className="h-4 w-4" /> {t.secureSession}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-950 bg-[#1e3a8a] px-5 py-4 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{t.coalAiAssistant}</p>
            <p className="text-xs text-[#c9d8e2]">{t.readyToHelp}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label={language === "hi" ? "जवाब की भाषा चुनें" : "Choose reply language"}
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 p-0.5"
            >
              <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${language === "en" ? "bg-white text-[#1e3a8a]" : "text-white/80 hover:bg-white/10"}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                aria-pressed={language === "hi"}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${language === "hi" ? "bg-white text-[#1e3a8a]" : "text-white/80 hover:bg-white/10"}`}
              >
                हिंदी
              </button>
            </div>
            <button
              type="button"
              onClick={toggleVoiceConversation}
              disabled={!speechSupported || !recognitionSupported || sending}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${listening ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
              aria-label={
                listening
                  ? language === "hi"
                    ? "वॉइस बातचीत रोकें"
                    : "Stop voice chat"
                  : language === "hi"
                    ? "वॉइस बातचीत शुरू करें"
                    : "Start voice chat"
              }
              aria-pressed={listening}
              title={
                !speechSupported || !recognitionSupported
                  ? language === "hi"
                    ? "इस ब्राउज़र में वॉइस चैट समर्थित नहीं है"
                    : "Voice chat is not supported in this browser"
                  : listening
                    ? language === "hi"
                      ? "सुनना रोकें"
                      : "Stop listening"
                    : language === "hi"
                      ? "बोलने के लिए क्लिक करें"
                      : "Click to speak"
              }
            >
              {listening ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
              <span>
                {listening
                  ? language === "hi"
                    ? "सुन रहा है..."
                    : "Listening..."
                  : language === "hi"
                    ? "वॉइस चैट"
                    : "Voice chat"}
              </span>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f5f7fa] p-4 sm:p-6 dark:bg-slate-800">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "bot" && (
                <Bot className="mt-1 h-4 w-4 shrink-0 text-[#9b6b16]" />
              )}
              <div
                className={`max-w-[min(80%,38rem)] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.sender === "user" ? "rounded-br-sm bg-blue-100 text-gray-800 dark:bg-sky-900/70 dark:text-sky-100" : "rounded-bl-sm bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-100"}`}
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
        </div>

        <div className="flex flex-wrap gap-2 border-t border-gray-200 bg-[#f5f7fa] px-4 py-3 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
          {prompts[language].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => askPrompt(prompt)}
              disabled={sending}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:border-[#ff6f00] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <Sparkles className="h-3 w-3 text-[#ff6f00]" /> {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          autoComplete="off"
          className="border-t border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 focus-within:border-[#ff6f00] focus-within:ring-2 focus-within:ring-[#ff6f00]/15 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-sky-400">
            <input
              id="chat-message"
              name="message"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.askCoalAi}
              className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-slate-500"
              disabled={sending}
              aria-label={t.messageCoalAi}
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={!recognitionSupported || sending}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6f00] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${listening ? "border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" : "border-slate-300 bg-slate-100 text-slate-700 hover:border-[#ff6f00] hover:bg-orange-50 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"}`}
              aria-label={
                listening
                  ? language === "hi"
                    ? "वॉइस इनपुट रोकें"
                    : "Stop voice input"
                  : language === "hi"
                    ? "वॉइस इनपुट शुरू करें"
                    : "Start voice input"
              }
              aria-pressed={listening}
              title={
                listening
                  ? language === "hi"
                    ? "वॉइस इनपुट रोकें"
                    : "Stop voice input"
                  : language === "hi"
                    ? "वॉइस इनपुट शुरू करें"
                    : "Start voice input"
              }
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ff6f00] text-white transition hover:bg-[#e65100] disabled:cursor-not-allowed disabled:opacity-50"
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
