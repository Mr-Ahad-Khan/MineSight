import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { triggerSyncNow, getPendingSyncCount } from "../../services/api";
import { subscribeToSyncStatus } from "../../services/syncQueue";

export default function OfflineSyncBadge({ compact = false }) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleQueueChange = (e) => {
      setPendingCount(e.detail?.pendingCount ?? getPendingSyncCount());
    };
    window.addEventListener("minesight:queue-updated", handleQueueChange);

    const unsubscribe = subscribeToSyncStatus((status) => {
      if (status.isSyncing !== undefined) setIsSyncing(status.isSyncing);
      if (status.pendingCount !== undefined) setPendingCount(status.pendingCount);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("minesight:queue-updated", handleQueueChange);
      unsubscribe();
    };
  }, []);

  const handleSyncClick = async (e) => {
    e.stopPropagation();
    if (!isSyncing && pendingCount > 0 && isOnline) {
      await triggerSyncNow();
    }
  };

  if (compact) {
    if (!isOnline) {
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
          title={`Offline Mode · ${pendingCount} pending updates`}
        >
          <WifiOff className="h-3 w-3 shrink-0" />
          <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ""}</span>
        </span>
      );
    }
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300 animate-pulse">
          <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />
          <span>Syncing</span>
        </span>
      );
    }
    if (pendingCount > 0) {
      return (
        <button
          onClick={handleSyncClick}
          className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-500/30 dark:text-amber-300"
          title="Click to sync offline changes"
        >
          <RefreshCw className="h-3 w-3 shrink-0" />
          <span>Sync ({pendingCount})</span>
        </button>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
        title="Connected and in sync"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Live</span>
      </span>
    );
  }

  // Full badge
  if (!isOnline) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/60 dark:text-amber-200"
        role="status"
        title="Operating in offline mode. Changes are saved locally and will auto-sync when online."
      >
        <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Offline Mode</span>
        {pendingCount > 0 && (
          <span className="ml-0.5 rounded-full bg-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">
            {pendingCount} queued
          </span>
        )}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-900 shadow-sm dark:border-sky-700/60 dark:bg-sky-950/60 dark:text-sky-200"
        role="status"
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
        <span>Syncing changes...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleSyncClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/80"
        title="Click to sync pending changes with server now"
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Sync ({pendingCount})</span>
      </button>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300"
      title="Connected and synchronized with MineSight servers"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
      </span>
      <span>Live & Synced</span>
    </div>
  );
}
