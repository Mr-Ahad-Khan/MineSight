import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  X,
  RefreshCw,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Shield,
  Loader2,
  Upload,
  Plus,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { compressImage } from "../../utils/imageCompressor";
import { detectPhotoRisk } from "../../services/riskDetectionService";

/**
 * Synthesizes a subtle camera shutter click sound using Web Audio API.
 * Works 100% offline without needing external audio files.
 */
function playShutterSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    // Ignore audio error silently
  }
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onPhotoCaptured,
  onOpenInspection,
  inspectionContext = {},
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fallbackInputRef = useRef(null);

  const [facingMode, setFacingMode] = useState("environment"); // back camera preferred for site inspection
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);
  const [detectedRisk, setDetectedRisk] = useState(null);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser. Please use file upload.");
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err) {
      console.warn("Camera init failed:", err);
      setCameraError(err.message || "Could not access camera");
      setIsInitializing(false);
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedBlob) {
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, capturedBlob, startCamera, stopStream]);

  // Clean up captured preview URL
  useEffect(() => {
    return () => {
      if (capturedPreview && capturedPreview.startsWith("blob:")) {
        URL.revokeObjectURL(capturedPreview);
      }
    };
  }, [capturedPreview]);

  // Switch between front and rear cameras
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture current video frame
  const takeSnapshot = async () => {
    if (!videoRef.current) return;

    playShutterSound();
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");

    // If using user-facing camera, flip horizontally for mirror effect
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Failed to capture image snapshot");
          return;
        }

        // Convert blob to File with timestamp
        const file = new File([blob], `inspection-capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // Compress
        const compressed = await compressImage(file);
        const previewUrl = URL.createObjectURL(compressed);

        setCapturedBlob(compressed);
        setCapturedPreview(previewUrl);
        stopStream();

        // Automatically trigger background risk detection for instant feedback
        runInstantRiskAnalysis(compressed);
      },
      "image/jpeg",
      0.92
    );
  };

  // Run risk analysis on the captured photo
  const runInstantRiskAnalysis = async (photoFile) => {
    setAnalyzingRisk(true);
    try {
      const risk = await detectPhotoRisk(photoFile, inspectionContext);
      setDetectedRisk(risk);
    } catch (err) {
      console.warn("Instant risk analysis error:", err);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedPreview && capturedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setDetectedRisk(null);
    startCamera();
  };

  // Accept and pass back to parent
  const handleAccept = () => {
    if (!capturedBlob) return;
    onPhotoCaptured(capturedBlob, capturedPreview, detectedRisk);
    onClose();
  };

  // Handle native fallback file input capture
  const handleFallbackCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const previewUrl = URL.createObjectURL(compressed);

    setCapturedBlob(compressed);
    setCapturedPreview(previewUrl);
    setCameraError(null);
    runInstantRiskAnalysis(compressed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 z-10">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-semibold">
              {capturedBlob ? "Review Captured Photo" : "Capture Inspection Photo"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black min-h-[320px] sm:min-h-[420px]">
          {flashEffect && (
            <div className="absolute inset-0 z-30 bg-white pointer-events-none animate-pulse" />
          )}

          {!capturedBlob ? (
            <>
              {/* Live Video */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`h-full w-full object-cover max-h-[55vh] ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Viewfinder Grid Overlay */}
              <div className="pointer-events-none absolute inset-0 border border-white/20">
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/10" />
                <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/10" />

                {/* Corner Marks */}
                <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-sky-400" />
                <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-sky-400" />
                <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-sky-400" />
                <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-sky-400" />
              </div>

              {/* Status Banner */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Camera Feed
              </div>

              {/* Camera flip button */}
              <button
                type="button"
                onClick={toggleCamera}
                title="Switch Camera (Front/Rear)"
                className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md hover:bg-black/80 transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              {/* Fallback & Error overlay if permission failed */}
              {cameraError && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-400 mb-3" />
                  <h4 className="text-base font-semibold text-white">Camera Access Required</h4>
                  <p className="mt-1 text-xs text-slate-300 max-w-sm mb-4">
                    {cameraError}. You can capture photos directly using your device's native camera.
                  </p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition shadow-lg">
                    <Camera className="h-4 w-4" />
                    Open Native Camera
                    <input
                      ref={fallbackInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFallbackCapture}
                    />
                  </label>
                </div>
              )}

              {/* Loading State */}
              {isInitializing && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 text-sky-400 animate-spin mb-2" />
                  <p className="text-xs text-slate-300">Initializing camera lens...</p>
                </div>
              )}
            </>
          ) : (
            /* Review Mode */
            <div className="relative h-full w-full max-h-[55vh] flex items-center justify-center bg-black">
              <img
                src={capturedPreview}
                alt="Captured Snapshot"
                className="h-full w-full object-contain max-h-[55vh]"
              />

              {/* Instant Risk Detection Floating Overlay */}
              <div className="absolute bottom-3 left-3 right-3 z-20 max-h-[50%] overflow-y-auto">
                {analyzingRisk ? (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/95 p-3 text-xs text-sky-300 backdrop-blur-md border border-slate-700 shadow-xl">
                    <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                    <span>Analyzing photo for mining safety hazards...</span>
                  </div>
                ) : detectedRisk ? (
                  <div className="rounded-xl bg-slate-900/95 p-3.5 text-xs text-white backdrop-blur-md border border-slate-700 shadow-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-amber-400" />
                        <span className="font-semibold text-slate-200">
                          Scan Risk Score:{" "}
                          <span
                            className={
                              detectedRisk.riskLevel === "critical"
                                ? "text-rose-400 font-bold"
                                : detectedRisk.riskLevel === "high"
                                ? "text-amber-400 font-bold"
                                : detectedRisk.riskLevel === "medium"
                                ? "text-yellow-300 font-bold"
                                : "text-emerald-400 font-bold"
                            }
                          >
                            {detectedRisk.riskScore}/100 ({detectedRisk.riskLevel?.toUpperCase()})
                          </span>
                        </span>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                        {detectedRisk.source === "online_ai" ? "🟢 Cloud AI" : "⚡ Edge AI Offline"}
                      </span>
                    </div>

                    {detectedRisk.hazards && detectedRisk.hazards.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Detected Safety Hazards:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {detectedRisk.hazards.map((h, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300 border border-amber-500/30"
                            >
                              {h.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {detectedRisk.observations && (
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        <strong>Observations:</strong> {detectedRisk.observations}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 p-4">
          {!capturedBlob ? (
            <div className="flex w-full items-center justify-between">
              {/* Fallback button */}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition">
                <Upload className="h-3.5 w-3.5" />
                Upload / Device
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFallbackCapture}
                />
              </label>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={isInitializing || !!cameraError}
                aria-label="Take Photo"
                className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <div className="h-13 w-13 rounded-full border-4 border-slate-900 bg-sky-500 group-hover:bg-sky-400 transition" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>

              <div className="flex items-center gap-2">
                {onOpenInspection ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-slate-700 px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition"
                    >
                      Done / Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenInspection({
                          file: capturedBlob,
                          previewUrl: capturedPreview,
                          initialRisk: detectedRisk,
                        });
                        onClose();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#ff6f00] hover:bg-[#e65100] px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Open New Inspection Form (Optional)</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-400 transition shadow-lg"
                  >
                    <Check className="h-4 w-4" />
                    Use Photo {detectedRisk ? "& Apply Risk" : ""}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
