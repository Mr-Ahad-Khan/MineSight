import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  Loader2,
  X,
  Trash2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteInspection,
  getInspection,
  updateInspection,
  closeViolation,
  getMediaUrl,
  getInspectionAuditHistory,
} from "../services/api";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "../utils/leafletAssets";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";

const severityBadge = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
  critical: "badge-critical",
};

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [auditTrail, setAuditTrail] = useState(null);
  const [auditError, setAuditError] = useState("");
  const proofInputRef = useRef(null);

  const adjustPhotoZoom = (amount) => {
    setPhotoZoom((current) => Math.min(4, Math.max(1, current + amount)));
  };

  useEffect(() => {
    fetchInspection();
    fetchAuditTrail();
  }, [id]);

  useEffect(() => {
    if (!selectedPhoto) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedPhoto(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  const fetchInspection = async () => {
    try {
      const res = await getInspection(id);
      setInspection(res.data.data);
    } catch (error) {
      toast.error("Inspection not found");
      navigate("/app/inspections");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async () => {
    try {
      const response = await getInspectionAuditHistory(id);
      setAuditTrail(response.data.data);
      setAuditError("");
    } catch (error) {
      setAuditError(error.response?.data?.message || "Could not verify the audit chain.");
    }
  };

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      const res = await updateInspection(id, {
        status,
        ...(status === "open" ? { closedAt: null } : {}),
      });
      setInspection(res.data.data);
      await fetchAuditTrail();
      toast.success(`${t.statusUpdated} ${status}`);
    } catch (error) {
      toast.error(t.failedUpdate);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseWithProof = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5);
    event.target.value = "";
    if (!files.length) return;

    setUpdating(true);
    try {
      const payload = new FormData();
      payload.append("status", "closed");
      files.forEach((file) => payload.append("photos", file));
      const res = await updateInspection(id, payload);
      setInspection(res.data.data);
      await fetchAuditTrail();
      toast.success("Inspection closed with photo proof");
    } catch (error) {
      toast.error(error.response?.data?.message || t.failedUpdate);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseViolation = async (violationId) => {
    try {
      const res = await closeViolation(id, violationId);
      setInspection(res.data.data);
      await fetchAuditTrail();
      toast.success(t.violationClosed);
    } catch (error) {
      toast.error(t.failedClose);
    }
  };

  const handleDeleteInspection = async () => {
    if (!window.confirm("Are you sure you want to delete this inspection?"))
      return;

    try {
      await deleteInspection(id);
      toast.success("Inspection deleted successfully");
      navigate("/app/inspections");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete inspection",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!inspection) return null;

  const coords = inspection.location?.coordinates
    ? [inspection.location.coordinates[1], inspection.location.coordinates[0]]
    : null;

  const audioUrl = getMediaUrl(inspection.audio);
  const hasProof = inspection.photos?.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{inspection.title}</h1>
            <span className={`badge ${severityBadge[inspection.severity]}`}>
              {inspection.severity}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {inspection.mineId?.name} •{" "}
            {format(new Date(inspection.createdAt), "dd MMM yyyy, HH:mm")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`text-center px-4 py-2 rounded-lg ${
              inspection.riskScore >= 80
                ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                : inspection.riskScore >= 60
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                  : inspection.riskScore >= 35
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
            }`}
          >
            <p className="text-xs font-medium">{t.riskScore}</p>
            <p className="text-2xl font-bold">{inspection.riskScore}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold">{t.detailTitle}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">{t.type}</p>
                <p className="font-medium capitalize">{inspection.type}</p>
              </div>
              <div>
                <p className="text-slate-500">{t.status}</p>
                <p className="font-medium capitalize">
                  {inspection.status?.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-slate-500">{t.inspector}</p>
                <p className="font-medium">
                  {inspection.inspectorId?.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">{t.mineCode}</p>
                <p className="font-medium">{inspection.mineId?.code || "—"}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-primary-600" />
                {t.description || "Description"}
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                {inspection.description || (
                  <span className="italic text-slate-400">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            {inspection.observations && (
              <div className="rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {t.observations || "Observations"}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {inspection.observations}
                </p>
              </div>
            )}

            {audioUrl && (
              <div className="pt-2">
                <p className="text-slate-500 text-sm mb-2">Voice Note</p>
                <audio
                  controls
                  src={audioUrl}
                  className="w-full max-w-md"
                  onError={(event) => {
                    event.currentTarget.parentElement.style.display = "none";
                  }}
                />
              </div>
            )}

            {inspection.photos?.length > 0 && (
              <div className="pt-3">
                <p className="text-slate-500 text-sm mb-2">Site Photos</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {inspection.photos.map((photo, index) => {
                    const photoSrc = getMediaUrl(photo);
                    return (
                      <button
                        key={`${photo}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(photoSrc);
                          setPhotoZoom(1);
                        }}
                        className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={photoSrc}
                          alt={`Inspection site ${index + 1}`}
                          className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-110 group-focus:scale-110"
                          onError={(event) => {
                            event.currentTarget.closest(
                              "button",
                            ).style.display = "none";
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Violations */}
          <div className="card p-5">
            <h2 className="font-semibold mb-4">
              {t.violationCount} ({inspection.violations?.length || 0})
            </h2>
            {!inspection.violations || inspection.violations.length === 0 ? (
              <p className="text-slate-400 text-sm">{t.noViolations}</p>
            ) : (
              <div className="space-y-3">
                {inspection.violations.map((v) => (
                  <div
                    key={v._id}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{v.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {v.category} •{" "}
                          <span
                            className={`badge ${severityBadge[v.severity]}`}
                          >
                            {v.severity}
                          </span>
                        </p>
                        {v.correctiveAction && (
                          <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                            <strong>{t.actionLabel}:</strong>{" "}
                            {v.correctiveAction}
                          </p>
                        )}
                      </div>
                      {v.status === "open" ? (
                        <button
                          onClick={() => handleCloseViolation(v._id)}
                          className="btn-secondary text-xs flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {t.close}
                        </button>
                      ) : (
                        <span className="badge badge-low">{t.closed}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">{t.actions}</h2>
            {inspection.status !== "closed" && (
              <>
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={updating || inspection.status === "in_progress"}
                  className="btn-secondary w-full text-sm"
                >
                  {t.markInProgress}
                </button>
                <button
                  onClick={() => handleStatusChange("escalated")}
                  disabled={updating}
                  className="btn-secondary w-full text-sm text-orange-600"
                >
                  {t.escalate}
                </button>
                <button
                  onClick={() => handleStatusChange("closed")}
                  disabled={updating}
                  className="btn-primary w-full text-sm"
                >
                  {t.closeInspection}
                </button>
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleCloseWithProof}
                />
                <button
                  type="button"
                  onClick={() => proofInputRef.current?.click()}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-900/50"
                >
                  <Upload className="h-4 w-4" /> Close & add photo proof
                </button>
              </>
            )}
            {inspection.status === "closed" && (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-4 w-4" /> {t.inspectionClosed}
                </p>
                {hasProof ? (
                  <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-4 w-4" /> Proof verified
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-600 dark:text-slate-300">No photo proof attached</p>
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleCloseWithProof}
                    />
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      disabled={updating}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:opacity-60 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-900/50"
                    >
                      <Upload className="h-4 w-4" /> Add proof & close inspection
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handleStatusChange("open")}
                  disabled={updating}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4" /> Reopen inspection
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDeleteInspection}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70"
            >
              <Trash2 className="h-4 w-4" />
              Delete Inspection
            </button>
          </div>

          <div className="card space-y-3 p-5 text-slate-700 dark:text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">Blockchain audit trail</h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">SHA-256 hash-linked inspection changes</p>
              </div>
              <button
                type="button"
                onClick={fetchAuditTrail}
                className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Refresh audit trail verification"
                title="Refresh verification"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {auditError ? (
              <p role="alert" className="text-sm text-rose-600">{auditError}</p>
            ) : auditTrail ? (
              <>
                <div className={`flex items-center gap-2 text-sm font-semibold ${auditTrail.integrity.valid ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
                  {auditTrail.integrity.valid ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  {auditTrail.integrity.valid ? "Chain verified" : `Integrity issue at block ${auditTrail.integrity.brokenAt}`}
                </div>
                <p className="text-xs text-slate-500">{auditTrail.integrity.checkedBlocks} blocks checked. This hash chain is stored in this app's database; it is not a decentralized public blockchain.</p>
                <div className="max-h-80 space-y-3 overflow-y-auto border-t border-slate-200 pt-3 dark:border-slate-700">
                  {(auditTrail.blocks || []).map((block) => (
                    <div key={block._id} className="border-l-2 border-teal-700 pl-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold">#{block.sequence} · {block.action?.replaceAll("_", " ").toLowerCase()}</p>
                        <time className="text-xs text-slate-500" dateTime={block.blockTimestamp}>
                          {format(new Date(block.blockTimestamp), "dd MMM yyyy, HH:mm")}
                        </time>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{block.userId?.name || "Unknown user"}</p>
                      <p className="mt-1 break-all font-mono text-[10px] text-slate-500" title={block.blockHash}>Hash: {block.blockHash?.slice(0, 20)}...</p>
                      <p className="break-all font-mono text-[10px] text-slate-400" title={block.previousHash}>Previous: {block.previousHash?.slice(0, 20)}...</p>
                    </div>
                  ))}
                  {!auditTrail.blocks?.length && <p className="text-xs text-slate-500">No blockchain audit blocks exist for this inspection yet.</p>}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Verifying audit chain...</p>
            )}
          </div>

          {/* Map */}
          {coords && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-600" />
                <h2 className="font-semibold">{t.location}</h2>
              </div>
              <div className="h-48 rounded-lg overflow-hidden">
                <MapContainer
                  center={coords}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={coords} />
                </MapContainer>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-950/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged inspection photo"
          onClick={() => setSelectedPhoto(null)}
          onWheel={(event) => {
            event.preventDefault();
            adjustPhotoZoom(event.deltaY < 0 ? 0.25 : -0.25);
          }}
        >
          <div
            className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-900/80 p-1.5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => adjustPhotoZoom(-0.25)}
              disabled={photoZoom <= 1}
              className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-12 text-center text-sm tabular-nums">
              {Math.round(photoZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => adjustPhotoZoom(0.25)}
              disabled={photoZoom >= 4}
              className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close enlarged photo"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="Enlarged inspection site"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-150"
            style={{ transform: `scale(${photoZoom})` }}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
