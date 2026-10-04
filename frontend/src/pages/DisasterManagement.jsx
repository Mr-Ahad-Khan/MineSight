import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertOctagon,
  CheckCircle2,
  ClipboardCheck,
  LifeBuoy,
  PhoneCall,
  Plus,
  Radio,
  ShieldAlert,
  Siren,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createSupportTicket,
  getMines,
  getSupportDirectory,
  getSupportTickets,
} from "../services/api";
import { initialMines } from "../services/offlineStorage";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

const checklistItems = [
  "Account for all workers and confirm attendance",
  "Raise the mine emergency control room alert",
  "Secure the incident zone and stop affected operations",
  "Assign an incident commander and response team",
];

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function DisasterManagement() {
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;
  const translatedChecklistItems = [
    t.accountForWorkers,
    t.raiseControlRoomAlert,
    t.secureIncidentZone,
    t.assignIncidentCommander,
  ];
  const [incidents, setIncidents] = useState([]);
  const [mines, setMines] = useState(initialMines);
  const [directory, setDirectory] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const [form, setForm] = useState({
    subject: "",
    mineId: initialMines[0]?._id || "",
    priority: "critical",
    description: "",
  });

  const loadData = async () => {
    try {
      const [ticketRes, mineRes, directoryRes] = await Promise.all([
        getSupportTickets({ category: "emergency" }).catch(() => ({ data: { data: [] } })),
        getMines().catch(() => ({ data: { data: initialMines } })),
        getSupportDirectory().catch(() => ({ data: { data: [] } })),
      ]);
      setIncidents(ticketRes.data.data || []);
      setMines(mineRes.data.data?.length ? mineRes.data.data : initialMines);
      setDirectory(directoryRes.data.data || []);
    } catch (error) {
      toast.error("Loaded emergency data in offline mode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [formOpen]);

  const activeIncidents = useMemo(
    () => incidents.filter((incident) => !["resolved", "closed"].includes(incident.status)),
    [incidents],
  );

  const updateForm = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  const submitIncident = async (event) => {
    event.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Add an incident title and description");
      return;
    }
    setSubmitting(true);
    try {
      await createSupportTicket({
        ...form,
        category: "emergency",
        subject: `[DISASTER] ${form.subject.trim()}`,
      });
      toast.success("Emergency incident escalated");
      setForm({ subject: "", mineId: "", priority: "critical", description: "" });
      setFormOpen(false);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not escalate incident");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleChecklist = (index) => {
    setCheckedItems((items) =>
      items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
    );
  };

  const emergencyContacts = directory.flatMap((group) => group.contacts || []).slice(0, 3);

  const exportRows = incidents.map((incident) => ({
    incident: incident.subject,
    ticket: incident.ticketNumber,
    mine: incident.mineId?.name || "Not specified",
    priority: incident.priority,
    status: incident.status,
    description: incident.description,
    reportedAt: incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "",
  }));

  const downloadFile = (content, fileName, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportJson = () => {
    downloadFile(
      JSON.stringify({
        exportedAt: new Date().toISOString(),
        responseReadiness: `${Math.round((checkedItems.length / checklistItems.length) * 100)}%`,
        incidents: exportRows,
      }, null, 2),
      "disaster-management-report.json",
      "application/json",
    );
  };

  const exportCsv = () => {
    if (loading) {
      toast.error("Wait for emergency incidents to finish loading before exporting");
      return;
    }
    if (exportRows.length === 0) {
      toast.error("No emergency incidents are available to export. Report an incident first.");
      return;
    }

    const columns = [
      ["Incident", "incident"],
      ["Ticket", "ticket"],
      ["Mine", "mine"],
      ["Priority", "priority"],
      ["Status", "status"],
      ["Description", "description"],
      ["Reported At", "reportedAt"],
    ];
    const rows = exportRows.map((row) => columns.map(([, key]) => escapeCsv(row[key])).join(","));
    const csv = [columns.map(([label]) => escapeCsv(label)).join(","), ...rows].join("\r\n");
    downloadFile(`\uFEFF${csv}`, "disaster-management-report.csv", "text/csv;charset=utf-8");
  };

  const exportPdf = () => {
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const readiness = Math.round((checkedItems.length / checklistItems.length) * 100);
      const columns = ["Incident", "Ticket", "Mine", "Priority", "Status", "Description", "Reported At"];

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("Disaster Management Report", 36, 40);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Generated: ${new Date().toLocaleString()}  |  Response readiness: ${readiness}%  |  Incidents: ${exportRows.length}`, 36, 58);

      autoTable(pdf, {
        head: [columns],
        body: exportRows.map((row) => [
          row.incident,
          row.ticket,
          row.mine,
          row.priority,
          row.status,
          row.description,
          row.reportedAt,
        ]),
        startY: 72,
        margin: { left: 36, right: 36 },
        styles: { font: "helvetica", fontSize: 8, cellPadding: 5, overflow: "linebreak" },
        headStyles: { fillColor: [190, 35, 55] },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 58 },
          2: { cellWidth: 90 },
          3: { cellWidth: 58 },
          4: { cellWidth: 58 },
          5: { cellWidth: 305 },
          6: { cellWidth: 105 },
        },
      });

      let sectionY = pdf.lastAutoTable.finalY + 24;
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (sectionY > pageHeight - 60) {
        pdf.addPage();
        sectionY = 40;
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Response checklist", 36, sectionY);
      autoTable(pdf, {
        body: checklistItems.map((item, index) => [
          `${checkedItems.includes(index) ? "[x]" : "[ ]"} ${item}`,
        ]),
        startY: sectionY + 8,
        margin: { left: 36, right: 36 },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 380 } },
      });

      sectionY = pdf.lastAutoTable.finalY + 22;
      if (sectionY > pageHeight - 60) {
        pdf.addPage();
        sectionY = 40;
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Emergency contacts", 36, sectionY);
      autoTable(pdf, {
        head: [["Contact", "Phone", "Timing"]],
        body: emergencyContacts.map((contact) => [contact.title, contact.number, contact.timing]),
        startY: sectionY + 8,
        margin: { left: 36, right: 36 },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [14, 116, 144] },
        columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 120 }, 2: { cellWidth: 220 } },
      });

      pdf.save("disaster-management-report.pdf");
      toast.success("PDF report downloaded");
    } catch {
      toast.error("Unable to generate the PDF report");
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-rose-600">
            <Siren className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">{t.emergencyOperations}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t.disasterManagement}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.disasterSubtitle}</p>
        </div>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full sm:w-auto">
          <button type="button" onClick={exportCsv} className="btn-secondary flex-1 sm:flex-none min-h-[44px]">{t.exportCsv}</button>
          <button type="button" onClick={exportJson} className="btn-secondary flex-1 sm:flex-none min-h-[44px]">{t.exportJson}</button>
          <button type="button" onClick={exportPdf} className="btn-secondary flex-1 sm:flex-none min-h-[44px]">{t.exportPdf}</button>
          <button 
            type="button" 
            onClick={() => setFormOpen((open) => !open)} 
            className="btn-primary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium shadow-md shadow-red-500/20 active:scale-95 transition"
          >
            {formOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {formOpen ? (language === 'hi' ? "फॉर्म बंद करें" : "Close Form") : t.reportIncident}
          </button>
        </div>
      </div>

      {formOpen && (
        <form ref={formRef} onSubmit={submitIncident} className="card space-y-4 border-2 border-rose-400 bg-rose-50/40 p-5 dark:border-rose-800 dark:bg-rose-950/20 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">{t.escalateEmergencyIncident}</h2>
            </div>
            <button 
              type="button" 
              onClick={() => setFormOpen(false)}
              className="p-1 rounded-lg hover:bg-rose-200 dark:hover:bg-rose-900 text-slate-600 dark:text-slate-300 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.incidentTitle} *</label>
              <input 
                className="input min-h-[44px] text-base sm:text-sm w-full" 
                placeholder={t.incidentTitle} 
                value={form.subject} 
                onChange={(event) => updateForm("subject", event.target.value)} 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.selectAffectedMine} *</label>
              <select 
                className="input min-h-[44px] text-base sm:text-sm w-full" 
                value={form.mineId} 
                onChange={(event) => updateForm("mineId", event.target.value)}
              >
                <option value="">{t.selectAffectedMine}</option>
                {mines.map((mine) => <option key={mine._id} value={mine._id}>{mine.name} {mine.code ? `(${mine.code})` : ""}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Severity / Priority</label>
            <select className="input min-h-[44px] text-base sm:text-sm w-full md:w-1/2" value={form.priority} onChange={(event) => updateForm("priority", event.target.value)}>
              <option value="critical">{t.criticalImmediateResponse}</option>
              <option value="high">{t.highUrgentResponse}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t.incidentDescriptionPlaceholder} *</label>
            <textarea 
              className="input min-h-28 text-base sm:text-sm w-full" 
              placeholder={t.incidentDescriptionPlaceholder} 
              value={form.description} 
              onChange={(event) => updateForm("description", event.target.value)} 
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button disabled={submitting} className="btn-primary w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700" type="submit">
              <Radio className="h-4 w-4" /> {submitting ? t.escalating : t.escalateIncident}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} className="btn-secondary w-full sm:w-auto min-h-[44px]">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-md mx-auto sm:max-w-none w-full">
        <div className="card border-t-4 border-t-rose-500 p-5 flex flex-col items-center text-center sm:items-stretch sm:text-left">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.activeIncidents}</p>
            <AlertOctagon className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-rose-600">{activeIncidents.length}</p>
        </div>
        <div className="card border-t-4 border-t-amber-500 p-5 flex flex-col items-center text-center sm:items-stretch sm:text-left">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.responseReadiness}</p>
            <CheckCircle2 className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-amber-600">{Math.round((checkedItems.length / checklistItems.length) * 100)}%</p>
        </div>
        <div className="card border-t-4 border-t-emerald-500 p-5 flex flex-col items-center text-center sm:items-stretch sm:text-left">
          <div className="flex w-full items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.emergencyChannels}</p>
            <PhoneCall className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-emerald-600">{emergencyContacts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 max-w-md mx-auto sm:max-w-none w-full">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-600" /><h2 className="font-semibold text-slate-900 dark:text-white">{t.activeIncidentRegister}</h2></div>
          {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">{t.loadingIncidents}</p> : activeIncidents.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-400">{t.noActiveIncidents}</p> : <div className="space-y-3">{activeIncidents.map((incident) => <article key={incident._id} className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-slate-900 dark:text-white">{incident.subject}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{incident.mineId?.name || t.mineNotSpecified}</p></div><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase text-rose-700">{incident.status}</span></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{incident.description}</p></article>)}</div>}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-slate-900 dark:text-white">{t.responseChecklist}</h2></div>
          <div className="space-y-3">{translatedChecklistItems.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={checkedItems.includes(index)} onChange={() => toggleChecklist(index)} className="mt-0.5 h-4 w-4 accent-amber-600" /><span className={checkedItems.includes(index) ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}>{item}</span></label>)}</div>
        </section>
      </div>

      <section className="card p-5 max-w-md mx-auto sm:max-w-none w-full"><div className="mb-4 flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-sky-600" /><h2 className="font-semibold text-slate-900 dark:text-white">{t.emergencyContacts}</h2></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3">{emergencyContacts.map((contact) => <a key={contact.title} href={`tel:${contact.number}`} className="rounded-lg border border-slate-200 p-4 transition hover:border-sky-400 dark:border-slate-700"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-900 dark:text-white">{contact.title}</p><PhoneCall className="h-4 w-4 shrink-0 text-sky-600" /></div><p className="mt-2 font-mono text-sm text-sky-700 dark:text-sky-300">{contact.number}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{contact.timing}</p></a>)}</div></section>
    </div>
  );
}
