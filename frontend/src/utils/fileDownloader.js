// fileDownloader.js - Cross-platform file download and export utility

export async function downloadOrExportFile(contentOrBlob, fileName, mimeType = "application/octet-stream") {
  if (typeof window === "undefined") return false;

  let blob;
  if (contentOrBlob instanceof Blob) {
    blob = contentOrBlob;
  } else {
    blob = new Blob([contentOrBlob], { type: mimeType });
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

      const success = window.AndroidBridge.saveBase64File(base64Data, fileName, mimeType);
      if (success) return true;
    } catch (err) {
      console.warn("Android native save failed, trying Web Share / URL fallback:", err);
    }
  }

  // 2. Web Share API with File support (Android Chrome/WebView standard)
  try {
    const file = new File([blob], fileName, { type: mimeType });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: fileName,
      });
      return true;
    }
  } catch (shareErr) {
    // User cancelled share or not supported; proceed to anchor download
    if (shareErr.name !== "AbortError") {
      console.warn("Web Share error:", shareErr);
    }
  }

  // 3. Fallback standard browser anchor download
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
    return false;
  }
}
