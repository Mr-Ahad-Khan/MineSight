import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createSupportTicket,
  getMines,
  getSupportDirectory,
  getSupportTickets,
} from "../services/api";

const checklistItems = [
  "Account for all workers and confirm attendance",
  "Raise the mine emergency control room alert",
  "Secure the incident zone and stop affected operations",
  "Assign an incident commander and response team",
];

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function DisasterManagement() {
  const [incidents, setIncidents] = useState([]);
  const [mines, setMines] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    mineId: "",
    priority: "critical",
    description: "",
  });

  const loadData = async () => {
    try {
      const [ticketRes, mineRes, directoryRes] = await Promise.all([
        getSupportTickets({ category: "emergency" }),
        getMines(),
        getSupportDirectory(),
      ]);
      setIncidents(ticketRes.data.data || []);
      setMines(mineRes.data.data || []);
      setDirectory(directoryRes.data.data || []);
    } catch (error) {
      toast.error("Unable to load disaster management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const exportRows = activeIncidents.map((incident) => ({
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
    link.click();
    URL.revokeObjectURL(url);
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
    const headers = ["Incident", "Ticket", "Mine", "Priority", "Status", "Description", "Reported At"];
    const rows = exportRows.map((row) => Object.values(row).map(escapeCsv).join(","));
    downloadFile([headers.map(escapeCsv).join(","), ...rows].join("\n"), "disaster-management-report.csv", "text/csv;charset=utf-8");
  };

  const printReport = () => window.print();

  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-rose-600">
            <Siren className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Emergency operations</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold">Disaster Management</h1>
          <p className="mt-1 text-sm text-slate-500">Coordinate mine incidents, evacuation readiness, and emergency response.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} className="btn-secondary">Export CSV</button>
          <button type="button" onClick={exportJson} className="btn-secondary">Export JSON</button>
          <button type="button" onClick={printReport} className="btn-secondary">Print / PDF</button>
          <button type="button" onClick={() => setFormOpen((open) => !open)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Report incident
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card border-t-4 border-t-rose-500 p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-600">Active incidents</p><AlertOctagon className="h-5 w-5 text-rose-600" /></div><p className="mt-3 text-3xl font-bold text-rose-600">{activeIncidents.length}</p></div>
        <div className="card border-t-4 border-t-amber-500 p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-600">Response readiness</p><CheckCircle2 className="h-5 w-5 text-amber-600" /></div><p className="mt-3 text-3xl font-bold text-amber-600">{Math.round((checkedItems.length / checklistItems.length) * 100)}%</p></div>
        <div className="card border-t-4 border-t-emerald-500 p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium text-gray-600">Emergency channels</p><PhoneCall className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-3xl font-bold text-emerald-600">{emergencyContacts.length}</p></div>
      </div>

      {formOpen && (
        <form onSubmit={submitIncident} className="card space-y-4 border border-rose-200 p-5 dark:border-rose-900">
          <div className="flex items-center gap-2"><AlertOctagon className="h-5 w-5 text-rose-600" /><h2 className="font-semibold">Escalate an emergency incident</h2></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className="input" placeholder="Incident title" value={form.subject} onChange={(event) => updateForm("subject", event.target.value)} />
            <select className="input" value={form.mineId} onChange={(event) => updateForm("mineId", event.target.value)}>
              <option value="">Select affected mine</option>
              {mines.map((mine) => <option key={mine._id} value={mine._id}>{mine.name} {mine.code ? `(${mine.code})` : ""}</option>)}
            </select>
          </div>
          <select className="input md:w-1/2" value={form.priority} onChange={(event) => updateForm("priority", event.target.value)}>
            <option value="critical">Critical - immediate response</option><option value="high">High - urgent response</option>
          </select>
          <textarea className="input min-h-28" placeholder="Describe location, people at risk, and immediate actions taken" value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
          <button disabled={submitting} className="btn-primary inline-flex items-center gap-2" type="submit"><Radio className="h-4 w-4" /> {submitting ? "Escalating..." : "Escalate incident"}</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-rose-600" /><h2 className="font-semibold">Active incident register</h2></div>
          {loading ? <p className="text-sm text-slate-500">Loading incidents...</p> : activeIncidents.length === 0 ? <p className="text-sm text-slate-500">No active emergency incidents.</p> : <div className="space-y-3">{activeIncidents.map((incident) => <article key={incident._id} className="rounded-lg border border-rose-100 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{incident.subject}</h3><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{incident.mineId?.name || "Mine not specified"}</p></div><span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold uppercase text-rose-700">{incident.status}</span></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{incident.description}</p></article>)}</div>}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-amber-600" /><h2 className="font-semibold">Response checklist</h2></div>
          <div className="space-y-3">{checklistItems.map((item, index) => <label key={item} className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" checked={checkedItems.includes(index)} onChange={() => toggleChecklist(index)} className="mt-0.5 h-4 w-4 accent-amber-600" /><span className={checkedItems.includes(index) ? "text-slate-400 line-through" : ""}>{item}</span></label>)}</div>
        </section>
      </div>

      <section className="card p-5"><div className="mb-4 flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-sky-600" /><h2 className="font-semibold">Emergency contacts</h2></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3">{emergencyContacts.map((contact) => <a key={contact.title} href={`tel:${contact.number}`} className="rounded-lg border border-slate-200 p-4 transition hover:border-sky-400 dark:border-slate-700"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{contact.title}</p><PhoneCall className="h-4 w-4 shrink-0 text-sky-600" /></div><p className="mt-2 font-mono text-sm text-sky-700 dark:text-sky-300">{contact.number}</p><p className="mt-1 text-xs text-slate-500">{contact.timing}</p></a>)}</div></section>
    </div>
  );
}
