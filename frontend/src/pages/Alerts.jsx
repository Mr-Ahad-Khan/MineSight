import { useEffect, useState } from "react";
import { getAlerts, markAlertRead, markAllAlertsRead } from "../services/api";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { hi } from "date-fns/locale";
import toast from "react-hot-toast";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

const severityColor = {
  info: "border-blue-500 bg-blue-50 dark:bg-blue-900/10",
  warning: "border-amber-500 bg-amber-50 dark:bg-amber-900/10",
  critical: "border-red-500 bg-red-50 dark:bg-red-900/10",
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
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.alertTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.alertSubtitle}</p>
        </div>
        <button
          onClick={handleMarkAll}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <CheckCheck className="w-4 h-4" /> {t.markAllRead}
        </button>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-3">
        {loading ? (
          <p className="text-slate-400">{t.loading}</p>
        ) : alerts.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>{t.noAlerts}</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`card grid min-h-28 grid-cols-1 items-center gap-4 border-l-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] ${severityColor[alert.severity] || ""} ${
                alert.isRead ? "opacity-60" : ""
              }`}
            >
              {(() => {
                const alertText = getAlertText(alert);
                return (
              <div className="min-w-0 text-center sm:text-left">
                <p className="font-medium">{alertText.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {alertText.message}
                </p>
                <p className="text-xs text-slate-400 mt-2">
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
                  className="justify-self-center text-xs text-primary-600 hover:underline sm:justify-self-end"
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
