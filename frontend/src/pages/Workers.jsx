import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CalendarDays,
  MapPin,
  Save,
  Users,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import {
  getWorkerSummary,
  markWorkerAttendance,
  updateWorkerTask,
  reassignPendingWorkerTasks,
} from "../services/api";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

const statusLabels = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

const attendanceLabels = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  leave: "Leave",
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "No record";

  const formatTrackedDuration = (value) => {
    if (!value) return "No activity recorded";
    const start = new Date(value);
    const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    const duration = days < 30
      ? `${days} day${days === 1 ? "" : "s"}`
      : `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"}`;
    return `Tracked since ${formatDate(value)} · ${duration}`;
  };

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-[#cbbda7] bg-[#fffdf8] p-5 shadow-[0_2px_5px_rgba(80,60,30,0.08)] dark:border-slate-700 dark:bg-slate-900">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function Workers() {
  const { language } = useLanguageStore();
  const t = translations[language] || translations.en;
  const { user } = useAuthStore();
  const [summary, setSummary] = useState({ workers: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    workerId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "present",
    mineId: "",
    notes: "",
  });
  const isWorker = user?.role === "worker";

  const loadSummary = async () => {
    try {
      const { data } = await getWorkerSummary();
      setSummary(data.data || { workers: [], totals: {} });
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load worker details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (!isWorker && summary.workers.length && !attendanceForm.workerId) {
      const firstWorker = summary.workers[0];
      setAttendanceForm((current) => ({
        ...current,
        workerId: firstWorker._id,
        mineId: firstWorker.mineId?._id || firstWorker.mineSites?.[0]?._id || "",
      }));
    }
  }, [isWorker, summary.workers, attendanceForm.workerId]);

  const currentWorker = isWorker ? summary.workers[0] : null;
  const totals = summary.totals || {};
  const allTasks = useMemo(
    () => (currentWorker?.tasks || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [currentWorker],
  );

  const handleAttendance = async (status) => {
    setSavingAttendance(true);
    try {
      await markWorkerAttendance({
        status,
        workerId: user._id,
        mineId: user.mineId?._id || user.mineId,
      });
      toast.success(`Attendance marked ${attendanceLabels[status].toLowerCase()}`);
      await loadSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleAdminAttendance = async (event) => {
    event.preventDefault();
    if (!attendanceForm.workerId) {
      toast.error("Select a worker first");
      return;
    }

    setSavingAttendance(true);
    try {
      await markWorkerAttendance(attendanceForm);
      toast.success("Attendance saved successfully");
      await loadSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const selectedWorker = summary.workers.find(
    (worker) => worker._id === attendanceForm.workerId,
  );

  const handleTaskStatus = async (taskId, status) => {
    try {
      await updateWorkerTask(taskId, { status });
      toast.success("Task status updated");
      await loadSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update task");
    }
  };

  const handleReassign = async (worker) => {
    try {
      const { data } = await reassignPendingWorkerTasks(worker._id);
      toast.success(data.message || "Pending tasks reassigned");
      await loadSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not reassign pending tasks");
    }
  };

  if (loading) {
    return <section className="mx-auto max-w-7xl p-6 text-slate-500">{t.loading}</section>;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">
            {t.workforceOperations}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {isWorker ? t.myWorkAttendance : t.workersTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.workersSubtitle}
          </p>
        </div>
        {isWorker && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingAttendance}
              onClick={() => handleAttendance("present")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" /> {t.markPresent}
            </button>
            <button
              type="button"
              disabled={savingAttendance}
              onClick={() => handleAttendance("late")}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-60 dark:text-amber-300 dark:hover:bg-amber-950/30"
            >
              <Clock3 className="h-4 w-4" /> {t.markLate}
            </button>
          </div>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label={t.totalWorkers} value={isWorker ? 1 : totals.workers || 0} tone="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" />
        <Stat icon={Activity} label={t.pendingWork} value={isWorker ? currentWorker?.pendingTasks || 0 : totals.pendingTasks || 0} tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" />
        <Stat icon={CheckCircle2} label={t.completedWork} value={isWorker ? currentWorker?.completedTasks || 0 : totals.completedTasks || 0} tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" />
        <Stat icon={ClipboardCheck} label={t.presentToday} value={isWorker ? ["present", "late"].includes(currentWorker?.attendance?.latest?.status) ? 1 : 0 : totals.presentToday || 0} tone="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" />
      </div>

      {isWorker ? (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            {!!currentWorker?.pendingTasks && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="flex items-start gap-3">
                  <Bell className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h2 className="font-semibold">{t.pendingWorkNotification}</h2>
                    <p className="mt-1 text-sm">You have {currentWorker.pendingTasks} pending task{currentWorker.pendingTasks === 1 ? "" : "s"}. Review and update the status below.</p>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-[#cbbda7] bg-[#fffdf8] p-5 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.workerProfile}</h2>
                <Link
                  to="/app/profile"
                  className="rounded-md border border-primary-600/30 px-2.5 py-1 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 dark:border-primary-400/30 dark:text-primary-300 dark:hover:bg-primary-950/40"
                >
                  {t.manageAccountShort} &rarr;
                </Link>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-slate-500">{t.name}</dt><dd className="font-semibold">{currentWorker?.name || user.name}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">{t.employeeId}</dt><dd className="font-semibold">{currentWorker?.employeeId || t.notAssigned}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">{t.department}</dt><dd className="font-semibold">{currentWorker?.department || t.notAssigned}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">{t.latestAttendance}</dt><dd className="font-semibold">{currentWorker?.attendance?.latest ? attendanceLabels[currentWorker.attendance.latest.status] : t.notMarked}</dd></div>
              </dl>
            </div>
            <div className="rounded-2xl border border-[#cbbda7] bg-[#fffdf8] p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t.workByMine}</h2>
              <MineWorkList items={currentWorker?.mineWork || []} />
              {!currentWorker?.mineWork?.length && currentWorker?.mineSites?.length > 0 && (
                <p className="mt-3 text-sm text-slate-500">Assigned sites: {currentWorker.mineSites.map((mine) => mine.name).join(", ")}. No task or attendance history recorded yet.</p>
              )}
              {!currentWorker?.mineSites?.length && !currentWorker?.mineWork?.length && (
                <p className="mt-3 text-sm text-slate-500">No mine site assigned yet.</p>
              )}
            </div>
          </div>
          <TaskList tasks={allTasks} onStatusChange={handleTaskStatus} />
        </div>
      ) : (
        <>
          <form
            onSubmit={handleAdminAttendance}
            className="rounded-2xl border border-[#cbbda7] bg-[#fffdf8] p-5 shadow-[0_2px_5px_rgba(80,60,30,0.08)] dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Attendance management
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Mark attendance for any worker and review it in the table below.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="block xl:col-span-1">
                <span className="label">Worker</span>
                <select
                  value={attendanceForm.workerId}
                  onChange={(event) => {
                    const worker = summary.workers.find((item) => item._id === event.target.value);
                    setAttendanceForm((current) => ({
                      ...current,
                      workerId: event.target.value,
                      mineId: worker?.mineId?._id || worker?.mineSites?.[0]?._id || "",
                    }));
                  }}
                  className="input-field"
                  required
                >
                  <option value="">Select worker</option>
                  {summary.workers.map((worker) => (
                    <option key={worker._id} value={worker._id}>
                      {worker.name} {worker.employeeId ? `(${worker.employeeId})` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label">Date</span>
                <input
                  type="date"
                  value={attendanceForm.date}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, date: event.target.value }))}
                  className="input-field"
                  required
                />
              </label>

              <label className="block">
                <span className="label">Status</span>
                <select
                  value={attendanceForm.status}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, status: event.target.value }))}
                  className="input-field"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </label>

              <label className="block">
                <span className="label">Mine site</span>
                <select
                  value={attendanceForm.mineId}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, mineId: event.target.value }))}
                  className="input-field"
                >
                  <option value="">Assigned site</option>
                  {(selectedWorker?.mineSites || []).map((mine) => (
                    <option key={mine._id} value={mine._id}>{mine.name}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={savingAttendance || !summary.workers.length}
                className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Save attendance
              </button>
            </div>

            <label className="mt-4 block max-w-2xl">
              <span className="label">Notes (optional)</span>
              <input
                value={attendanceForm.notes}
                onChange={(event) => setAttendanceForm((current) => ({ ...current, notes: event.target.value }))}
                className="input-field"
                placeholder="Shift or attendance note"
              />
            </label>
          </form>

          <div className="overflow-hidden rounded-2xl border border-[#cbbda7] bg-[#fffdf8] shadow-[0_2px_5px_rgba(80,60,30,0.08)] dark:border-slate-700 dark:bg-slate-900">
          <div className="table-scroll-container">
            <table className="mobile-readable-table text-sm">
              <thead className="border-b border-[#cbbda7] text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <tr><th className="px-5 py-4">Worker</th><th className="px-5 py-4">Department</th><th className="px-5 py-4">Work by mine</th><th className="px-5 py-4">Pending</th><th className="px-5 py-4">Completed</th><th className="px-5 py-4">Attendance</th></tr>
              </thead>
              <tbody className="divide-y divide-[#e2d6c4] dark:divide-slate-800">
                {summary.workers.map((worker) => <tr key={worker._id} className="align-top"><td className="px-5 py-4"><div className="font-semibold text-slate-900 dark:text-white">{worker.name}</div><div className="text-xs text-slate-500">{worker.employeeId || worker.email}</div></td><td className="px-5 py-4">{worker.department || "Not assigned"}</td><td className="px-5 py-4"><MineWorkList items={worker.mineWork || []} compact /></td><td className="px-5 py-4 font-semibold text-amber-700 dark:text-amber-300">{worker.pendingTasks}{worker.pendingTasks > 0 && ["absent", "leave"].includes(worker.attendance.latest?.status) && <button type="button" onClick={() => handleReassign(worker)} className="mt-2 block text-xs font-semibold text-primary-700 hover:underline dark:text-primary-300">Assign to available worker</button>}</td><td className="px-5 py-4 font-semibold text-emerald-700 dark:text-emerald-300">{worker.completedTasks}</td><td className="px-5 py-4"><AttendanceBadge record={worker.attendance.latest} /></td></tr>)}
              </tbody>
            </table>
          </div>
          {!summary.workers.length && <div className="p-8 text-center text-sm text-slate-500">No worker accounts found. Register a user with the Worker role first.</div>}
          </div>
        </>
      )}
    </section>
  );
}

function AttendanceBadge({ record }) {
  if (!record) return <span className="text-slate-400">Not marked</span>;
  const positive = ["present", "late"].includes(record.status);
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${positive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"}`}>{positive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{attendanceLabels[record.status]} · {formatDate(record.date)}</span>;
}

function MineWorkList({ items, compact = false }) {
  if (!items.length) {
    return <p className="mt-3 text-sm text-slate-500">No task or attendance history.</p>;
  }

  return (
    <div className={`mt-3 space-y-3 ${compact ? "min-w-[230px]" : ""}`}>
      {items.map((item) => (
        <div key={item.mine._id} className="border-l-2 border-primary-500 pl-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-600" />
            {item.mine.name} {item.mine.code ? `(${item.mine.code})` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatTrackedDuration(item.trackedSince)}</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Tasks: {item.completedTasks} completed · {item.inProgressTasks} in progress · {item.pendingTasks} pending
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Attendance: {item.attendanceDays} days · {item.workedHours} logged hours
          </p>
        </div>
      ))}
    </div>
  );
}

function TaskList({ tasks, onStatusChange }) {
  return <div className="rounded-2xl border border-[#cbbda7] bg-[#fffdf8] p-5 dark:border-slate-700 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">My work</h2><span className="text-sm text-slate-500">{tasks.length} tasks</span></div><div className="mt-4 space-y-3">{tasks.map((task) => <div key={task._id} className="rounded-xl border border-[#e2d6c4] p-4 dark:border-slate-700"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-slate-900 dark:text-white">{task.title}</p><p className="mt-1 text-xs text-slate-500">{task.mineId?.name || "Mine not assigned"} · Due {formatDate(task.dueDate)}</p></div><select value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)} className="rounded-lg border border-slate-300 bg-transparent px-2 py-1 text-xs dark:border-slate-600"><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></div></div>)}{!tasks.length && <p className="py-8 text-center text-sm text-slate-500">No work has been assigned yet.</p>}</div></div>;
}
