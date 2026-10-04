/**
 * Check if a JWT token is expired based on its payload exp timestamp.
 * Offline tokens (starting with offline_token_) do not expire.
 */
export function isTokenExpired(token) {
  if (!token || typeof token !== "string") return false;
  if (token.startsWith("offline_token_")) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const parsed = JSON.parse(jsonPayload);
    if (parsed && typeof parsed.exp === "number") {
      // Return true if current time is past exp (in seconds)
      return Date.now() >= parsed.exp * 1000;
    }
    return false;
  } catch {
    return false;
  }
}
