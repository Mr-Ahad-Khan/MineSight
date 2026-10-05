// fileDownloader.js - Cross-platform file download and export utility

export async function downloadOrExportFile(contentOrBlob, fileName, mimeType = "application/octet-stream") {
  if (typeof window === "undefined") return false;

  const cleanMime = (mimeType || "application/octet-stream").split(";")[0].trim().toLowerCase();

  let blob;
  if (contentOrBlob instanceof Blob) {
    blob = contentOrBlob;
  } else {
    blob = new Blob([contentOrBlob], { type: cleanMime });
  }

  // 1. Android Native File Downloader (Directly writes to phone's Downloads directory)
  if (window.AndroidBridge?.saveBase64File) {
    try {
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const success = window.AndroidBridge.saveBase64File(base64Data, fileName, cleanMime);
      if (success) return true;
    } catch (err) {
      console.warn("Android native save failed, trying Web Share / URL fallback:", err);
    }
  }

  // 2. Standard browser download. Keep exports as downloads on desktop instead of
  // opening the operating system share panel.
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.error("Browser download fallback failed:", err);
  }

  // 3. Web Share API fallback for browsers that cannot download the file directly.
  try {
    const file = new File([blob], fileName, { type: cleanMime });
    if (typeof navigator !== "undefined" && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: fileName,
      });
      return true;
    }
  } catch (shareErr) {
    if (shareErr.name !== "AbortError") {
      console.warn("Web Share error:", shareErr);
    }
  }

  return false;
}

