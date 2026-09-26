import { useState, useEffect } from "react";
import {
  LifeBuoy,
  PhoneCall,
  AlertOctagon,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Server,
  Activity,
  FileQuestion,
  ExternalLink,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getSupportDirectory,
  getSupportTickets,
  createSupportTicket,
  replySupportTicket,
  getMines,
} from "../services/api";
import { useLanguageStore } from "../store/themeStore";
import { format } from "date-fns";

export default function Support() {
  const { language } = useLanguageStore();

  const [directory, setDirectory] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New Ticket Form State
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    mineId: "",
    description: "",
  });

  const loadSupportData = async () => {
    try {
      const [dirRes, tickRes, mineRes] = await Promise.all([
        getSupportDirectory(),
        getSupportTickets(),
        getMines(),
      ]);
      setDirectory(dirRes.data.data || []);
      setTickets(tickRes.data.data || []);
      const mineList = mineRes.data.data || [];
      setMines(mineList);
      if (mineList.length > 0 && !ticketForm.mineId) {
        setTicketForm((prev) => ({ ...prev, mineId: mineList[0]._id }));
      }
    } catch (err) {
      console.error("Support data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupportData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      return toast.error("Please fill in subject and description");
    }

    setSubmitting(true);
    try {
      const res = await createSupportTicket(ticketForm);
      toast.success(
        res.data.message || "Support ticket created successfully!"
      );
      setTicketForm({
        subject: "",
        category: "general",
        priority: "medium",
        mineId: mines[0]?._id || "",
        description: "",
      });
      setFormOpen(false);
      loadSupportData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    try {
      const res = await replySupportTicket(selectedTicket._id, {
        message: replyText,
      });
      setSelectedTicket(res.data.data);
      setReplyText("");
      toast.success("Response posted");
      loadSupportData();
    } catch (err) {
      toast.error("Failed to post reply");
    } finally {
      setSendingReply(false);
    }
  };

  const FAQS = [
    {
      q: "How does real-time attendance telemetry track miners underground?",
      a: "MineSight integrates with pit-head RFID and biometric check-in gates. When a miner clocks in, their location is automatically assigned to their working pit face. The system tracks active personnel underground for DGMS safety protocols and emergency evacuations.",
    },
    {
      q: "What should I do during an underground gas or roof emergency?",
      a: "Immediately activate the SOS Hotline button at the top of this Support Panel to dispatch Central Coalfields Rescue Station. All miners in the affected sector will be flagged on the Real-Time Attendance screen.",
    },
    {
      q: "How are inspection descriptions and risk scores calculated?",
      a: "Inspection reports combine environmental observations, statutory safety violations, and geo-coordinates. The risk score (0-100) is calculated dynamically based on violation severity.",
    },
    {
      q: "Can I use MineSight offline when disconnected inside deep pits?",
      a: "Yes. MineSight supports offline cached inspections. When connectivity is restored at the pit-head surface wifi or 4G station, inspections sync automatically to the DGMS portal.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f3eadb] px-4 pb-12 pt-4 sm:px-6 lg:px-8 dark:bg-[#0b1218]">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Support Panel Header */}
        <div className="flex flex-col gap-4 border-b border-[#cbb79d] pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3f6d] to-[#1a62a3] text-white shadow-md">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl dark:text-white">
                {language === "hi" ? "खदान सहायता और सहायता केंद्र" : "Mine Operations Support Panel"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#5d5345] dark:text-slate-400">
              {language === "hi"
                ? "24/7 आपातकालीन खान नियंत्रण कक्ष, तकनीकी सहायता और डीजीएमएस विनियामक सहायता।"
                : "24/7 National Mine Emergency Control Room, DGMS helpdesk, and technical incident reporting."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3f6d] to-[#175d9e] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0d3f6d]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Raise Support Ticket</span>
            </button>
          </div>
        </div>

        {/* Emergency SOS & Hotlines Banner */}
        <div className="rounded-2xl border-2 border-red-500/40 bg-gradient-to-br from-red-500/10 via-[#fdf3f2] to-amber-500/10 p-5 shadow-sm dark:border-red-500/30 dark:from-red-950/30 dark:via-slate-900 dark:to-amber-950/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-red-950 dark:text-red-300">
                    EMERGENCY MINE DISPATCH & RESCUE HOTLINES
                  </h2>
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                    24/7 Active
                  </span>
                </div>
                <p className="mt-1 text-xs text-red-900/80 dark:text-red-300/80">
                  For immediate roof falls, toxic gas inundations (CH4/CO), or worker entombment, dial national rescue stations immediately.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="tel:18003453467"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-red-600/25 transition hover:bg-red-700 active:scale-95"
              >
                <PhoneCall className="h-4 w-4" />
                <span>DGMS SOS: 1800-345-3467</span>
              </a>
              <a
                href="tel:03262202356"
                className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white/90 px-3.5 py-2.5 text-xs font-bold text-red-900 shadow-sm transition hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:text-red-300"
              >
                <span>Rescue Dhanbad: 0326-2202356</span>
              </a>
            </div>
          </div>
        </div>

        {/* Operational Grid: System Health + Helpdesk Directory */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Column 1: System Telemetry Status & Helplines */}
          <div className="space-y-6">
            {/* System Status Card */}
            <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-[#ebdcc7] pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#0d3f6d] dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    System Telemetry Status
                  </h3>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Normal
                </span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#f0e5d4] dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">
                    Real-Time Biometric Gateway
                  </span>
                  <span className="font-semibold text-emerald-600">Operational</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#f0e5d4] dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">
                    DGMS Statutory Sync Server
                  </span>
                  <span className="font-semibold text-emerald-600">Connected</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#f0e5d4] dark:border-slate-800/60">
                  <span className="text-slate-600 dark:text-slate-400">
                    IoT Telemetry Ingestion
                  </span>
                  <span className="font-semibold text-emerald-600">99.98% SLA</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">
                    Field Media & Voice Storage
                  </span>
                  <span className="font-semibold text-emerald-600">Synced</span>
                </div>
              </div>
            </div>

            {/* Support Directory */}
            <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                Technical & Statutory Contacts
              </h3>
              <div className="space-y-3">
                {directory.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {sec.category}
                    </p>
                    {sec.contacts.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-xl border border-[#ebdcc7] bg-white p-3 dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                            {c.title}
                          </h4>
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            {c.badge}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-mono font-medium">{c.number}</span>
                          <span className="text-[10px] text-slate-400">{c.timing}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Support Tickets & Knowledge Base */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tickets Tracker */}
            <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-[#ebdcc7] pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#0d3f6d] dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Logged Support Tickets ({tickets.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="text-xs font-bold text-[#0d3f6d] hover:underline dark:text-sky-400"
                >
                  + New Incident / Query
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {tickets.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    No active support tickets logged. Click "Raise Support Ticket" to report an issue.
                  </p>
                ) : (
                  tickets.map((t) => {
                    const isSelected = selectedTicket?._id === t._id;
                    const isResolved = t.status === "resolved";

                    return (
                      <div
                        key={t._id}
                        className={`rounded-xl border transition p-4 ${
                          isSelected
                            ? "border-[#0d3f6d] bg-[#f4ebdc] dark:border-sky-500 dark:bg-slate-800"
                            : "border-[#ebdcc7] bg-white hover:bg-[#faf4ea] dark:border-slate-800 dark:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            onClick={() =>
                              setSelectedTicket(isSelected ? null : t)
                            }
                            className="cursor-pointer flex-1"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary-700 dark:text-sky-400">
                                {t.ticketNumber}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                  t.priority === "critical"
                                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                                    : t.priority === "high"
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                                      : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                                }`}
                              >
                                {t.priority}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold capitalize ${
                                  isResolved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>

                            <h4 className="mt-1 font-bold text-sm text-slate-900 dark:text-white">
                              {t.subject}
                            </h4>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                              {t.description}
                            </p>

                            <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                              <span>
                                Logged by: <strong>{t.userName || "Official"}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                {format(new Date(t.createdAt), "dd MMM yyyy, hh:mm a")}
                              </span>
                              <span>•</span>
                              <span>{t.responses?.length || 0} messages</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTicket(isSelected ? null : t)
                            }
                            className="p-1 text-slate-400 hover:text-black dark:hover:text-white"
                          >
                            {isSelected ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {/* Expanded Conversation Thread */}
                        {isSelected && (
                          <div className="mt-4 border-t border-[#e5d6bf] pt-4 dark:border-slate-700">
                            <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                              Conversation History
                            </h5>
                            <div className="max-h-60 space-y-2.5 overflow-y-auto pr-1">
                              {t.responses?.map((r, rIdx) => (
                                <div
                                  key={rIdx}
                                  className={`rounded-xl p-3 text-xs ${
                                    r.senderRole === "system"
                                      ? "bg-slate-100 dark:bg-slate-900/60"
                                      : r.senderRole === "admin"
                                        ? "bg-primary-50 dark:bg-primary-950/30 border border-primary-200"
                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                                    <span>{r.sender}</span>
                                    <span className="text-[10px] font-normal text-slate-400">
                                      {format(new Date(r.createdAt), "hh:mm a")}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-slate-700 dark:text-slate-300">
                                    {r.message}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Reply Input Form */}
                            <form
                              onSubmit={handleSendReply}
                              className="mt-3 flex gap-2"
                            >
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type response or status update..."
                                className="flex-1 rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                              />
                              <button
                                type="submit"
                                disabled={sendingReply || !replyText.trim()}
                                className="inline-flex items-center gap-1 rounded-xl bg-[#0d3f6d] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#155a9b] disabled:opacity-50"
                              >
                                <Send className="h-3 w-3" />
                                <span>{sendingReply ? "Sending..." : "Reply"}</span>
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Knowledge Base & FAQs */}
            <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-[#ebdcc7] pb-3 dark:border-slate-800">
                <FileQuestion className="h-4 w-4 text-[#0d3f6d] dark:text-sky-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mining Knowledge & Regulatory FAQs
                </h3>
              </div>

              <div className="mt-3 space-y-2">
                {FAQS.map((faq, idx) => {
                  const isOpen = faqOpenIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#ebdcc7] bg-white p-3 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                        className="flex w-full items-center justify-between text-left text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 pt-2 dark:border-slate-700">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Creation Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#cbb79d] bg-[#fbf7f0] p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Submit Support Ticket or Incident
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Notify safety directors, IoT technicians, or portal administrators.
            </p>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, subject: e.target.value })
                  }
                  placeholder="e.g. Methane sensor reading spike at Pit-2"
                  className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="safety_alert">Mine Safety Incident</option>
                    <option value="emergency">Emergency / SOS</option>
                    <option value="hardware_iot">IoT / Sensor Telemetry</option>
                    <option value="portal_bug">Portal / Form Defect</option>
                    <option value="compliance_query">Compliance & Filing</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Priority
                  </label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, priority: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="low">Low (General inquiry)</option>
                    <option value="medium">Medium (Routine defect)</option>
                    <option value="high">High (Field blocker)</option>
                    <option value="critical">Critical (Immediate danger)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Associated Coal Mine
                </label>
                <select
                  value={ticketForm.mineId}
                  onChange={(e) =>
                    setTicketForm({ ...ticketForm, mineId: e.target.value })
                  }
                  className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {mines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketForm.description}
                  onChange={(e) =>
                    setTicketForm({
                      ...ticketForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detail the exact incident, location coordinates, symptoms, or requested assistance..."
                  className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e1d3bc] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-[#cbb79d] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0d3f6d] px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#155a9b]"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
