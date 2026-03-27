// Optional Sarvam AI Text-to-Speech proxy (higher quality, requires API key).
// The primary TTS path uses the browser's built-in Web Speech API (no API key needed).
// Set SARVAM_API_KEY in your .env.local only if you want Sarvam voice quality.
// Docs: https://docs.sarvam.ai/api-reference-docs/text-to-speech

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

export async function POST(request) {
  const { text, speaker = "meera", pace = 1.0 } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return new Response(JSON.stringify({ error: "text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "SARVAM_API_KEY is not configured. Add it to .env.local to enable voice." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = {
    inputs: [text.slice(0, 500)], // Sarvam max ~500 chars per request
    target_language_code: "en-IN",
    speaker,
    pitch: 0,
    pace,
    loudness: 1.5,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v1",
  };

  const sarvamRes = await fetch(SARVAM_TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!sarvamRes.ok) {
    const errText = await sarvamRes.text();
    return new Response(
      JSON.stringify({ error: `Sarvam API error: ${sarvamRes.status}`, details: errText }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const data = await sarvamRes.json();
  // Sarvam returns { audios: ["<base64-wav>"] }
  const audioBase64 = data?.audios?.[0];

  if (!audioBase64) {
    return new Response(JSON.stringify({ error: "No audio returned from Sarvam AI" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ audio: audioBase64 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
