export async function sendAnswer(pc, shareId, offer, offerCandidates = []) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!pc) return reject("PeerConnection not found");
      if (!shareId) return reject("shareId missing");
      if (!offer) return reject("Remote offer missing");

      // ye strict check गलत tha — candidates thode der baad bhi aa sakte hain
      // isliye sirf warning log karenge, reject nahi karenge
      if (!Array.isArray(offerCandidates) || offerCandidates.length === 0) {
        console.warn("⚠️ Offer ICE candidates array empty. Continuing anyway.");
      }

      console.log("Applying remote offer...");
      await pc.setRemoteDescription(offer);

      if (Array.isArray(offerCandidates) && offerCandidates.length > 0) {
        console.log("Adding offer ICE candidates:", offerCandidates.length);
        for (const cand of offerCandidates) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.error("Failed to add offer ICE candidate:", e);
          }
        }
      }

      // ⚠️ yahan infinite log avoid karne ke liye guard
      let iceDone = false;

      pc.onicecandidate = async (e) => {
        // null candidate → ICE complete
        if (!e.candidate) {
          if (iceDone) return; // pehle hi aa chuka hai, dobara ignore
          iceDone = true;
          console.log("ICE gathering complete for answer");
          return;
        }

        console.log("Discovered ANSWER ICE candidate:", e.candidate);

        try {
          await fetch("/api/share/answer-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shareId,
              candidate: e.candidate,
            }),
          });
        } catch (err) {
          console.error("Failed to send answer ICE candidate:", err);
        }
      };

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const res = await fetch("/api/share/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId,
          answer: pc.localDescription,
        }),
      });

      if (!res.ok) return reject("Failed to save answer");

      resolve({ answer: pc.localDescription });
    } catch (err) {
      reject(err);
    }
  });
}
