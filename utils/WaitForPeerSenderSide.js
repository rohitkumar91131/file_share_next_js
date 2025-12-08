"use client";

export async function WaitForPeerSenderSide(id) {
  if (!id) {
    return { found: false, session: null };
  }

  try {
    const r = await fetch(`/api/share/${id}/checkoffer`, {
      method: "GET",
      cache: "no-store",
    });

    if (!r.ok) {
      return { found: false, session: null };
    }

    const data = await r.json();

    console.log("WaitForPeerSenderSide data:", data);

    // API gives:
    // { found: true, session: {...} }
    // or
    // { found: false }

    return {
      found: data.found === true,
      session: data.session || null,
    };
  } catch (err) {
    return { found: false, session: null };
  }
}
