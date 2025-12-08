export async function sendOffer(pc, shareId) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!pc) return reject("PeerConnection not found");
      if (!shareId) return reject("shareId missing");

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          console.log("ICE gathering complete (null candidate)");
          return;
        }

        console.log("Discovered OFFER ICE candidate:", e.candidate);

        try {
          await fetch("/api/share/offer-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shareId,
              candidate: e.candidate,
            }),
          });
          console.log("Offer candidate sent to server");
        } catch (err) {
          console.error("Failed to send offer ICE candidate:", err);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch("/api/share/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId,
          offer: pc.localDescription,
        }),
      });

      if (!res.ok) return reject("Failed to save offer");

      resolve({ offer: pc.localDescription });
    } catch (err) {
      reject(err);
    }
  });
}
