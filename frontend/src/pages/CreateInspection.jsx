import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Loader2,
  Plus,
  Trash2,
  Mic,
  Volume2,
  VolumeX,
  Square,
  Upload,
  FileText,
  ArrowRight,
  X,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  Search,
  Camera,
  Sparkles,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Compass,
  Navigation,
  Eye,
  EyeOff,
  WifiOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { createInspection, getMines } from "../services/api";
import { initialMines } from "../services/offlineStorage";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "../utils/leafletAssets";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import { compressImage } from "../utils/imageCompressor";
import CameraCaptureModal from "../components/common/CameraCaptureModal";
import RiskAnalysisModal from "../components/common/RiskAnalysisModal";
import { detectPhotoRisk, detectBatchRisk } from "../services/riskDetectionService";
import { speakText, stopSpeaking } from "../utils/speechUtils";

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position?.every(Number.isFinite)) {
      map.flyTo(position, Math.max(map.getZoom(), 13), { duration: 0.65 });
    }
  }, [map, position]);

  return null;
}

function VoiceTextField({
  id,
  value,
  onChange,
  placeholder,
  className = "input-field",
  multiline = false,
  rows = 3,
  voiceEnabled,
  language,
  ...props
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);
  const supportsRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(
    () => () => recognitionRef.current?.stop(),
    [],
  );

  const speakInstructions = () => {
    if (!voiceEnabled) return;
    const text = language === "hi"
      ? `${props["aria-label"] || placeholder || "यह फ़ील्ड"} संपादित कर रहे हैं। आप टाइप कर सकते हैं या माइक से बोल सकते हैं।`
      : `You are editing ${props["aria-label"] || placeholder || "this field"}. You can type or select the microphone to dictate.`;
    speakText(text, language === "hi" ? "hi-IN" : "en-IN");
  };

  const toggleListening = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!supportsRecognition) return;
    const startRecognition = async () => {
      let permissionStream;
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Microphone access is not supported");
        }
        permissionStream = await navigator.mediaDevices?.getUserMedia({
          audio: true,
        });
        permissionStream?.getTracks().forEach((track) => track.stop());

        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0]?.transcript || "")
            .join(" ")
            .trim();
          if (transcript) {
            const separator = valueRef.current.trim() ? " " : "";
            onChange({ target: { value: `${valueRef.current}${separator}${transcript}` } });
          }
        };
        recognition.onend = () => {
          recognitionRef.current = null;
          setListening(false);
        };
        recognition.onerror = () => {
          recognitionRef.current = null;
          setListening(false);
        };
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
      } catch (error) {
        permissionStream?.getTracks().forEach((track) => track.stop());
        console.error(error);
        toast.error("Allow microphone access in your browser settings to use voice typing");
      }
    };

    startRecognition();
  };

  const fieldProps = {
    id,
    value,
    placeholder,
    onChange,
    onFocus: speakInstructions,
    className: `${className} min-h-[44px] text-base sm:text-sm ${supportsRecognition ? "pr-12" : ""}`,
    ...props,
  };

  return (
    <div className="relative w-full">
      {multiline ? <textarea {...fieldProps} rows={rows} /> : <input {...fieldProps} />}
      {supportsRecognition && (
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg transition touch-manipulation ${
            listening
              ? "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300"
              : "text-slate-400 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-800"
          }`}
          aria-label={listening ? "Stop voice typing" : "Start voice typing"}
          title={listening ? "Stop voice typing" : "Start voice typing"}
        >
          <Mic className={`h-4 w-4 ${listening ? "animate-pulse text-red-600" : ""}`} />
        </button>
      )}
    </div>
  );
}

export default function CreateInspection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [isOffline, setIsOffline] = useState(() => (
    typeof navigator !== "undefined" ? !navigator.onLine : false
  ));
  const [mines, setMines] = useState(initialMines);
  const [mineSearchFilter, setMineSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(() => [
    initialMines[0]?.location?.coordinates?.[1] || 24.12,
    initialMines[0]?.location?.coordinates?.[0] || 82.45,
  ]);
  const [manualCoords, setManualCoords] = useState({
    lat: (initialMines[0]?.location?.coordinates?.[1] || 24.12).toFixed(5),
    lng: (initialMines[0]?.location?.coordinates?.[0] || 82.45).toFixed(5),
  });

  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [currentRiskData, setCurrentRiskData] = useState(null);
  const [currentRiskPhoto, setCurrentRiskPhoto] = useState(null);
  const [photoRisks, setPhotoRisks] = useState({});
  const [isDetectingRisk, setIsDetectingRisk] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const adjustPreviewZoom = (amount) => {
    setPreviewZoom((current) => Math.min(4, Math.max(1, current + amount)));
  };

  const [form, setForm] = useState({
    mineId: initialMines[0]?._id || "mine_001",
    type: "scheduled",
    title: "",
    description: "",
    observations: "",
    severity: "medium",
    violations: [],
  });

  const [violation, setViolation] = useState({
    description: "",
    category: "safety",
    severity: "medium",
    correctiveAction: "",
  });

  const DRAFT_KEY = "minesight_create_inspection_draft";
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  // Sync online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle mobile hardware back button for active modals / full preview
  useEffect(() => {
    const handleBackButton = (e) => {
      if (selectedPreview) {
        e.preventDefault();
        setSelectedPreview(null);
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
      if (showMobilePreview) {
        e.preventDefault();
        setShowMobilePreview(false);
        return;
      }
    };
    window.addEventListener("minesight:back-button", handleBackButton);
    return () => window.removeEventListener("minesight:back-button", handleBackButton);
  }, [selectedPreview, isCameraOpen, riskModalOpen, showMobilePreview]);

  // Sync coordinates to manual input fields
  useEffect(() => {
    if (Array.isArray(position) && position.length >= 2 && position.every(Number.isFinite)) {
      setManualCoords({
        lat: Number(position[0]).toFixed(5),
        lng: Number(position[1]).toFixed(5),
      });
    }
  }, [position]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(DRAFT_KEY) || sessionStorage.getItem(DRAFT_KEY);
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed.form) {
          setForm((prev) => ({ ...prev, ...parsed.form }));
        }
        if (Array.isArray(parsed.position) && parsed.position.length >= 2) {
          setPosition(parsed.position);
        }
        if (parsed.violation) {
          setViolation((prev) => ({ ...prev, ...parsed.violation }));
        }
        setHasRestoredDraft(true);
        toast("Restored draft inspection (form data preserved)", {
          id: "draft-restored",
          icon: "📝",
        });
      }
    } catch (e) {
      console.warn("Failed to restore inspection draft:", e);
    }
  }, []);

  // Save draft whenever form values change
  useEffect(() => {
    const hasData = form.title || form.description || form.observations || form.violations?.length > 0;
    if (hasData) {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, position, violation }));
      } catch (e) {
        console.warn("Failed to save inspection draft:", e);
      }
    }
  }, [form, position, violation]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(DRAFT_KEY);
      setForm({
        mineId: mines[0]?._id || "mine_001",
        type: "scheduled",
        title: "",
        description: "",
        observations: "",
        severity: "medium",
        violations: [],
      });
      setHasRestoredDraft(false);
      toast.success("Draft cleared");
    } catch {
      // ignore
    }
  };

  // Fetch mines with fallback
  useEffect(() => {
    getMines()
      .then((res) => {
        const list = res.data?.data || [];
        if (list.length > 0) {
          setMines(list);
          setForm((prev) => {
            if (!prev.mineId) {
              return { ...prev, mineId: list[0]._id };
            }
            return prev;
          });
        }
      })
      .catch(() => {
        // initialMines already populated as initial state
      });

    // Try get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Auto-attach photo and hazard detections if navigated from direct camera scan
  useEffect(() => {
    const scanned = location.state?.scannedPhoto || window.__pendingScannedPhoto;
    if (scanned) {
      if (window.__pendingScannedPhoto) delete window.__pendingScannedPhoto;
      const { file, previewUrl, initialRisk } = scanned;
      if (file && previewUrl) {
        handlePhotoCaptured(file, previewUrl, initialRisk);
        if (initialRisk) {
          setForm((prev) => ({
            ...prev,
            severity: initialRisk.riskLevel || prev.severity,
            observations: initialRisk.observations
              ? initialRisk.observations
              : initialRisk.hazards?.[0]
              ? `Safety Scan Observation: ${initialRisk.hazards[0].label} detected (${initialRisk.riskScore}/100)`
              : prev.observations,
          }));
        }
        toast.success("Scanned photo and safety hazards attached!", { id: "scanned-photo-applied" });
      }
      try {
        window.history.replaceState({}, document.title);
      } catch {
        // ignore
      }
    }
  }, [location.state]);

  const handleMineChange = (mineId) => {
    setForm((prev) => ({ ...prev, mineId }));
    const mine = mines.find((item) => item._id === mineId);
    const coordinates = mine?.location?.coordinates;
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      coordinates.every(Number.isFinite)
    ) {
      setPosition([coordinates[1], coordinates[0]]);
    }
  };

  const handleGetCurrentLocation = (e) => {
    if (e) e.preventDefault();
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your device");
      return;
    }
    const toastId = toast.loading("Acquiring GPS coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        toast.dismiss(toastId);
        toast.success("GPS Location acquired successfully!");
      },
      () => {
        toast.dismiss(toastId);
        toast.error("Unable to retrieve GPS. You can enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleResetToMineCoords = (e) => {
    if (e) e.preventDefault();
    const mine = mines.find((item) => item._id === form.mineId);
    const coordinates = mine?.location?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      setPosition([coordinates[1], coordinates[0]]);
      toast.success(`Coordinates set to ${mine.name}`);
    }
  };

  const handleManualCoordChange = (type, val) => {
    const num = parseFloat(val);
    setManualCoords((prev) => ({ ...prev, [type]: val }));
    if (!isNaN(num)) {
      if (type === "lat") {
        setPosition(([_, lng]) => [num, lng]);
      } else {
        setPosition(([lat, _]) => [lat, num]);
      }
    }
  };

  const addViolation = (e) => {
    if (e) e.preventDefault();
    if (!violation.description.trim()) {
      return toast.error(t.violationDescriptionRequired || "Violation description required");
    }
    setForm({
      ...form,
      violations: [...form.violations, { ...violation }],
    });
    setViolation({
      description: "",
      category: "safety",
      severity: "medium",
      correctiveAction: "",
    });
    toast.success("Violation added to report");
  };

  const removeViolation = (index) => {
    setForm({
      ...form,
      violations: form.violations.filter((_, i) => i !== index),
    });
  };

  const startVoiceRecording = async (e) => {
    if (e) e.preventDefault();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Microphone access is not supported in this browser");
        return;
      }
      if (typeof MediaRecorder === "undefined") {
        toast.error("Voice recording is not supported in this browser");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        if (!chunksRef.current.length) {
          setAudioBlob(null);
          setAudioUrl("");
          toast.error("No audio captured. Please try again.");
          return;
        }

        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        setAudioBlob(recordedBlob);
        const newAudioUrl = URL.createObjectURL(recordedBlob);
        setAudioUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return newAudioUrl;
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      toast.success("Voice recording started");
    } catch (error) {
      console.error(error);
      toast.error("Microphone access denied or unavailable");
    }
  };

  const stopVoiceRecording = (e) => {
    if (e) e.preventDefault();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const removeAudio = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl("");
  };

  const MAX_PHOTOS = 10;
  const handlePhotoChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(0, MAX_PHOTOS - selectedPhotos.length);
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      event.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.info(`Added ${remainingSlots} photo(s). Maximum ${MAX_PHOTOS} photos allowed.`);
    }

    const compressedFiles = await Promise.all(
      filesToAdd.map((file) => compressImage(file))
    );

    const previewUrls = compressedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...previewUrls]);
    setSelectedPhotos((prev) => [...prev, ...compressedFiles]);
    event.target.value = "";
  };

  const handlePhotoCaptured = (file, previewUrl, initialRisk) => {
    if (selectedPhotos.length >= MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }
    setPhotoPreviews((prev) => [...prev, previewUrl]);
    setSelectedPhotos((prev) => [...prev, file]);

    if (initialRisk) {
      setPhotoRisks((prev) => ({ ...prev, [previewUrl]: initialRisk }));
      setCurrentRiskData(initialRisk);
      setCurrentRiskPhoto(previewUrl);
      toast.success(
        `Photo captured! Detected ${initialRisk.riskLevel.toUpperCase()} risk (${initialRisk.riskScore}/100)`
      );
    } else {
      toast.success("Photo captured successfully");
    }
  };

  const handleDetectRisk = async (index) => {
    const photo = selectedPhotos[index];
    const preview = photoPreviews[index];
    if (!photo) return;

    setIsDetectingRisk(true);
    const toastId = toast.loading("Analyzing photo for safety hazards...");
    try {
      const result = await detectPhotoRisk(photo, {
        mineId: form.mineId,
        title: form.title,
        description: form.description,
        observations: form.observations,
        severity: form.severity,
      });

      setPhotoRisks((prev) => ({ ...prev, [preview]: result }));
      setCurrentRiskData(result);
      setCurrentRiskPhoto(preview);
      setRiskModalOpen(true);
      toast.dismiss(toastId);
      toast.success(
        `${result.source === "online_ai" ? "Cloud AI" : "Edge AI (Offline)"} Risk Detected: ${result.riskScore}/100 (${result.riskLevel})`
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Failed to analyze risk for this photo");
    } finally {
      setIsDetectingRisk(false);
    }
  };

  const handleBatchRiskDetection = async () => {
    if (!selectedPhotos.length) {
      toast.error("Please add photos first to detect risk");
      return;
    }

    setIsDetectingRisk(true);
    const toastId = toast.loading("Analyzing all site photos for risk...");
    try {
      const batchResult = await detectBatchRisk(selectedPhotos, {
        mineId: form.mineId,
        title: form.title,
        description: form.description,
        observations: form.observations,
        severity: form.severity,
      });

      if (batchResult) {
        if (batchResult.batchResults) {
          const updated = { ...photoRisks };
          batchResult.batchResults.forEach((res, idx) => {
            if (photoPreviews[idx]) {
              updated[photoPreviews[idx]] = res;
            }
          });
          setPhotoRisks(updated);
        }

        setCurrentRiskData(batchResult);
        setCurrentRiskPhoto(photoPreviews[0]);
        setRiskModalOpen(true);
        toast.dismiss(toastId);
        toast.success(
          `Analysis complete: Composite risk ${batchResult.riskScore}/100 (${batchResult.riskLevel.toUpperCase()})`
        );
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Risk detection failed");
    } finally {
      setIsDetectingRisk(false);
    }
  };

  const applyRiskFindings = (riskData) => {
    if (!riskData) return;

    const updates = {};
    if (riskData.suggestedSeverity) {
      updates.severity = riskData.suggestedSeverity;
    }

    if (riskData.observations) {
      const newObs = form.observations
        ? `${form.observations}\n\n[AI Hazard Scan]: ${riskData.observations}`
        : `[AI Hazard Scan]: ${riskData.observations}`;
      updates.observations = newObs;
    }

    if (riskData.suggestedViolation) {
      const isDuplicate = form.violations.some(
        (v) => v.description === riskData.suggestedViolation.description
      );
      if (!isDuplicate) {
        updates.violations = [...form.violations, { ...riskData.suggestedViolation }];
      }
    }

    setForm((prev) => ({ ...prev, ...updates }));
    toast.success("Risk assessment findings automatically applied to report!");
  };

  const removePhoto = (index) => {
    const urlToRemove = photoPreviews[index];
    setPhotoPreviews((prev) => {
      if (urlToRemove && urlToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (urlToRemove) {
      setPhotoRisks((prev) => {
        const copy = { ...prev };
        delete copy[urlToRemove];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const activeMineId = form.mineId || mines[0]?._id || "mine_001";
    if (!form.title.trim()) {
      return toast.error(t.mineAndTitle || "Please select a mine and enter an inspection title");
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        mineId: activeMineId,
        coordinates: [position[1], position[0]],
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
          return;
        }
        formData.append(key, value);
      });

      formData.set("title", form.title || "");
      formData.set("description", form.description || "");
      formData.set("observations", form.observations || "");

      const detectedRisksList = Object.values(photoRisks);
      if (detectedRisksList.length > 0) {
        const maxScore = Math.max(...detectedRisksList.map((r) => r.riskScore || 0));
        if (maxScore > 0) {
          formData.set("riskScore", maxScore);
        }
      }

      if (audioBlob) {
        const fileName = `inspection-audio-${Date.now()}.webm`;
        formData.append("audio", audioBlob, fileName);
      }

      selectedPhotos.forEach((photo) => {
        formData.append("photos", photo);
      });

      formData.set("offlineId", `insp_offline_${Date.now()}`);

      const res = await createInspection(formData);
      try {
        localStorage.removeItem(DRAFT_KEY);
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      const score = res.data?.data?.riskScore ?? "";
      toast.success(`${t.inspectionCreated || "Inspection created successfully!"} ${score ? `(Score: ${score})` : ""}`);
      navigate("/app/inspections");
    } catch (error) {
      console.error("Failed to create inspection:", error);
      toast.error(error.response?.data?.message || error.message || t.failedToCreate || "Failed to create inspection");
    } finally {
      setLoading(false);
    }
  };

  const selectedMine = mines.find((mine) => mine._id === form.mineId) || mines[0];

  const filteredMines = mines.filter((m) => {
    if (!mineSearchFilter.trim()) return true;
    const q = mineSearchFilter.toLowerCase();
    return (
      m.name?.toLowerCase().includes(q) ||
      m.code?.toLowerCase().includes(q) ||
      m.subsidiary?.toLowerCase().includes(q)
    );
  });

  const severityOptions = [
    { value: "low", label: t.low || "Low", color: "emerald", activeClass: "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-200" },
    { value: "medium", label: t.medium || "Medium", color: "amber", activeClass: "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-2 ring-amber-400 dark:bg-amber-950/60 dark:text-amber-200" },
    { value: "high", label: t.high || "High", color: "orange", activeClass: "border-orange-500 bg-orange-50 text-orange-900 font-bold ring-2 ring-orange-400 dark:bg-orange-950/60 dark:text-orange-200" },
    { value: "critical", label: t.criticalLabel || "Critical", color: "rose", activeClass: "border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400 dark:bg-rose-950/60 dark:text-rose-200" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-3.5 py-4 sm:px-6 lg:px-8 pb-36">
      {/* Top Header & Context */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.createInspectionTitle || "Create Field Inspection"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.createInspectionSubtitle || "Record mine observations, safety hazards, coordinates, and violations."}
            </p>
          </div>
          <button
            type="submit"
            form="create-inspection-form"
            disabled={loading}
            className="btn-primary inline-flex min-h-[44px] py-2 px-4 touch-manipulation items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-95 sm:hidden shrink-0 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? "Creating..." : "Save"}</span>
          </button>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
          {isOffline && (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline Ready: Saves to Device</span>
            </div>
          )}

          {hasRestoredDraft && (
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200 shadow-xs">
              <span>Saved draft active</span>
              <button
                type="button"
                onClick={clearDraft}
                className="underline font-semibold hover:text-amber-950 dark:hover:text-white"
              >
                Clear
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setVoiceEnabled((prev) => {
                const next = !prev;
                if (next) {
                  speakText(
                    language === "hi" ? "वॉयस गाइड सक्रिय है। फ़ील्ड चुनने पर निर्देश सुने।" : "Voice guide enabled. Select any field to hear instructions.",
                    language === "hi" ? "hi-IN" : "en-IN"
                  );
                } else {
                  stopSpeaking();
                }
                return next;
              });
            }}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition touch-manipulation min-h-[40px] ${
              voiceEnabled
                ? "border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200 shadow-xs"
                : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            aria-pressed={voiceEnabled}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 text-sky-600" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
            <span>{voiceEnabled ? "Voice Guide On" : "Voice Guide"}</span>
          </button>
        </div>
      </div>

      <form id="create-inspection-form" onSubmit={handleSubmit} autoComplete="on" className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        {/* Left Primary Form Stack (7 columns on desktop, full width on mobile) */}
        <div className="space-y-6 xl:col-span-7">
          
          {/* Section 1: Basic Information */}
          <div className="card space-y-4 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#ff6f00]" />
              {t.basicInformation || "Basic Information"}
            </h2>

            {/* Mine & Type Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mine Selection: Single-click responsive selector */}
              <div>
                <label className="label" htmlFor="inspection-mine-select">
                  {t.mineRequired || "Select Mine"} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <select
                    id="inspection-mine-select"
                    name="mineId"
                    value={form.mineId}
                    onChange={(e) => handleMineChange(e.target.value)}
                    className="input-field min-h-[44px] text-base sm:text-sm font-medium cursor-pointer"
                    required
                  >
                    {filteredMines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.code}) {m.subsidiary ? `— ${m.subsidiary}` : ""}
                      </option>
                    ))}
                  </select>
                  {mines.length > 5 && (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Filter mines list..."
                        value={mineSearchFilter}
                        onChange={(e) => setMineSearchFilter(e.target.value)}
                        className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1 pl-8 pr-2.5 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Inspection Type */}
              <div>
                <label className="label" htmlFor="inspection-type">
                  {t.inspectionType || "Inspection Type"}
                </label>
                <select
                  id="inspection-type"
                  name="type"
                  autoComplete="off"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-field min-h-[44px] text-base sm:text-sm font-medium cursor-pointer"
                >
                  <option value="scheduled">{t.scheduled || "Scheduled"}</option>
                  <option value="safety">{t.safety || "Safety"}</option>
                  <option value="environment">{t.environment || "Environment"}</option>
                  <option value="surprise">{t.surprise || "Surprise"}</option>
                  <option value="incident">{t.incident || "Incident"}</option>
                </select>
              </div>
            </div>

            {/* Inspection Title */}
            <div>
              <label className="label" htmlFor="inspection-title">
                {t.titleRequired || "Inspection Title"} <span className="text-red-500">*</span>
              </label>
              <VoiceTextField
                id="inspection-title"
                name="title"
                type="text"
                autoComplete="off"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                voiceEnabled={voiceEnabled}
                language={language}
                placeholder={t.titlePlaceholder || "e.g., Eastern Pit Slope & Berm Stability Audit"}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label" htmlFor="inspection-description">
                {t.description || "Description"}
              </label>
              <VoiceTextField
                id="inspection-description"
                name="description"
                autoComplete="off"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                voiceEnabled={voiceEnabled}
                language={language}
                multiline
                rows={3}
                placeholder={t.descriptionPlaceholder || "Provide general context, operational area, bench level..."}
              />
            </div>

            {/* Observations */}
            <div>
              <label className="label" htmlFor="inspection-observations">
                {t.observations || "Observations"}
              </label>
              <VoiceTextField
                id="inspection-observations"
                name="observations"
                autoComplete="off"
                value={form.observations}
                onChange={(e) => setForm({ ...form, observations: e.target.value })}
                voiceEnabled={voiceEnabled}
                language={language}
                multiline
                rows={3}
                placeholder={t.observationsPlaceholder || "Noted rock movements, drainage conditions, machinery clearances..."}
              />
            </div>

            {/* Severity: Single-Click Segmented Buttons */}
            <div>
              <label className="label mb-2" htmlFor="inspection-severity-group">
                {t.severity || "Severity Level"}
              </label>
              <div id="inspection-severity-group" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severityOptions.map((opt) => {
                  const isSelected = form.severity === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, severity: opt.value })}
                      className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition touch-manipulation ${
                        isSelected
                          ? opt.activeClass
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Site Photos & AI Hazard Detection */}
          <div className="card space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Camera className="h-4 w-4 text-[#ff6f00]" />
                  Site Photos & AI Hazard Detection
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Capture or upload pit photos. AI detects slope cracks, water ingress, and PPE hazards online & offline.
                </p>
              </div>

              {photoPreviews.length > 0 && (
                <button
                  type="button"
                  onClick={handleBatchRiskDetection}
                  disabled={isDetectingRisk}
                  className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-amber-400/80 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-500/25 transition shadow-xs disabled:opacity-50"
                >
                  {isDetectingRisk ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                  <span>Scan All Photos</span>
                </button>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Capture Photo Button */}
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 sm:flex-none inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#0b3d91] hover:bg-[#092c68] dark:bg-sky-600 dark:hover:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Photo</span>
              </button>

              {/* Upload Photos Button */}
              <label className="flex-1 sm:flex-none inline-flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition active:scale-[0.98]">
                <Upload className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span>Upload Photos</span>
                <input
                  id="site-photos"
                  name="photos"
                  type="file"
                  autoComplete="off"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                {photoPreviews.length}/{MAX_PHOTOS} attached
              </span>
            </div>

            {/* Photo Previews Grid with Decoupled Action Buttons */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photoPreviews.map((preview, index) => {
                  const risk = photoRisks[preview];
                  return (
                    <div
                      key={preview}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <img
                        src={preview}
                        alt={`Site Preview ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      {/* Top Action Buttons (Zoom & Trash) */}
                      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPreview(preview);
                            setPreviewZoom(1);
                          }}
                          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/75 text-white hover:bg-black transition shadow-md touch-manipulation"
                          title="Zoom photo preview"
                          aria-label="Zoom photo preview"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removePhoto(index);
                          }}
                          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-white hover:bg-red-700 transition shadow-md touch-manipulation"
                          title="Remove photo"
                          aria-label="Remove photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Bottom Risk Analysis Action */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 p-2">
                        {risk ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCurrentRiskData(risk);
                              setCurrentRiskPhoto(preview);
                              setRiskModalOpen(true);
                            }}
                            className="w-full rounded-lg bg-black/80 px-2.5 py-1.5 text-xs font-bold text-white flex items-center justify-between backdrop-blur-xs hover:bg-black transition border border-white/20 touch-manipulation"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Shield
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  risk.riskScore >= 70
                                    ? "text-rose-400"
                                    : risk.riskScore >= 45
                                    ? "text-amber-400"
                                    : "text-emerald-400"
                                }`}
                              />
                              <span className="truncate">Risk {risk.riskScore}</span>
                            </span>
                            <span
                              className={`uppercase font-extrabold text-[11px] ${
                                risk.riskLevel === "critical"
                                  ? "text-rose-400"
                                  : risk.riskLevel === "high"
                                  ? "text-amber-400"
                                  : risk.riskLevel === "medium"
                                  ? "text-yellow-300"
                                  : "text-emerald-400"
                              }`}
                            >
                              {risk.riskLevel}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isDetectingRisk}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDetectRisk(index);
                            }}
                            className="w-full rounded-lg bg-[#0b3d91] hover:bg-[#082d6b] dark:bg-sky-600 dark:hover:bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50 touch-manipulation"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Detect Risk
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Voice Note */}
          <div className="card space-y-3 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mic className="h-4 w-4 text-[#ff6f00]" />
              Voice Note (Audio Recording)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record voice observations directly in the pit. The audio file is synced and stored with this inspection.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-[#0b3d91] hover:bg-[#092c68] dark:bg-sky-600 dark:hover:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
                >
                  <Mic className="h-4 w-4" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition animate-pulse"
                >
                  <Square className="h-4 w-4 fill-current" />
                  <span>Stop Recording</span>
                </button>
              )}

              {audioUrl && (
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2">
                  <audio controls src={audioUrl} className="h-9 flex-1 max-w-full" />
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="inline-flex h-9 min-w-9 touch-manipulation items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Remove audio recording"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Site Geo-Location & Offline Coordinates */}
          <div className="card space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#ff6f00]" />
                  {t.geoLocation || "Site Geo-Location"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pin inspection coordinates on map or use GPS / manual entry.
                </p>
              </div>

              {/* Single-Click GPS / Mine Location Helper Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 hover:bg-sky-100 transition shadow-xs"
                >
                  <Navigation className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>GPS Location</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetToMineCoords}
                  className="inline-flex min-h-[38px] touch-manipulation items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-xs"
                >
                  <Compass className="h-3.5 w-3.5 text-slate-500" />
                  <span>Mine Center</span>
                </button>
              </div>
            </div>

            {/* Direct Coordinate Inputs (Resilient Offline Editing) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={manualCoords.lat}
                  onChange={(e) => handleManualCoordChange("lat", e.target.value)}
                  className="input-field min-h-[44px] text-base sm:text-sm font-mono"
                  placeholder="e.g., 24.12000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={manualCoords.lng}
                  onChange={(e) => handleManualCoordChange("lng", e.target.value)}
                  className="input-field min-h-[44px] text-base sm:text-sm font-mono"
                  placeholder="e.g., 82.45000"
                />
              </div>
            </div>

            {/* Interactive Map with Scroll-Safe Settings */}
            <div className="relative h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <MapFocus position={position} />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {isOffline && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                ⚡ Offline map mode: Cached tiles or GPS coordinates are saved locally with report.
              </p>
            )}
          </div>

          {/* Section 5: Violations Found */}
          <div className="card space-y-4 p-4 sm:p-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#ff6f00]" />
              {t.violationsFound || "Violations Found"} ({form.violations.length})
            </h2>

            {/* Added Violations List */}
            {form.violations.length > 0 && (
              <div className="space-y-2">
                {form.violations.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{v.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                        {v.category} • {v.severity} {v.correctiveAction ? `• Action: ${v.correctiveAction}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeViolation(i)}
                      className="text-red-500 hover:text-red-700 p-1 touch-manipulation"
                      title="Remove violation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Violation Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
              <div className="md:col-span-2">
                <VoiceTextField
                  id="violation-description"
                  name="violationDescription"
                  type="text"
                  autoComplete="off"
                  value={violation.description}
                  onChange={(e) => setViolation({ ...violation, description: e.target.value })}
                  className="input-field"
                  voiceEnabled={voiceEnabled}
                  language={language}
                  placeholder="Violation description (e.g., Loose rock overhang without netting)"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Category
                </label>
                <select
                  id="violation-category"
                  name="violationCategory"
                  autoComplete="off"
                  value={violation.category}
                  onChange={(e) => setViolation({ ...violation, category: e.target.value })}
                  className="input-field min-h-[44px] text-base sm:text-sm"
                >
                  <option value="safety">Safety</option>
                  <option value="environment">Environment</option>
                  <option value="production">Production</option>
                  <option value="labour">Labour</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 block">
                  Severity
                </label>
                <select
                  id="violation-severity"
                  name="violationSeverity"
                  autoComplete="off"
                  value={violation.severity}
                  onChange={(e) => setViolation({ ...violation, severity: e.target.value })}
                  className="input-field min-h-[44px] text-base sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <VoiceTextField
                  id="violation-corrective-action"
                  name="violationCorrectiveAction"
                  type="text"
                  autoComplete="off"
                  value={violation.correctiveAction}
                  onChange={(e) => setViolation({ ...violation, correctiveAction: e.target.value })}
                  className="input-field"
                  voiceEnabled={voiceEnabled}
                  language={language}
                  placeholder="Corrective action required"
                />
              </div>

              <button
                type="button"
                onClick={addViolation}
                className="btn-secondary min-h-[44px] flex items-center justify-center gap-2 md:col-span-2 font-semibold touch-manipulation active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" /> Add Violation
              </button>
            </div>
          </div>

          {/* Mobile Collapsible Preview Accordion (Only visible on screens below XL) */}
          <div className="xl:hidden card p-4">
            <button
              type="button"
              onClick={() => setShowMobilePreview((prev) => !prev)}
              className="flex w-full min-h-[44px] items-center justify-between font-bold text-slate-800 dark:text-slate-200 touch-manipulation"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#ff6f00]" />
                Live Inspection Report Preview ({form.title || "Untitled"})
              </span>
              {showMobilePreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {showMobilePreview && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base">{form.title || "Untitled Inspection"}</h3>
                  <span className={`badge badge-${form.severity}`}>{form.severity}</span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedMine?.name} ({selectedMine?.code}) • {form.type}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {form.description || "No description entered."}
                </p>
                {form.observations && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">
                    <strong>Observations:</strong> {form.observations}
                  </p>
                )}
                <p className="text-xs font-mono text-slate-400">
                  Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
              </div>
            )}
          </div>

          {/* Form Action Buttons Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex min-h-[48px] w-full sm:w-auto min-w-[240px] touch-manipulation items-center justify-center gap-2 text-base font-bold shadow-md active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              <span>{loading ? "Creating..." : "Create Inspection"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem(DRAFT_KEY);
                  sessionStorage.removeItem(DRAFT_KEY);
                } catch {
                  // ignore
                }
                navigate("/app/inspections");
              }}
              className="btn-secondary inline-flex min-h-[48px] w-full sm:w-auto min-w-[120px] touch-manipulation items-center justify-center text-sm font-semibold active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Desktop Column: Sticky Live Inspection Preview (5 columns on XL) */}
        <aside className="hidden xl:block xl:col-span-5 sticky top-24 space-y-6">
          <div className="card overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#ff6f00]" />
                <h2 className="font-bold text-slate-900 dark:text-white">Live Inspection Preview</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Real-time preview of the report generated for mine safety records.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="break-words text-xl font-bold text-slate-900 dark:text-white">
                    {form.title || "Untitled inspection"}
                  </h3>
                  <span className={`badge badge-${form.severity}`}>
                    {form.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedMine ? `${selectedMine.name} (${selectedMine.code})` : "Select a mine"}
                  {" • "}
                  <span className="capitalize">{form.type}</span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Report Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                  {form.description || "Your description will appear here as you type."}
                </p>
                {form.observations && (
                  <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Observations
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {form.observations}
                    </p>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 text-xs font-semibold dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-[#ff6f00]" />
                  Site Coordinates
                </div>
                <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-mono dark:bg-slate-800/60">
                  {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Violations Recorded</span>
                <span className="font-bold text-slate-900 dark:text-white">{form.violations.length}</span>
              </div>

              {photoPreviews.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Attached Site Photos ({photoPreviews.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {photoPreviews.slice(0, 3).map((preview, index) => (
                      <img
                        key={preview}
                        src={preview}
                        alt={`Site preview ${index + 1}`}
                        className="h-20 w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-xl bg-primary-50 p-3 text-xs text-primary-800 dark:bg-primary-950/40 dark:text-primary-200">
                <ArrowRight className="h-4 w-4 shrink-0 text-primary-600" />
                <span>
                  After submission, full inspection analysis and PDF audit report become immediately available.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </form>

      {/* Full-Screen Photo Zoom Modal */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-950/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Uploaded inspection photo preview"
          onClick={() => setSelectedPreview(null)}
          onWheel={(event) => {
            event.preventDefault();
            adjustPreviewZoom(event.deltaY < 0 ? 0.25 : -0.25);
          }}
        >
          <div
            className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-slate-900/90 p-1.5 text-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => adjustPreviewZoom(-0.25)}
              disabled={previewZoom <= 1}
              className="rounded-lg p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-12 text-center text-sm font-mono tabular-nums">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => adjustPreviewZoom(0.25)}
              disabled={previewZoom >= 4}
              className="rounded-lg p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPreview(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25"
            aria-label="Close photo preview"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedPreview}
            alt="Uploaded inspection site"
            className="max-h-[90vh] max-w-full rounded-xl object-contain shadow-2xl transition-transform duration-150"
            style={{ transform: `scale(${previewZoom})` }}
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
          mineId: form.mineId,
          title: form.title,
          description: form.description,
          observations: form.observations,
          severity: form.severity,
        }}
      />

      {/* AI Risk Analysis Modal */}
      <RiskAnalysisModal
        isOpen={riskModalOpen}
        onClose={() => setRiskModalOpen(false)}
        riskData={currentRiskData}
        photoPreview={currentRiskPhoto}
        onApplyFindings={applyRiskFindings}
      />
    </div>
  );
}
