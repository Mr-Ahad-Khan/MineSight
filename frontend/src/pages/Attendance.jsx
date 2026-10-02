import { useState, useEffect, useRef } from "react";
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Thermometer,
  HardHat,
  Filter,
  X,
  PhoneCall,
  Activity,
  Layers,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  getAttendance,
  getRealtimeAttendance,
  markCheckIn,
  markCheckOut,
  updateAttendanceLiveStatus,
  getMines,
} from "../services/api";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

export default function Attendance() {
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;

  const [realtime, setRealtime] = useState(null);
  const [records, setRecords] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMine, setSelectedMine] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedLiveStatus, setSelectedLiveStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("inside"); // 'inside' | 'all'
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    workerName: "",
    workerId: "",
    mineId: "",
    role: "Miner",
    shift: "Shift A (Morning)",
    zone: "Pit-1 Underground Face",
    safetyGearVerified: true,
    bodyTemp: "36.6",
    emergencyContact: "",
    notes: "",
  });

  const pollIntervalRef = useRef(null);

  const fetchRealtime = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = {};
      if (selectedMine) params.mineId = selectedMine;

      const [rtRes, listRes] = await Promise.all([
        getRealtimeAttendance(params),
        getAttendance({
          ...params,
          shift: selectedShift || undefined,
          liveStatus:
            selectedLiveStatus !== "all" ? selectedLiveStatus : undefined,
          search: search || undefined,
        }),
      ]);

      setRealtime(rtRes.data.data);
      setRecords(listRes.data.data || []);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    getMines()
      .then((res) => {
        const mineList = res.data.data || [];
        setMines(mineList);
        if (mineList.length > 0 && !form.mineId) {
          setForm((prev) => ({ ...prev, mineId: mineList[0]._id }));
        }
      })
      .catch(console.error);

    fetchRealtime();

    // Auto-poll real-time telemetry every 7 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchRealtime(false);
    }, 7000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [selectedMine, selectedShift, selectedLiveStatus, search]);

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!form.workerName || !form.workerId || !form.mineId) {
      return toast.error("Please fill in worker name, ID, and mine");
    }

    setSubmitting(true);
    try {
      const res = await markCheckIn(form);
      toast.success(res.data.message || "Worker clocked in successfully!");
      setModalOpen(false);
      setForm({
        workerName: "",
        workerId: `CW-${Math.floor(1000 + Math.random() * 9000)}`,
        mineId: mines[0]?._id || "",
        role: "Miner",
        shift: "Shift A (Morning)",
        zone: "Pit-1 Underground Face",
        safetyGearVerified: true,
        bodyTemp: "36.6",
        emergencyContact: "",
        notes: "",
      });
      fetchRealtime(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark check-in");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id, name) => {
    try {
      await markCheckOut(id);
      toast.success(`${name} checked out safely from mine`);
      fetchRealtime(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Check out failed");
    }
  };

  const handleToggleZone = async (id, currentStatus) => {
    const nextStatus =
      currentStatus === "inside_mine" ? "surface_area" : "inside_mine";
    try {
      await updateAttendanceLiveStatus(id, { liveStatus: nextStatus });
      toast.success(
        nextStatus === "inside_mine"
          ? "Worker entered underground seam"
          : "Worker moved to surface facility"
      );
      fetchRealtime(true);
    } catch (err) {
      toast.error("Failed to update location");
    }
  };

  const filteredRecords = records.filter((r) => {
    if (activeTab === "inside") {
      return r.liveStatus === "inside_mine";
    }
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f3eadb] px-4 pb-12 pt-4 sm:px-6 lg:px-8 dark:bg-[#0b1218]">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 border-b border-[#cbb79d] pb-5 md:flex-row md:items-center md:justify-between dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl dark:text-white">
                {t.attendanceTitle}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                LIVE TELEMETRY
              </span>
            </div>
            <p className="mt-1 text-sm text-[#5d5345] dark:text-slate-400">
              {t.attendanceSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchRealtime(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-[#bfa78a] bg-[#fbf7f0] px-4 py-2.5 text-sm font-semibold text-[#2c2c2c] shadow-sm transition hover:bg-[#eae0d0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Refresh real-time attendance"
            >
              <RefreshCw
                className={`h-4 w-4 text-[#0d3f6d] dark:text-sky-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span>{refreshing ? "Refreshing..." : "Live Sync"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({
                  ...prev,
                  workerId: `CW-${Math.floor(1000 + Math.random() * 9000)}`,
                }));
                setModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3f6d] to-[#175d9e] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0d3f6d]/20 transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>
                {language === "hi" ? "उपस्थिति दर्ज करें" : "Mark Clock-In"}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {/* Card 1: Inside Mine */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-[#ebf7f0] p-4 shadow-sm dark:border-emerald-500/20 dark:from-emerald-950/20 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                {t.insideMine}
              </span>
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-900 dark:text-emerald-300">
                {realtime?.insideMineCount ?? 0}
              </span>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {t.miners}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-emerald-700/80 dark:text-emerald-400/80">
              {t.activeUnderground}
            </p>
          </div>

          {/* Card 2: Total Present Today */}
          <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-[#695d4d] dark:text-slate-400">
                {t.presentToday}
              </span>
              <UserCheck className="h-4 w-4 text-[#0d3f6d] dark:text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1b1b1b] dark:text-white">
                {realtime?.presentTodayCount ?? 0}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {t.checkedIn}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#716554] dark:text-slate-400">
              {t.acrossShifts}
            </p>
          </div>

          {/* Card 3: Late Arrivals */}
          <div className="rounded-2xl border border-amber-300/60 bg-[#fffdf5] p-4 shadow-sm dark:border-amber-500/20 dark:bg-slate-900">
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.lateEntries}
              </span>
              <Clock className="h-4 w-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-900 dark:text-amber-300">
                {realtime?.lateTodayCount ?? 0}
              </span>
              <span className="text-xs font-medium text-amber-700">workers</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-400/80">
              {t.beyondShiftGate}
            </p>
          </div>

          {/* Card 4: PPE Compliance */}
          <div className="rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-[#0d3f6d] dark:text-sky-400">
              <span className="text-xs font-bold uppercase tracking-wider text-[#695d4d] dark:text-slate-400">
                {t.ppeCompliance}
              </span>
              <HardHat className="h-4 w-4" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#0d3f6d] dark:text-sky-300">
                {realtime?.ppeComplianceRate ?? 100}%
              </span>
              <span className="text-xs font-medium text-emerald-600">
                {t.verified}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#716554] dark:text-slate-400">
              Lamp, detector, helmet check
            </p>
          </div>

          {/* Card 5: Surface & Checked Out */}
          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-[#695d4d] dark:text-slate-400">
                {t.surfaceExited}
              </span>
              <LogOut className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1b1b1b] dark:text-white">
                {(realtime?.surfaceAreaCount || 0) +
                  (realtime?.checkedOutCount || 0)}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {t.safeZone}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#716554] dark:text-slate-400">
              {t.outsideExtractionZone}
            </p>
          </div>
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          {/* Tab Switcher */}
          <div className="inline-flex rounded-xl bg-[#ede3d3] p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("inside")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "inside"
                  ? "bg-[#0d3f6d] text-white shadow-sm"
                  : "text-[#4d4437] hover:text-black dark:text-slate-300"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>
                {language === "hi" ? "भूमिगत खदान के अंदर" : "Inside Underground Mine"} ({realtime?.insideMineCount || 0})
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-[#0d3f6d] text-white shadow-sm"
                  : "text-[#4d4437] hover:text-black dark:text-slate-300"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{language === "hi" ? "पूरी उपस्थिति सूची" : "Full Attendance Roster"} ({records.length})</span>
            </button>
          </div>

          {/* Search & Filter select boxes */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === "hi" ? "श्रमिक या आईडी खोजें..." : "Search worker or ID..."}
                className="w-full rounded-xl border border-[#cbb79d] bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="rounded-xl border border-[#cbb79d] bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{language === "hi" ? "सभी शिफ्ट" : "All Shifts"}</option>
              <option value="Shift A (Morning)">Shift A (Morning)</option>
              <option value="Shift B (Evening)">Shift B (Evening)</option>
              <option value="Shift C (Night)">Shift C (Night)</option>
            </select>

            <select
              value={selectedMine}
              onChange={(e) => setSelectedMine(e.target.value)}
              className="rounded-xl border border-[#cbb79d] bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">{language === "hi" ? "सभी खदानें" : "All Mines"}</option>
              {mines.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attendance Roster Table */}
        <div className="overflow-hidden rounded-2xl border border-[#d6c4a8] bg-[#fbf8f2] shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#e5d8c3] bg-[#f4ebdc] text-[#554a3b] dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Worker Details
                  </th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Mine & Zone
                  </th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Shift & Role
                  </th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Clock-In Time
                  </th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Live Status
                  </th>
                  <th className="px-4 py-3.5 font-bold uppercase tracking-wider">
                    Safety & Temp
                  </th>
                  <th className="px-4 py-3.5 text-right font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#ece2d1] dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      {language === "hi" ? "उपस्थिति डेटा लोड हो रहा है..." : "Loading attendance telemetry..."}
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      {activeTab === "inside"
                        ? language === "hi" ? "अभी भूमिगत सुरंग में कोई खनिक दर्ज नहीं है।" : "No miners currently logged inside the underground shaft."
                        : language === "hi" ? "आपके फ़िल्टर से कोई उपस्थिति रिकॉर्ड नहीं मिला।" : "No attendance records match your filter."}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((worker) => {
                    const isInside = worker.liveStatus === "inside_mine";
                    const isSurface = worker.liveStatus === "surface_area";
                    const isCheckedOut = worker.liveStatus === "checked_out";

                    return (
                      <tr
                        key={worker._id}
                        className="transition hover:bg-[#f6efe1] dark:hover:bg-slate-800/50"
                      >
                        {/* Worker Details */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                                isInside
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                  : isSurface
                                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {worker.workerName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-[#1a1a1a] text-sm dark:text-white">
                                {worker.workerName}
                              </div>
                              <div className="font-mono text-[11px] text-slate-500">
                                {worker.workerId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Mine & Zone */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {worker.mineId?.name || "Coalfield Site"}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <MapPin className="h-3 w-3 text-amber-600" />
                            <span>{worker.zone || "Underground Seam"}</span>
                          </div>
                        </td>

                        {/* Shift & Role */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {worker.role}
                          </div>
                          <span className="inline-block rounded-md bg-[#eee4d4] px-1.5 py-0.5 text-[10px] font-bold text-[#554a3b] dark:bg-slate-800 dark:text-slate-400">
                            {worker.shift}
                          </span>
                        </td>

                        {/* Clock In */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {worker.checkIn
                              ? format(new Date(worker.checkIn), "hh:mm a")
                              : "—"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {worker.status === "late" ? (
                              <span className="font-bold text-amber-600">
                                Late Entry
                              </span>
                            ) : (
                              "On Schedule"
                            )}
                          </div>
                        </td>

                        {/* Live Status */}
                        <td className="px-4 py-3.5 align-middle">
                          {isInside ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Inside Pit / Seam
                            </span>
                          ) : isSurface ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                              Surface Workshop
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Checked Out ({format(new Date(worker.checkOut || worker.updatedAt), "hh:mm a")})
                            </span>
                          )}
                        </td>

                        {/* Safety & Temp */}
                        <td className="px-4 py-3.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                worker.safetyGearVerified
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              }`}
                            >
                              <Shield className="h-3 w-3" />
                              {worker.safetyGearVerified ? "PPE PASS" : "PPE PENDING"}
                            </span>
                            <span className="flex items-center gap-0.5 text-[11px] font-mono text-slate-500">
                              <Thermometer className="h-3 w-3 text-orange-500" />
                              {worker.bodyTemp || 36.6}°C
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right align-middle">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isCheckedOut && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleZone(worker._id, worker.liveStatus)
                                }
                                className="rounded-lg border border-[#cbb79d] bg-white px-2 py-1 text-[11px] font-semibold text-[#2c2c2c] transition hover:bg-[#ede3d3] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                title="Toggle worker position"
                              >
                                {isInside ? "To Surface" : "To Pit"}
                              </button>
                            )}

                            {!isCheckedOut ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCheckOut(worker._id, worker.workerName)
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-red-300/80 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-950/20 dark:text-red-400"
                                title="Clock out worker"
                              >
                                <LogOut className="h-3 w-3" />
                                <span>Check Out</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Shift Finished
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clock-In Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#cbb79d] bg-[#fbf7f0] p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-[#e1d3bc] pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-[#0d3f6d] dark:text-sky-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Mark Worker Clock-In (Gate Entry)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Worker Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.workerName}
                    onChange={(e) =>
                      setForm({ ...form, workerName: e.target.value })
                    }
                    placeholder="e.g. Anand Murmu"
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Badge / Biometric ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.workerId}
                    onChange={(e) =>
                      setForm({ ...form, workerId: e.target.value })
                    }
                    placeholder="CW-4091"
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Mine Site *
                  </label>
                  <select
                    required
                    value={form.mineId}
                    onChange={(e) =>
                      setForm({ ...form, mineId: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {mines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Shift *
                  </label>
                  <select
                    value={form.shift}
                    onChange={(e) =>
                      setForm({ ...form, shift: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Shift A (Morning)">Shift A (Morning - 08:00)</option>
                    <option value="Shift B (Evening)">Shift B (Evening - 16:00)</option>
                    <option value="Shift C (Night)">Shift C (Night - 00:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Assigned Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Miner">Miner (Coal Face)</option>
                    <option value="Blaster">Blaster</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Heavy Equipment Operator">Equipment Operator</option>
                    <option value="Surveyor">Surveyor</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Ventilation Engineer">Ventilation Engineer</option>
                    <option value="Contractor Worker">Contractor Worker</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Working Underground Zone
                  </label>
                  <input
                    type="text"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    placeholder="Pit-1 Underground Face"
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Body Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.bodyTemp}
                    onChange={(e) =>
                      setForm({ ...form, bodyTemp: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={form.emergencyContact}
                    onChange={(e) =>
                      setForm({ ...form, emergencyContact: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-[#cbb79d] bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#0d3f6d] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* PPE Verification Check */}
              <div className="flex items-center gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/80 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
                <input
                  type="checkbox"
                  id="ppe-check"
                  checked={form.safetyGearVerified}
                  onChange={(e) =>
                    setForm({ ...form, safetyGearVerified: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-emerald-600"
                />
                <label
                  htmlFor="ppe-check"
                  className="text-xs font-medium text-emerald-900 dark:text-emerald-300 cursor-pointer"
                >
                  Statutory PPE Check Verified (Safety Helmet, Cap Lamp, Multi-Gas Detector, Safety Boots)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e1d3bc] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#cbb79d] px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0d3f6d] px-5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#155a9b]"
                >
                  {submitting ? "Checking In..." : "Confirm Gate Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
