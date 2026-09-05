import { useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import { saveChatMessage } from "../services/api";

const getAssistantReply = (message, language = "en") => {
  const lower = message.toLowerCase();
  const isHindi = language === "hi";
  const mentionsMine =
    /(jayant|amlohri|nigahi|kusmunda|gevra|dipka|dudhichua|singrauli|korba)/.test(
      lower,
    );

  if (isHindi) {
    if (
      lower.includes("overdue") ||
      lower.includes("urgent") ||
      lower.includes("alert") ||
      message.includes("समय-सीमा") ||
      message.includes("तत्काल") ||
      message.includes("अलर्ट")
    ) {
      return "प्राथमिकता वाली कार्रवाई योजना:\n1. अलर्ट खोलें और पहले गंभीर, फिर उच्च जोखिम वाले अलर्ट छाँटें।\n2. हर विषय के लिए एक जिम्मेदार व्यक्ति और समय-सीमा तय करें।\n3. बंद करने से पहले निरीक्षण प्रमाण या अनुपालन दस्तावेज़ जोड़ें।\n4. गंभीर सुरक्षा समस्याओं को तुरंत खदान प्रबंधक तक पहुँचाएँ।";
    }
    if (
      lower.includes("inspection") ||
      lower.includes("inspect") ||
      message.includes("निरीक्षण")
    ) {
      return `एक पूर्ण निरीक्षण में यह शामिल होना चाहिए:\n1. खदान चुनें, ताकि पिन सही स्थान पर जाए।\n2. स्पष्ट शीर्षक, अवलोकन, फ़ोटो और वॉइस नोट दर्ज करें।\n3. हर उल्लंघन के साथ गंभीरता, सुधारात्मक कार्रवाई, जिम्मेदार व्यक्ति और लक्ष्य तिथि जोड़ें।\n4. रिपोर्ट भेजने से पहले लाइव प्रीव्यू की समीक्षा करें।${mentionsMine ? "\n\nआपने एक खदान का उल्लेख किया है; रिपोर्ट बनाने से पहले पिन के फ़ील्ड स्थान से मेल खाने की पुष्टि करें।" : ""}`;
    }
    if (
      lower.includes("risk") ||
      lower.includes("safety") ||
      message.includes("जोखिम") ||
      message.includes("सुरक्षा")
    ) {
      return "सुरक्षा प्राथमिकता:\n• पहले गंभीर और उच्च जोखिम वाली खदानों पर कार्रवाई करें।\n• अनसुलझे उल्लंघन, लंबित सुधारात्मक कार्रवाई और नवीनतम जोखिम स्कोर जाँचें।\n• स्थायी सुधार से पहले अंतरिम नियंत्रण लागू करें।\n• कार्रवाई के जिम्मेदार व्यक्ति और समीक्षा तिथि दर्ज करें।";
    }
    if (
      lower.includes("compliance") ||
      lower.includes("permit") ||
      message.includes("अनुपालन") ||
      message.includes("परमिट")
    ) {
      return "अनुपालन प्रक्रिया:\n1. रजिस्टर में समय-सीमा पार और इस महीने देय विषयों को फ़िल्टर करें।\n2. वैधानिक संदर्भ और जिम्मेदार व्यक्ति की पुष्टि करें।\n3. अनुपालन का प्रमाण अपलोड या दर्ज करें।\n4. अगली देय तिथि तय करें और ऑडिट रिकॉर्ड पूरा रखें।";
    }
    if (lower.includes("contractor") || message.includes("ठेकेदार")) {
      return "ठेकेदार निगरानी के लिए अनुबंध स्थिति, खदान असाइनमेंट, अनुपालन स्कोर, इंडक्शन रिकॉर्ड और खुली सुधारात्मक कार्रवाइयाँ जाँचें। अनन्या सिंह और शक्ति इंफ्रा एंड माइनिंग कॉन्ट्रैक्टर्स का डेमो अकाउंट लॉगिन पेज पर उपलब्ध है।";
    }
    if (
      /(hello|hi|hey|नमस्ते|हेलो)/.test(lower) ||
      message.includes("नमस्ते")
    ) {
      return "नमस्ते। मैं निरीक्षण, लंबित अनुपालन, ठेकेदार प्रदर्शन, खदान जोखिम और सुरक्षा संबंधी कार्रवाई में मदद कर सकता हूँ। केंद्रित उत्तर के लिए खदान और समस्या बताइए।";
    }
    if (
      lower.includes("attention") ||
      lower.includes("today") ||
      lower.includes("summary") ||
      message.includes("ध्यान") ||
      message.includes("आज") ||
      message.includes("सारांश")
    ) {
      return "आज की अनुशंसित समीक्षा क्रम:\n1. गंभीर और उच्च-गंभीरता वाले अलर्ट।\n2. समय-सीमा पार अनुपालन दायित्व।\n3. खुले उल्लंघनों वाले निरीक्षण।\n4. कम अनुपालन स्कोर वाले ठेकेदार रिकॉर्ड।\n\nपहले डैशबोर्ड खोलें, फिर कार्रवाई तय करने के लिए अलर्ट और अनुपालन पेज देखें।";
    }
    return "मैं इसे अगले व्यावहारिक कदम में बदल सकता हूँ। खदान, समस्या, उसकी गंभीरता और निरीक्षण या अनुपालन की समय-सीमा बताइए; मैं प्राथमिकता के अनुसार कार्रवाई सुझाऊँगा।";
  }

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
