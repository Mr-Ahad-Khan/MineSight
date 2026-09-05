import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Loader2,
  Plus,
  Trash2,
  Mic,
  Square,
  Upload,
  FileText,
  ArrowRight,
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

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
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
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

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

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
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

  const handlePhotoChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const validFiles = files.slice(0, 5);
    const previewUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...previewUrls]);
    setSelectedPhotos((prev) => [...prev, ...validFiles]);
    event.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
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
        autoComplete="off"
        className="grid w-full grid-cols-1 items-start gap-5 lg:gap-6 xl:grid-cols-2"
      >
        <div className="order-first flex flex-wrap justify-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 xl:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Creating..." : "Create Inspection"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2 xl:contents">
          {/* Basic Info */}
          <div className="card space-y-4 p-4 sm:p-5 lg:col-span-2 xl:col-span-1 xl:col-start-1 xl:row-start-2">
            <h2 className="font-semibold">{t.basicInformation}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t.mineRequired}</label>
                <select
                  value={form.mineId}
                  onChange={(e) => setForm({ ...form, mineId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">{t.selectMine}</option>
                  {mines.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t.inspectionType}</label>
                <select
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
              <label className="label">{t.titleRequired}</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder={t.titlePlaceholder}
                required
              />
            </div>

            <div>
              <label className="label">{t.description}</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input-field"
                rows={2}
                placeholder={t.descriptionPlaceholder}
              />
            </div>

            <div>
              <label className="label">{t.observations}</label>
              <textarea
                value={form.observations}
                onChange={(e) =>
                  setForm({ ...form, observations: e.target.value })
                }
                className="input-field"
                rows={3}
                placeholder={t.observationsPlaceholder}
              />
            </div>

            <div className="grid gap-4 pt-2 md:grid-cols-3 md:items-end">
              <div>
                <label className="label">{t.severity}</label>
                <select
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
                <label className="label">Voice Note</label>
                <div className="flex min-h-14 flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d91] px-3 py-2 text-sm font-medium text-white hover:bg-[#0a2f6d]"
                    >
                      <Mic className="h-4 w-4" />
                      Start
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Stop Recording
                    </button>
                  )}

                  {audioUrl && (
                    <>
                      <audio controls src={audioUrl} className="h-10" />
                      <button
                        type="button"
                        onClick={() => {
                          setAudioBlob(null);
                          setAudioUrl("");
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Site Photos</label>
                <div className="flex min-h-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0b3d91] px-3 py-2 text-sm font-medium text-white hover:bg-[#0a2f6d]">
                    <Upload className="h-4 w-4" />
                    Upload Photos
                    <input
                      type="file"
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
                            className="h-24 w-full object-cover"
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
              <input
                type="text"
                value={violation.description}
                onChange={(e) =>
                  setViolation({ ...violation, description: e.target.value })
                }
                className="input-field md:col-span-2"
                placeholder="Violation description"
              />
              <select
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
              <input
                type="text"
                value={violation.correctiveAction}
                onChange={(e) =>
                  setViolation({
                    ...violation,
                    correctiveAction: e.target.value,
                  })
                }
                className="input-field md:col-span-2"
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
      </form>
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
