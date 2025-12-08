export async function checkSessionId(shareId) {
  if (!shareId || typeof shareId !== "string") {
    return { ok: false, error: "Invalid session ID" };
  }

  try {
    const res = await fetch(`/api/share/${shareId}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, error: "Session not found or expired" };
    }

    const data = await res.json();

    if (!data.session) {
      return { ok: false, error: "Session not found in database" };
    }

    return { ok: true, error: null };
  } catch (e) {
    return { ok: false, error: "Network error. Please try again." };
  }
}
