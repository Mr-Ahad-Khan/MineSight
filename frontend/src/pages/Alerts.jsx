import { useEffect, useState } from "react";
import { getAlerts, markAlertRead, markAllAlertsRead } from "../services/api";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hi } from "date-fns/locale";
import toast from "react-hot-toast";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

const severityColor = {
  info: "border-l-blue-500 bg-blue-50/50 dark:bg-slate-900/90 dark:border-l-blue-400",
  warning: "border-l-amber-500 bg-amber-50/50 dark:bg-slate-900/90 dark:border-l-amber-400",
  critical: "border-l-rose-500 bg-rose-50/50 dark:bg-slate-900/90 dark:border-l-rose-500",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguageStore();
  const t = translations[language];

  const getAlertText = (alert) => {
    if (alert.title?.startsWith("Inspection Escalated")) {
      return {
        title: `${t.inspectionEscalated}${alert.title.slice("Inspection Escalated".length)}`,
        message: t.inspectionEscalatedMessage,
      };
    }

    if (alert.title?.startsWith("High Risk Inspection")) {
      return {
        title: `${t.highRiskInspection}${alert.title.slice("High Risk Inspection".length)}`,
        message: t.highRiskInspectionMessage,
      };
    }

    return { title: alert.title, message: alert.message };
  };

  const fetchAlerts = () => {
    getAlerts()
      .then((res) => setAlerts(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    await markAlertRead(id);
    fetchAlerts();
  };

  const handleMarkAll = async () => {
    await markAllAlertsRead();
    toast.success(t.alertsMarkedRead);
    fetchAlerts();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 pb-28 sm:pb-16">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t.alertTitle}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.alertSubtitle}</p>
        </div>
        <button
          onClick={handleMarkAll}
          className="btn-secondary flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <CheckCheck className="w-4 h-4" /> {t.markAllRead}
        </button>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-3">
        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">{t.loading}</p>
        ) : alerts.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 dark:text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{t.noAlerts}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`card grid min-h-24 grid-cols-1 items-center gap-4 border-l-4 p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] ${
                alert.isRead
                  ? "border-l-slate-400/80 dark:border-l-slate-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                  : `${severityColor[alert.severity] || "border-l-slate-400 bg-white dark:bg-slate-900"} border border-slate-200 dark:border-slate-800`
              }`}
            >
              {(() => {
                const alertText = getAlertText(alert);
                return (
                  <div className="min-w-0 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <p className="font-bold text-slate-950 dark:text-white text-base tracking-tight">
                        {alertText.title}
                      </p>
                      {alert.isRead && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Read
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1.5 leading-relaxed">
                      {alertText.message}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                      {formatDistanceToNow(new Date(alert.createdAt), {
                        addSuffix: true,
                        locale: language === "hi" ? hi : undefined,
                      })}
                      {alert.mineId?.name && ` • ${alert.mineId.name}`}
                    </p>
                  </div>
                );
              })()}
              {!alert.isRead && (
                <button
                  onClick={() => handleMarkRead(alert._id)}
                  className="justify-self-center sm:justify-self-end inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-sky-700 bg-sky-100 hover:bg-sky-200 dark:text-sky-300 dark:bg-sky-950/70 dark:hover:bg-sky-900/80 border border-sky-300/50 dark:border-sky-700/60 shadow-sm transition active:scale-95"
                >
                  {t.markRead}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
