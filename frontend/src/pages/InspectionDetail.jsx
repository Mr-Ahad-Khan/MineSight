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
  Shield,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Upload,
  Camera,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  deleteInspection,
  deleteInspectionPhoto,
  getInspection,
  updateInspection,
  closeViolation,
  getMediaUrl,
  getInspectionAuditHistory,
} from "../services/api";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "../utils/leafletAssets";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadOrExportFile } from "../utils/fileDownloader";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import CameraCaptureModal from "../components/common/CameraCaptureModal";
import RiskAnalysisModal from "../components/common/RiskAnalysisModal";
import { detectPhotoRisk } from "../services/riskDetectionService";
import { compressImage } from "../utils/imageCompressor";

const safeFormatDate = (dateVal, formatStr = "dd MMM yyyy, HH:mm") => {
  if (!dateVal) return "—";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "—";
    return format(d, formatStr);
  } catch {
    return "—";
  }
};

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
  const [proofUploading, setProofUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraForClosure, setCameraForClosure] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [currentRiskData, setCurrentRiskData] = useState(null);
  const [currentRiskPhoto, setCurrentRiskPhoto] = useState(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [auditTrail, setAuditTrail] = useState(null);
  const [auditError, setAuditError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    severity: "medium",
    type: "safety",
    description: "",
    observations: "",
  });
  const [deletingPhoto, setDeletingPhoto] = useState(null);
  const proofInputRef = useRef(null);

  useEffect(() => {
    const handleBackButton = (e) => {
      if (selectedPhoto) {
        e.preventDefault();
        setSelectedPhoto(null);
        return;
      }
      if (isCameraOpen) {
        e.preventDefault();
        setIsCameraOpen(false);
        return;
      }
      if (riskModalOpen) {
        e.preventDefault();
        setRiskModalOpen(false);
        return;
      }
      if (isEditing) {
        e.preventDefault();
        setIsEditing(false);
        return;
      }
    };
    window.addEventListener("minesight:back-button", handleBackButton);
    return () => window.removeEventListener("minesight:back-button", handleBackButton);
  }, [selectedPhoto, isCameraOpen, riskModalOpen, isEditing]);

  const handleOpenEdit = () => {
    setEditForm({
      title: inspection?.title || "",
      severity: inspection?.severity || "medium",
      type: inspection?.type || "safety",
      description: inspection?.description || "",
      observations: inspection?.observations || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const previousInspection = inspection;
    const updatedData = { ...inspection, ...editForm };

    // Instant UI feedback - 0ms
    setInspection(updatedData);
    setIsEditing(false);
    toast.success(t.inspectionUpdated || "Inspection updated successfully");

    try {
      const res = await updateInspection(id, editForm);
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      fetchAuditTrail().catch(() => {});
    } catch (error) {
      setInspection(previousInspection);
      toast.error(t.failedUpdate || "Failed to update inspection");
    }
  };

  const adjustPhotoZoom = (amount) => {
    setPhotoZoom((current) => Math.min(4, Math.max(1, current + amount)));
  };

  useEffect(() => {
    fetchInspection();
    fetchAuditTrail().catch(() => {});
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
      setAuditError(
        error.response?.data?.message || "Could not verify the audit chain.",
      );
    }
  };

  const handleStatusChange = async (status) => {
    const previousInspection = inspection;
    const optimisticClosedAt = status === "closed" ? new Date().toISOString() : null;

    // Instant UI feedback - 0ms
    setInspection((prev) => ({
      ...prev,
      status,
      closedAt: optimisticClosedAt,
      _pendingSync: true,
    }));
    toast.success(`${t.statusUpdated || "Status updated to"} ${status}`);

    try {
      const res = await updateInspection(id, {
        status,
        ...(status === "open" ? { closedAt: null } : {}),
      });
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      fetchAuditTrail().catch(() => {});
    } catch (error) {
      setInspection(previousInspection);
      toast.error(t.failedUpdate || "Failed to update inspection");
    }
  };

  const handleUploadPhotos = async (event, shouldClose = false) => {
    const rawFiles = Array.from(event.target.files || []).slice(0, 5);
    event.target.value = "";
    if (!rawFiles.length) return;

    setProofUploading(true);
    const tempPreviews = rawFiles.map((file) => URL.createObjectURL(file));
    const previousInspection = inspection;

    // Instant UI feedback - 0ms
    setInspection((prev) => ({
      ...prev,
      status: shouldClose ? "closed" : prev.status,
      closedAt: shouldClose ? new Date().toISOString() : prev.closedAt,
      closurePhotos: shouldClose ? [...(prev.closurePhotos || []), ...tempPreviews] : prev.closurePhotos,
      photos: !shouldClose ? [...(prev.photos || []), ...tempPreviews] : prev.photos,
      proofVerified: shouldClose ? true : prev.proofVerified,
    }));
    toast.success(shouldClose ? "Closure proof registered!" : "Photo proof attached!");

    try {
      const files = await Promise.all(
        rawFiles.map((file) => compressImage(file))
      );
      const payload = new FormData();
      if (shouldClose || inspection.status === "closed") {
        payload.append("status", "closed");
      }
      payload.append("isClosureProof", "true");
      files.forEach((file) => payload.append("photos", file));

      const res = await updateInspection(id, payload);
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      fetchAuditTrail().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || t.failedUpdate);
    } finally {
      setProofUploading(false);
    }
  };

  const handlePhotoCaptured = async (file, previewUrl, initialRisk) => {
    setProofUploading(true);
    const tempUrl = previewUrl || (file instanceof Blob ? URL.createObjectURL(file) : null);
    const shouldClose = Boolean(cameraForClosure || inspection.status === "closed");

    // Instant UI feedback - 0ms
    if (tempUrl) {
      setInspection((prev) => ({
        ...prev,
        status: shouldClose ? "closed" : prev.status,
        closedAt: shouldClose ? new Date().toISOString() : prev.closedAt,
        closurePhotos: shouldClose ? [...(prev.closurePhotos || []), tempUrl] : prev.closurePhotos,
        photos: !shouldClose ? [...(prev.photos || []), tempUrl] : prev.photos,
        proofVerified: shouldClose ? true : prev.proofVerified,
      }));
    }

    toast.success(
      cameraForClosure
        ? "Inspection closed with photo proof!"
        : "Photo captured and attached successfully"
    );

    if (initialRisk) {
      setCurrentRiskData(initialRisk);
      setCurrentRiskPhoto(previewUrl);
      setRiskModalOpen(true);
    }

    try {
      const payload = new FormData();
      if (shouldClose) {
        payload.append("status", "closed");
      }
      payload.append("isClosureProof", "true");
      payload.append("photos", file);

      const res = await updateInspection(id, payload);
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      fetchAuditTrail().catch(() => {});
    } catch (error) {
      toast.error(error.response?.data?.message || t.failedUpdate);
    } finally {
      setProofUploading(false);
    }
  };

  const handleDeletePhoto = async (photoUrl, type = "photo") => {
    if (!photoUrl) return;
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    setDeletingPhoto(photoUrl);
    const toastId = toast.loading("Deleting photo...");

    const previousInspection = inspection;
    const cleanTarget = String(photoUrl).replace(/^https?:\/\/[^\/]+/, "").split("?")[0];
    const matchPhoto = (p) => {
      if (!p) return false;
      const cleanP = String(p).replace(/^https?:\/\/[^\/]+/, "").split("?")[0];
      return cleanP === cleanTarget || String(p) === String(photoUrl);
    };

    setInspection((prev) => {
      if (!prev) return prev;
      if (type === "closurePhoto") {
        const updated = (prev.closurePhotos || []).filter((p) => !matchPhoto(p));
        return { ...prev, closurePhotos: updated, proofVerified: updated.length > 0 };
      }
      return { ...prev, photos: (prev.photos || []).filter((p) => !matchPhoto(p)) };
    });

    if (selectedPhoto && matchPhoto(selectedPhoto)) {
      setSelectedPhoto(null);
    }

    try {
      const res = await deleteInspectionPhoto(id, photoUrl, type);
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      toast.success("Photo deleted successfully", { id: toastId });
      fetchAuditTrail().catch(() => {});
    } catch (err) {
      setInspection(previousInspection);
      toast.error(err.response?.data?.message || "Failed to delete photo", { id: toastId });
    } finally {
      setDeletingPhoto(null);
    }
  };

  const handleDetectPhotoRisk = async (photoUrl) => {
    setIsAnalyzingRisk(true);
    const toastId = toast.loading("Analyzing photo for safety hazards...");
    try {
      const result = await detectPhotoRisk(photoUrl, {
        mineId: inspection.mineId?._id || inspection.mineId,
        title: inspection.title,
        description: inspection.description,
        observations: inspection.observations,
        severity: inspection.severity,
      });

      setCurrentRiskData(result);
      setCurrentRiskPhoto(photoUrl);
      setRiskModalOpen(true);
      toast.dismiss(toastId);
      toast.success(
        `${result.source === "online_ai" ? "Cloud AI" : "Edge AI (Offline)"} Risk: ${result.riskScore}/100 (${result.riskLevel})`
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to analyze risk for this photo");
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  const handleCloseViolation = async (violationId) => {
    const previousInspection = inspection;
    // Instant UI feedback - 0ms
    setInspection((prev) => ({
      ...prev,
      violations: (prev.violations || []).map((v) =>
        v._id === violationId ? { ...v, status: "closed", closedAt: new Date().toISOString() } : v
      ),
    }));
    toast.success(t.violationClosed || "Violation marked as closed");

    try {
      const res = await closeViolation(id, violationId);
      if (res?.data?.data) {
        setInspection(res.data.data);
      }
      fetchAuditTrail().catch(() => {});
    } catch (error) {
      setInspection(previousInspection);
      toast.error(t.failedClose);
    }
  };

  const exportInspectionPdf = async () => {
    if (!inspection) return;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("MineSight - Inspection Safety Audit Report", 36, 44);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(
        `Generated: ${new Date().toLocaleString()} | ID: ${inspection._id || id}`,
        36,
        60
      );

      const mineName =
        inspection.mineId?.name || inspection.mineId?.code || "N/A";
      const inspectorName =
        inspection.inspectorId?.name || "Field Officer";

      const overviewRows = [
        ["Title", inspection.title || "Untitled"],
        ["Mine Site", mineName],
        ["Type", (inspection.type || "scheduled").toUpperCase()],
        ["Severity", (inspection.severity || "medium").toUpperCase()],
        ["Status", (inspection.status || "open").replace("_", " ").toUpperCase()],
        ["Risk Score", String(inspection.riskScore ?? "—")],
        ["Inspector", inspectorName],
        ["Created Date", safeFormatDate(inspection.createdAt)],
      ];

      autoTable(pdf, {
        head: [["Attribute", "Details"]],
        body: overviewRows,
        startY: 75,
        margin: { left: 36, right: 36 },
        styles: { font: "helvetica", fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [13, 63, 109] },
        columnStyles: { 0: { cellWidth: 140, fontStyle: "bold" }, 1: { cellWidth: 380 } },
      });

      let nextY = pdf.lastAutoTable.finalY + 20;

      if (inspection.description) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Description", 36, nextY);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const splitDesc = pdf.splitTextToSize(inspection.description, 520);
        pdf.text(splitDesc, 36, nextY + 14);
        nextY += 20 + splitDesc.length * 10;
      }

      if (inspection.observations) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Field Observations", 36, nextY);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        const splitObs = pdf.splitTextToSize(inspection.observations, 520);
        pdf.text(splitObs, 36, nextY + 14);
        nextY += 20 + splitObs.length * 10;
      }

      if (Array.isArray(inspection.violations) && inspection.violations.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("Violations Recorded", 36, nextY);
        autoTable(pdf, {
          head: [["Category", "Severity", "Description", "Corrective Action"]],
          body: inspection.violations.map((v) => [
            String(v.category || "General"),
            String(v.severity || "medium").toUpperCase(),
            String(v.description || "—"),
            String(v.correctiveAction || "None specified"),
          ]),
          startY: nextY + 8,
          margin: { left: 36, right: 36 },
          styles: { font: "helvetica", fontSize: 8, cellPadding: 4, overflow: "linebreak" },
          headStyles: { fillColor: [180, 40, 40] },
        });
      }

      const pdfBlob = pdf.output("blob");
      const fileName = `inspection-${inspection._id || id || Date.now()}.pdf`;
      const ok = await downloadOrExportFile(pdfBlob, fileName, "application/pdf");
      if (ok) {
        toast.success(
          language === "hi"
            ? "निरीक्षण PDF रिपोर्ट डाउनलोड हो गई!"
            : "Inspection PDF report downloaded!"
        );
      }
    } catch (err) {
      console.error("Single inspection PDF error:", err);
      toast.error(
        language === "hi"
          ? "पीडीएफ रिपोर्ट तैयार करने में असमर्थ"
          : "Unable to generate the PDF report"
      );
    }
  };

  const handleDeleteInspection = async () => {
    const confirmMsg =
      t.deleteInspectionConfirm ||
      (language === "hi"
        ? "क्या आप वाकई इस निरीक्षण को हटाना चाहते हैं?"
        : "Are you sure you want to delete this inspection?");
    if (!window.confirm(confirmMsg)) return;

    // Instant UI feedback
    toast.success(
      t.inspectionDeletedSuccess ||
        (language === "hi"
          ? "निरीक्षण सफलतापूर्वक हटा दिया गया"
          : "Inspection deleted successfully")
    );
    navigate("/app/inspections");

    try {
      await deleteInspection(id);
    } catch (error) {
      console.warn("Delete inspection error:", error);
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
  const closureProofPhotos = Array.isArray(inspection.closurePhotos)
    ? inspection.closurePhotos
    : [];
  const hasProof = Boolean(
    inspection.proofVerified || closureProofPhotos.length > 0
  );
  const proofCount = closureProofPhotos.length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-36 sm:pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => navigate("/app/inspections")}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mt-1"
          aria-label="Back to inspection table"
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
            {inspection.mineId?.name || (typeof inspection.mineId === "string" ? inspection.mineId : "Selected Mine")} •{" "}
            {safeFormatDate(inspection.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`text-center px-4 py-2 rounded-lg ${
              inspection.riskScore >= 80
                ? "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-100"
                : inspection.riskScore >= 60
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-100"
                  : inspection.riskScore >= 35
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-100"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide">{t.riskScore}</p>
            <p className="text-2xl font-extrabold tabular-nums">{inspection.riskScore}</p>
          </div>
        </div>
      </div>

      {/* Mobile Actions Strip (instantly accessible on mobile without scrolling) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 lg:hidden shadow-xs">
        {inspection.status !== "closed" && (
          <>
            <button
              type="button"
              onClick={() => handleStatusChange("closed")}
              className="btn-primary flex-1 min-h-[44px] py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 transition-transform"
            >
              <CheckCircle className="w-4 h-4" />
              {t.closeInspection || "Close Inspection"}
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange("escalated")}
              className="btn-secondary flex-1 min-h-[44px] py-2 px-3 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 transition-transform"
            >
              <ShieldAlert className="w-4 h-4" />
              {t.escalate || "Escalate"}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleOpenEdit}
          className="btn-secondary min-h-[44px] py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 transition-transform"
        >
          <FileText className="w-4 h-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => proofInputRef.current?.click()}
          title="Upload image and close inspection"
          className="btn-secondary min-h-[44px] py-2 px-3 text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 transition-transform"
        >
          {proofUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload Proof & Close
        </button>
        <button
          type="button"
          onClick={() => {
            setCameraForClosure(false);
            setIsCameraOpen(true);
          }}
          className="btn-secondary min-h-[44px] py-2 px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 transition-transform"
        >
          <Camera className="w-4 h-4" />
          Capture
        </button>
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

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-500 text-sm font-medium">
                  Site Photos {inspection.photos?.length > 0 && `(${inspection.photos.length})`}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraForClosure(false);
                      setIsCameraOpen(true);
                    }}
                    disabled={updating || proofUploading}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                  >
                    <Camera className="h-3.5 w-3.5" /> Capture photo
                  </button>
                  <button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    disabled={updating || proofUploading}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload photo
                  </button>
                </div>
              </div>
              {inspection.photos?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {inspection.photos.map((photo, index) => {
                    const photoSrc = getMediaUrl(photo);
                    return (
                      <div
                        key={`${photo}-${index}`}
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 relative aspect-video"
                      >
                        <img
                          src={photoSrc}
                          alt={`Inspection site ${index + 1}`}
                          className="h-full w-full object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                          onClick={() => {
                            setSelectedPhoto(photoSrc);
                            setPhotoZoom(1);
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            const fallback = event.currentTarget.nextElementSibling;
                            if (fallback) fallback.style.display = "flex";
                          }}
                        />
                        <div
                          style={{ display: "none" }}
                          className="h-full w-full flex flex-col items-center justify-center p-2 text-center text-xs text-slate-400 bg-slate-100 dark:bg-slate-800"
                        >
                          <FileText className="w-5 h-5 mb-1 text-slate-400" />
                          Photo {index + 1}
                        </div>

                        {/* Top Right Action: Delete Photo */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(photo, "photo");
                          }}
                          disabled={deletingPhoto === photo || deletingPhoto === photoSrc}
                          title="Delete photo"
                          aria-label="Delete photo"
                          className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/90 text-white backdrop-blur-xs transition hover:bg-rose-700 active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
                        >
                          {deletingPhoto === photo || deletingPhoto === photoSrc ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Detect Risk Button on Photo */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetectPhotoRisk(photoSrc);
                          }}
                          disabled={isAnalyzingRisk || deletingPhoto === photo || deletingPhoto === photoSrc}
                          title="Run AI Hazard Risk Detection on this photo"
                          className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 backdrop-blur-xs hover:bg-black transition flex items-center gap-1 shadow"
                        >
                          <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                          Risk Check
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No site photos attached yet.</p>
              )}
            </div>
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
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {t.actions}
            </h2>
            {inspection.status !== "closed" && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={inspection.status === "in_progress"}
                  className="btn-secondary w-full text-sm font-semibold touch-manipulation cursor-pointer active:scale-98 transition-transform"
                >
                  {t.markInProgress}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("escalated")}
                  className="btn-secondary w-full text-sm font-semibold text-orange-600 dark:text-orange-400 touch-manipulation cursor-pointer active:scale-98 transition-transform"
                >
                  {t.escalate}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("closed")}
                  className="btn-primary w-full text-sm font-bold touch-manipulation cursor-pointer active:scale-98 transition-transform"
                >
                  {t.closeInspection}
                </button>
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadPhotos(e, true)}
                />
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="btn-secondary w-full text-sm font-semibold flex items-center justify-center gap-1.5 touch-manipulation cursor-pointer active:scale-98 transition-transform"
                >
                  <FileText className="w-4 h-4" />
                  Edit Inspection
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraForClosure(true);
                      setIsCameraOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200 touch-manipulation cursor-pointer active:scale-95"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Capture Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    disabled={proofUploading}
                    title="Upload proof image and automatically close this inspection"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-2.5 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100 disabled:opacity-60 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200 touch-manipulation cursor-pointer active:scale-95"
                  >
                    {proofUploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    Upload Image & Close Inspection
                  </button>
                </div>
              </>
            )}
            {inspection.status === "closed" && (
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-4 w-4" /> {t.inspectionClosed}
                </p>
                {hasProof ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4" /> Proof verified ({proofCount} photo{proofCount !== 1 ? "s" : ""})
                    </p>
                    {closureProofPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {closureProofPhotos.map((photo, idx) => {
                          const url = getMediaUrl(photo);
                          const isDeleting =
                            deletingPhoto === photo || deletingPhoto === url;
                          return (
                            <div
                              key={`closure-${photo}-${idx}`}
                              className="group relative aspect-video overflow-hidden rounded-md border border-emerald-300 bg-slate-100 dark:border-emerald-700 dark:bg-slate-800 shadow-xs"
                            >
                              <img
                                src={url}
                                alt={`Closure proof ${idx + 1}`}
                                className="h-full w-full object-cover cursor-zoom-in transition-transform duration-200 group-hover:scale-105"
                                onClick={() => {
                                  setSelectedPhoto(url);
                                  setPhotoZoom(1);
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePhoto(photo, "closurePhoto");
                                }}
                                disabled={isDeleting}
                                title="Delete proof photo"
                                aria-label="Delete proof photo"
                                className="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded bg-rose-600/90 text-white transition hover:bg-rose-700 active:scale-95 shadow cursor-pointer disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    No photo proof attached
                  </p>
                )}
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadPhotos(e, false)}
                />
                <button
                  type="button"
                  onClick={() => proofInputRef.current?.click()}
                  disabled={updating || proofUploading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-teal-300 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100 disabled:opacity-60 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-900/50"
                >
                  {proofUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {proofUploading
                    ? "Uploading proof..."
                    : hasProof
                      ? "Add more photo proof"
                      : "Upload photo proof"}
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("open")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 touch-manipulation cursor-pointer active:scale-98"
                >
                  <RefreshCw className="h-4 w-4" /> Reopen inspection
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={exportInspectionPdf}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#bca98e] bg-[#f8f4ed] px-3 py-2.5 text-sm font-semibold text-[#1f1f1f] shadow-xs hover:bg-[#ece2d0] transition touch-manipulation cursor-pointer active:scale-98"
            >
              <FileText className="h-4 w-4 text-[#0d3f6d]" />
              {language === "hi" ? "PDF रिपोर्ट डाउनलोड करें" : "Download PDF Report"}
            </button>

            <button
              type="button"
              onClick={handleDeleteInspection}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/70 touch-manipulation cursor-pointer active:scale-98"
            >
              <Trash2 className="h-4 w-4" />
              {language === "hi" ? "निरीक्षण हटाएं" : "Delete Inspection"}
            </button>
          </div>

          <div className="card space-y-3 p-5 text-slate-700 dark:text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Blockchain audit trail
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  SHA-256 hash-linked inspection changes
                </p>
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
              <p role="alert" className="text-sm text-rose-600">
                {auditError}
              </p>
            ) : auditTrail ? (
              <>
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${auditTrail?.integrity?.valid ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
                >
                  {auditTrail?.integrity?.valid ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                  {auditTrail?.integrity?.valid
                    ? "Chain verified"
                    : `Integrity issue at block ${auditTrail?.integrity?.brokenAt ?? "unknown"}`}
                </div>
                <p className="text-xs text-slate-500">
                  {auditTrail?.integrity?.checkedBlocks ?? 1} blocks checked. This hash
                  chain is stored in this app's database; it is not a
                  decentralized public blockchain.
                </p>
                <div className="max-h-80 space-y-3 overflow-y-auto border-t border-slate-200 pt-3 dark:border-slate-700">
                  {(auditTrail?.blocks || []).map((block) => (
                    <div
                      key={block._id}
                      className="border-l-2 border-teal-700 pl-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold">
                          #{block.sequence} ·{" "}
                          {block.action?.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <time
                          className="text-xs text-slate-500"
                          dateTime={block.blockTimestamp}
                        >
                          {safeFormatDate(block.blockTimestamp)}
                        </time>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {block.userId?.name || "Unknown user"}
                      </p>
                      <p
                        className="mt-1 break-all font-mono text-[10px] text-slate-500"
                        title={block.blockHash}
                      >
                        Hash: {block.blockHash?.slice(0, 20)}...
                      </p>
                      <p
                        className="break-all font-mono text-[10px] text-slate-400"
                        title={block.previousHash}
                      >
                        Previous: {block.previousHash?.slice(0, 20)}...
                      </p>
                    </div>
                  ))}
                  {!auditTrail.blocks?.length && (
                    <p className="text-xs text-slate-500">
                      No blockchain audit blocks exist for this inspection yet.
                    </p>
                  )}
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
            {inspection.status !== "closed" && (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  await handleStatusChange("closed");
                  setSelectedPhoto(null);
                }}
                className="ml-2 flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition"
                title="Mark this inspection as closed"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Close Inspection
              </button>
            )}
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                const isClosure = (inspection.closurePhotos || []).some((p) => {
                  const u = getMediaUrl(p);
                  return u === selectedPhoto || p === selectedPhoto;
                });
                await handleDeletePhoto(
                  selectedPhoto,
                  isClosure ? "closurePhoto" : "photo"
                );
              }}
              disabled={deletingPhoto === selectedPhoto}
              className="ml-2 flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
              title="Delete this photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Photo
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

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handlePhotoCaptured}
        inspectionContext={{
          mineId: inspection?.mineId?._id || inspection?.mineId,
          title: inspection?.title,
          description: inspection?.description,
          observations: inspection?.observations,
          severity: inspection?.severity,
        }}
      />

      {/* AI Risk Analysis Modal */}
      <RiskAnalysisModal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        riskData={currentRiskData}
        photoPreview={currentRiskPhoto}
      />

      {/* Edit Inspection Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Edit Inspection
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="label" htmlFor="edit-title">
                  Inspection Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="edit-type">
                    Type
                  </label>
                  <select
                    id="edit-type"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="safety">Safety</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="unannounced">Unannounced</option>
                    <option value="environment">Environment</option>
                    <option value="machinery">Machinery</option>
                  </select>
                </div>

                <div>
                  <label className="label" htmlFor="edit-severity">
                    Severity
                  </label>
                  <select
                    id="edit-severity"
                    value={editForm.severity}
                    onChange={(e) => setEditForm({ ...editForm, severity: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="input-field resize-y"
                  placeholder="Inspection description..."
                />
              </div>

              <div>
                <label className="label" htmlFor="edit-observations">
                  Observations
                </label>
                <textarea
                  id="edit-observations"
                  rows={3}
                  value={editForm.observations}
                  onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                  className="input-field resize-y"
                  placeholder="Key field observations..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary px-5 py-2 text-sm font-bold flex items-center gap-2"
                >
                  {updating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
