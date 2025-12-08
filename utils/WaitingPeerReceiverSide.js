"use client";

export async function WaitForPeerReceiverSide(id) {
  if (!id) {
    return { found: false, session: null };
  }

  try {
    const r = await fetch(`/api/share/${id}/checkanswer`, {
      method: "GET",
      cache: "no-store",
    });

    if (!r.ok) {
      return { found: false, session: null };
    }

    const data = await r.json();

    console.log("WaitForPeerReceiverSide data:", data);

    return {
      found: data.found === true,
      session: data.session || null,
    };
  } catch (err) {
    console.error("WaitForPeerReceiverSide error:", err);
    return { found: false, session: null };
  }
}
