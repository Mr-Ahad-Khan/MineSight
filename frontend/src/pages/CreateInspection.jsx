import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { createInspection, getMines } from "../services/api";
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

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function VoiceTextField({
  id,
  value,
  onChange,
  placeholder,
  className = "input-field",
  multiline = false,
  rows,
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
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `You are editing ${props["aria-label"] || placeholder || "this field"}. You can type or select the microphone to dictate.`,
    );
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
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
    className: `${className} ${supportsRecognition ? "pr-11" : ""}`,
    ...props,
  };

  return (
    <div className="relative">
      {multiline ? <textarea {...fieldProps} rows={rows} /> : <input {...fieldProps} />}
      {supportsRecognition && (
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-2 top-2 rounded-md p-1.5 transition ${
            listening
              ? "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300"
              : "text-slate-500 hover:bg-slate-100 hover:text-primary-600 dark:hover:bg-slate-700"
          }`}
          aria-label={listening ? "Stop voice typing" : "Start voice typing"}
          title={listening ? "Stop voice typing" : "Start voice typing"}
        >
          <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} />
        </button>
      )}
    </div>
  );
}

export default function CreateInspection() {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language];
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState([24.12, 82.45]); // Default Singrauli area
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [mineDropdownOpen, setMineDropdownOpen] = useState(false);
  const [mineSearch, setMineSearch] = useState("");
  const mineDropdownRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const adjustPreviewZoom = (amount) => {
    setPreviewZoom((current) => Math.min(4, Math.max(1, current + amount)));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mineDropdownRef.current &&
        !mineDropdownRef.current.contains(event.target)
      ) {
        setMineDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [form, setForm] = useState({
    mineId: "",
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

  useEffect(() => {
    getMines()
      .then((res) => setMines(res.data.data || []))
      .catch(console.error);

    // Try get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {},
      );
    }
  }, []);

  useEffect(() => {
    const mine = mines.find((item) => item._id === form.mineId);
    const coordinates = mine?.location?.coordinates;
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      coordinates.every(Number.isFinite)
    ) {
      setPosition([coordinates[1], coordinates[0]]);
    }
  }, [form.mineId, mines]);

  const addViolation = () => {
    if (!violation.description)
      return toast.error(t.violationDescriptionRequired);
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
  };

  const removeViolation = (index) => {
    setForm({
      ...form,
      violations: form.violations.filter((_, i) => i !== index),
    });
  };

  const startVoiceRecording = async () => {
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
      toast.success("Microphone recording started");
    } catch (error) {
      console.error(error);
      toast.error("Microphone access denied or not available in this browser");
    }
  };

  const stopVoiceRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const removeAudio = () => {
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

  const removePhoto = (index) => {
    setPhotoPreviews((prev) => {
      const urlToRemove = prev[index];
      if (urlToRemove && urlToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(urlToRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.mineId || !form.title) {
      return toast.error(t.mineAndTitle);
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
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

      if (audioBlob) {
        const fileName = `inspection-audio-${Date.now()}.webm`;
        formData.append("audio", audioBlob, fileName);
      }

      selectedPhotos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const res = await createInspection(formData);
      toast.success(`${t.inspectionCreated} ${res.data.data.riskScore}`);
      navigate(`/app/inspections/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t.failedToCreate);
    } finally {
      setLoading(false);
    }
  };

  const selectedMine = mines.find((mine) => mine._id === form.mineId);

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t.createInspectionTitle}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t.createInspectionSubtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        autoComplete="on"
        className="grid w-full grid-cols-1 items-start gap-5 lg:gap-6 xl:grid-cols-2"
      >
        <div className="flex items-center justify-end gap-3 text-sm xl:col-span-2">
          <button
            type="button"
            onClick={() => setVoiceEnabled((enabled) => !enabled)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-pressed={voiceEnabled}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? "Voice guidance on" : "Enable voice guidance"}
          </button>
          <span className="text-xs text-slate-500">Off by default</span>
        </div>
        <div className="grid items-stretch gap-6 lg:grid-cols-2 xl:contents">
          {/* Basic Info */}
          <div className="card space-y-4 p-4 sm:p-5 lg:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-2">
            <h2 className="font-semibold">{t.basicInformation}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={mineDropdownRef}>
                <label className="label" htmlFor="inspection-mine-trigger">
                  {t.mineRequired}
                </label>
                <input
                  type="text"
                  name="mineId"
                  value={form.mineId}
                  required
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                  onChange={() => {}}
                />
                <button
                  id="inspection-mine-trigger"
                  type="button"
                  onClick={() => setMineDropdownOpen((prev) => !prev)}
                  className="input-field flex items-center justify-between text-left cursor-pointer"
                  aria-haspopup="listbox"
                  aria-expanded={mineDropdownOpen}
                >
                  <span className={`truncate ${selectedMine ? "font-medium text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
                    {selectedMine
                      ? `${selectedMine.name} (${selectedMine.code})`
                      : t.selectMine}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${mineDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {mineDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <VoiceTextField
                          type="text"
                          id="inspection-mine-search"
                          value={mineSearch}
                          onChange={(e) => setMineSearch(e.target.value)}
                          placeholder="Search mine by name or code..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          voiceEnabled={voiceEnabled}
                          language={language}
                        />
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800">
                      {mines
                        .filter((m) => {
                          if (!mineSearch.trim()) return true;
                          const q = mineSearch.toLowerCase();
                          return (
                            m.name?.toLowerCase().includes(q) ||
                            m.code?.toLowerCase().includes(q) ||
                            m.subsidiary?.toLowerCase().includes(q)
                          );
                        })
                        .map((m) => {
                          const isSelected = form.mineId === m._id;
                          return (
                            <button
                              key={m._id}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, mineId: m._id });
                                setMineDropdownOpen(false);
                                setMineSearch("");
                              }}
                              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                                isSelected
                                  ? "bg-primary-50 font-semibold text-primary-900 dark:bg-primary-950/50 dark:text-primary-200"
                                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                              }`}
                            >
                              <div className="truncate">
                                <span className="block truncate font-medium">
                                  {m.name}
                                </span>
                                {m.subsidiary && (
                                  <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                                    {m.subsidiary}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  {m.code}
                                </span>
                                {isSelected && (
                                  <Check className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      {mines.filter((m) => {
                        if (!mineSearch.trim()) return true;
                        const q = mineSearch.toLowerCase();
                        return (
                          m.name?.toLowerCase().includes(q) ||
                          m.code?.toLowerCase().includes(q)
                        );
                      }).length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                          No mines match &ldquo;{mineSearch}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label" htmlFor="inspection-type">
                  {t.inspectionType}
                </label>
                <select
                  id="inspection-type"
                  name="type"
                  autoComplete="off"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-field"
                >
                  <option value="scheduled">{t.scheduled}</option>
                  <option value="safety">{t.safety}</option>
                  <option value="environment">{t.environment}</option>
                  <option value="surprise">{t.surprise}</option>
                  <option value="incident">{t.incident}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="inspection-title">
                {t.titleRequired}
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
                placeholder={t.titlePlaceholder}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="inspection-description">
                {t.description}
              </label>
              <VoiceTextField
                id="inspection-description"
                name="description"
                autoComplete="off"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                voiceEnabled={voiceEnabled}
                language={language}
                multiline
                rows={2}
                placeholder={t.descriptionPlaceholder}
              />
            </div>

            <div>
              <label className="label" htmlFor="inspection-observations">
                {t.observations}
              </label>
              <VoiceTextField
                id="inspection-observations"
                name="observations"
                autoComplete="off"
                value={form.observations}
                onChange={(e) =>
                  setForm({ ...form, observations: e.target.value })
                }
                voiceEnabled={voiceEnabled}
                language={language}
                multiline
                rows={3}
                placeholder={t.observationsPlaceholder}
              />
            </div>

            <div className="grid gap-4 pt-2 md:grid-cols-3 md:items-end">
              <div>
                <label className="label" htmlFor="inspection-severity">
                  {t.severity}
                </label>
                <select
                  id="inspection-severity"
                  name="severity"
                  autoComplete="off"
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value })
                  }
                  className="input-field w-full"
                >
                  <option value="low">{t.low}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="high">{t.high}</option>
                  <option value="critical">{t.criticalLabel}</option>
                </select>
              </div>

              <div>
                <div className="label">Voice Note</div>
                <div className="flex min-h-14 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d91] px-3 py-2 text-sm font-medium text-white hover:bg-[#0a2f6d] dark:bg-sky-600 dark:hover:bg-sky-500 shadow-sm"
                    >
                      <Mic className="h-4 w-4" />
                      Start
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 shadow-sm animate-pulse"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Stop Recording
                    </button>
                  )}

                  {audioUrl && (
                    <>
                      <audio controls src={audioUrl} className="h-10 rounded-lg dark:bg-slate-800" />
                      <button
                        type="button"
                        onClick={removeAudio}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="label" htmlFor="site-photos">
                  Site Photos
                </label>
                <div className="flex min-h-14 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0b3d91] px-3 py-2 text-sm font-medium text-white hover:bg-[#0a2f6d]">
                      <Upload className="h-4 w-4" />
                      Upload Photos
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

                  {photoPreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {photoPreviews.map((preview, index) => (
                        <div
                          key={preview}
                          className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full cursor-zoom-in object-cover"
                            onClick={() => {
                              setSelectedPreview(preview);
                              setPreviewZoom(1);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Geo Location */}
          <div className="card flex h-full flex-col space-y-4 p-4 sm:p-5 xl:col-start-1 xl:row-start-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold">{t.geoLocation}</h2>
            </div>
            <p className="text-sm text-slate-500">{t.clickMap}</p>

            <div className="h-64 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <MapContainer
                center={position}
                zoom={13}
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
            <p className="text-xs text-slate-500">
              {t.coordinates}: {position[0].toFixed(5)},{" "}
              {position[1].toFixed(5)}
            </p>
          </div>

          {/* Violations */}
          <div className="card flex h-full flex-col justify-center space-y-4 p-4 sm:p-5 xl:col-start-2 xl:row-start-3">
            <h2 className="font-semibold">{t.violationsFound}</h2>

            {form.violations.length > 0 && (
              <div className="space-y-2">
                {form.violations.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{v.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {v.category} • {v.severity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeViolation(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
              <VoiceTextField
                id="violation-description"
                name="violationDescription"
                type="text"
                autoComplete="off"
                value={violation.description}
                onChange={(e) =>
                  setViolation({ ...violation, description: e.target.value })
                }
                className="input-field md:col-span-2"
                voiceEnabled={voiceEnabled}
                language={language}
                placeholder="Violation description"
              />
              <select
                id="violation-category"
                name="violationCategory"
                autoComplete="off"
                value={violation.category}
                onChange={(e) =>
                  setViolation({ ...violation, category: e.target.value })
                }
                className="input-field"
              >
                <option value="safety">Safety</option>
                <option value="environment">Environment</option>
                <option value="production">Production</option>
                <option value="labour">Labour</option>
                <option value="other">Other</option>
              </select>
              <select
                id="violation-severity"
                name="violationSeverity"
                autoComplete="off"
                value={violation.severity}
                onChange={(e) =>
                  setViolation({ ...violation, severity: e.target.value })
                }
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <VoiceTextField
                id="violation-corrective-action"
                name="violationCorrectiveAction"
                type="text"
                autoComplete="off"
                value={violation.correctiveAction}
                onChange={(e) =>
                  setViolation({
                    ...violation,
                    correctiveAction: e.target.value,
                  })
                }
                className="input-field md:col-span-2"
                voiceEnabled={voiceEnabled}
                language={language}
                placeholder="Corrective action required"
              />
              <button
                type="button"
                onClick={addViolation}
                className="btn-secondary flex items-center gap-2 md:col-span-2"
              >
                <Plus className="w-4 h-4" /> Add Violation
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-6 xl:col-start-2 xl:row-start-2">
          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h2 className="font-semibold">Inspection preview</h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Review the report as you complete the form.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="break-words text-xl font-bold">
                    {form.title || "Untitled inspection"}
                  </h3>
                  <span className={`badge badge-${form.severity}`}>
                    {form.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {selectedMine
                    ? `${selectedMine.name} (${selectedMine.code})`
                    : "Select a mine"}
                  {" • "}
                  {form.type}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Report details
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">
                  {form.description || "Your description will appear here."}
                </p>
                {form.observations && (
                  <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-700">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Observations
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {form.observations}
                    </p>
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium dark:border-slate-700">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  Site location
                </div>
                <div className="bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">
                  {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Violations added</span>
                <span className="font-semibold">{form.violations.length}</span>
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.slice(0, 3).map((preview, index) => (
                    <img
                      key={preview}
                      src={preview}
                      alt={`Site preview ${index + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 rounded-lg bg-primary-50 p-3 text-sm text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                <ArrowRight className="h-4 w-4 shrink-0" />
                After submission, the complete inspection details will open
                automatically.
              </div>
            </div>
          </div>
        </aside>

        <div className="relative z-10 flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 xl:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex min-h-12 min-w-48 touch-manipulation items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Creating..." : "Create Inspection"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary inline-flex min-h-12 min-w-28 touch-manipulation items-center justify-center"
          >
            Cancel
          </button>
        </div>
      </form>
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-950/85 p-4 sm:p-8"
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
            className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-slate-900/80 p-1.5 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => adjustPreviewZoom(-0.25)}
              disabled={previewZoom <= 1}
              className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="min-w-12 text-center text-sm tabular-nums">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => adjustPreviewZoom(0.25)}
              disabled={previewZoom >= 4}
              className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedPreview(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close photo preview"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={selectedPreview}
            alt="Uploaded inspection site"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-150"
            style={{ transform: `scale(${previewZoom})` }}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
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
