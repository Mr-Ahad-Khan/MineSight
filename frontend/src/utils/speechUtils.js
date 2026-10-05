// speechUtils.js - Cross-platform voice instruction and text-to-speech engine

export function speakText(text, lang = "en-IN") {
  if (!text || typeof window === "undefined") return;

  const normalizedLang = lang.startsWith("hi") ? "hi-IN" : "en-IN";

  // 1. Android Native TTS Bridge (100% reliable in mobile app, works offline)
  if (window.AndroidBridge?.speakText) {
    try {
      window.AndroidBridge.speakText(text, normalizedLang);
      return;
    } catch (e) {
      console.warn("Android native TTS error, falling back to Web Speech:", e);
    }
  }

  // 2. Web Speech Synthesis with Chromium & WebView GC/pause bug fixes
  if (!("speechSynthesis" in window)) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = normalizedLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Retain global reference so Android WebView V8 garbage collector does not silence it
    window._minesightActiveUtterance = utterance;

    utterance.onend = () => {
      window._minesightActiveUtterance = null;
    };
    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      window._minesightActiveUtterance = null;
    };

    // Delay slightly to prevent race condition after cancel()
    setTimeout(() => {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Error calling speak:", err);
      }
    }, 50);
  } catch (err) {
    console.warn("TTS initialization error:", err);
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;

  if (window.AndroidBridge?.stopSpeaking) {
    try {
      window.AndroidBridge.stopSpeaking();
    } catch (e) {
      console.warn("Android native stopSpeaking error:", e);
    }
  }

  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      window._minesightActiveUtterance = null;
    } catch (err) {
      console.warn("TTS cancel error:", err);
    }
  }
}
