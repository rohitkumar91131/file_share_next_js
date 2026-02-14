export const api = {
    // Offer & Candidates
    sendOffer: async (shareId, offer) => {
        const res = await fetch("/api/share/offer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareId, offer }),
        });
        if (!res.ok) throw new Error("Failed to save offer");
        return res.json();
    },

    sendOfferCandidate: async (shareId, candidate) => {
        return fetch("/api/share/offer-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareId, candidate }),
        });
    },

    checkOffer: async (shareId) => {
        const res = await fetch(`/api/share/${shareId}/checkoffer`, {
            method: "GET",
            cache: "no-store",
        });
        if (!res.ok) return { found: false, session: null };
        return res.json();
    },

    checkSession: async (shareId) => {
        try {
            if (!shareId || typeof shareId !== "string") return { ok: false, error: "Invalid session ID" };

            const res = await fetch(`/api/share/${shareId}`, {
                method: "GET",
                cache: "no-store",
            });

            if (!res.ok) return { ok: false, error: "Session not found or expired" };

            const data = await res.json();
            if (!data.session) return { ok: false, error: "Session not found in database" };

            return { ok: true, session: data.session };
        } catch (e) {
            return { ok: false, error: "Network error. Please try again." };
        }
    },

    // Answer & Candidates
    sendAnswer: async (shareId, answer) => {
        const res = await fetch("/api/share/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareId, answer }),
        });
        if (!res.ok) throw new Error("Failed to save answer");
        return res.json();
    },

    sendAnswerCandidate: async (shareId, candidate) => {
        return fetch("/api/share/answer-candidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shareId, candidate }),
        });
    },

    checkAnswer: async (shareId) => {
        const res = await fetch(`/api/share/${shareId}/checkanswer`, {
            method: "GET",
            cache: "no-store",
        });
        if (!res.ok) return { found: false, session: null };
        return res.json();
    },
};
