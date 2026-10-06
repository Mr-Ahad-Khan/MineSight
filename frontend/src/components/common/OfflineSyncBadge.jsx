import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { triggerSyncNow, getPendingSyncCount } from "../../services/api";
import { subscribeToSyncStatus } from "../../services/syncQueue";
import { subscribeNetworkStatus, getNetworkStatus } from "../../services/networkManager";

export default function OfflineSyncBadge({ compact = false }) {
  const [isOnline, setIsOnline] = useState(() => getNetworkStatus());
  const [pendingCount, setPendingCount] = useState(getPendingSyncCount());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubNetwork = subscribeNetworkStatus((online) => {
      setIsOnline(online);
    });

    const handleNetworkEvent = (e) => {
      if (typeof e.detail?.isOnline === "boolean") {
        setIsOnline(e.detail.isOnline);
      }
    };
    window.addEventListener("minesight:network-status", handleNetworkEvent);

    const handleQueueChange = (e) => {
      setPendingCount(e.detail?.pendingCount ?? getPendingSyncCount());
    };
    window.addEventListener("minesight:queue-updated", handleQueueChange);

    const unsubscribe = subscribeToSyncStatus((status) => {
      if (status.isSyncing !== undefined) setIsSyncing(status.isSyncing);
      if (status.pendingCount !== undefined) setPendingCount(status.pendingCount);
    });

    return () => {
      unsubNetwork();
      window.removeEventListener("minesight:network-status", handleNetworkEvent);
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
          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-[#78350f] dark:bg-amber-950/70 dark:text-amber-200"
          title={`Offline Mode · ${pendingCount} pending updates`}
        >
          <WifiOff className="h-3 w-3 shrink-0 text-[#78350f] dark:text-amber-300" strokeWidth={2.5} />
          <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ""}</span>
        </span>
      );
    }
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-[#0c4a6e] dark:bg-sky-950/70 dark:text-sky-200 animate-pulse">
          <RefreshCw className="h-3 w-3 shrink-0 animate-spin text-[#0369a1] dark:text-sky-300" strokeWidth={2.5} />
          <span>Syncing</span>
        </span>
      );
    }
    if (pendingCount > 0) {
      return (
        <button
          onClick={handleSyncClick}
          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-[#78350f] hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-200"
          title="Click to sync offline changes"
        >
          <RefreshCw className="h-3 w-3 shrink-0 text-[#78350f] dark:text-amber-300" strokeWidth={2.5} />
          <span>Sync ({pendingCount})</span>
        </button>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#065f46] dark:text-emerald-300"
        title="Connected and in sync"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        <span>Live</span>
      </span>
    );
  }

  // Full badge
  if (!isOnline) {
    return (
      <div
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-amber-400 bg-amber-100/95 px-2.5 text-xs font-bold text-amber-950 shadow-sm transition hover:bg-amber-200 dark:border-amber-600/70 dark:bg-amber-950/90 dark:text-amber-200"
        role="status"
        aria-label={`Offline${pendingCount > 0 ? `, ${pendingCount} pending updates` : ""}`}
        title="Operating in offline mode. Changes are saved locally and will auto-sync when online."
      >
        <WifiOff className="h-3.5 w-3.5 shrink-0 text-[#78350f] dark:text-amber-300" strokeWidth={2.5} />
        <span className="text-[11px] font-extrabold tracking-tight">Offline{pendingCount > 0 ? ` (${pendingCount})` : ""}</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-400 bg-sky-100/90 px-2.5 py-1 text-xs font-semibold text-[#0c4a6e] shadow-sm dark:border-sky-600/70 dark:bg-sky-950/80 dark:text-sky-200"
        role="status"
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0 animate-spin text-[#0369a1] dark:text-sky-300" strokeWidth={2.5} />
        <span>Syncing changes...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={handleSyncClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-100/90 px-2.5 py-1 text-xs font-bold text-[#78350f] shadow-sm transition hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-950/80 dark:text-amber-200 dark:hover:bg-amber-900/80"
        title="Click to sync pending changes with server now"
      >
        <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[#78350f] dark:text-amber-300" strokeWidth={2.5} />
        <span>Sync ({pendingCount})</span>
      </button>
    );
  }

  return (
    <div
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400 bg-emerald-100/90 text-emerald-950 shadow-sm transition hover:bg-emerald-200 dark:border-emerald-600/70 dark:bg-emerald-950/80 dark:text-emerald-200"
      role="status"
      aria-label="Online and synchronized"
      title="Connected and synchronized with MineSight servers"
    >
      <Wifi className="h-4 w-4 shrink-0 text-[#065f46] dark:text-emerald-300" strokeWidth={2.5} aria-hidden="true" />
    </div>
  );
}
