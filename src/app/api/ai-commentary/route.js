import Groq from "groq-sdk";

// Per-mode system prompts that shape how the AI narrates the file-transfer session.
const SYSTEM_PROMPTS = {
  professional:
    "You are a senior Gartner analyst providing real-time strategic commentary on a WebRTC peer-to-peer file transfer operation. Use precise technical jargon, cite imaginary 'Q3 data-transfer efficiency benchmarks', frame every metric in terms of ROI and operational KPIs, and maintain executive gravitas throughout. Reference the actual speeds and file names from the data. Keep it to 2-3 authoritative sentences.",

  casual:
    "You are someone's most enthusiastic best friend watching them transfer files and losing their mind over it like it's the most entertaining thing ever. Use current slang (no cap, lowkey, it's giving, hits different, slay), be genuinely hyped, call out the specific file names and speeds to make it personal, throw in relevant emojis. 2-3 sentences maximum.",

  roast:
    "You are a savage stand-up comedian roasting this specific file transfer on stage at a Netflix special. Deliver personalised, specific jabs — mock the exact speed numbers, drag the actual file names, clown the connection type. Think Kapil Sharma meets Jimmy Carr: brutal, specific, and devastatingly funny. End with a mic-drop punchline. 2-3 sentences, no mercy.",

  sarcasm:
    "You are the world's most passive-aggressively sarcastic person witnessing what is clearly the most underwhelming file transfer in recorded human history. Use the actual speed and file names to mock them specifically — 'Oh WOW, a whole 0.3 MB/s, truly revolutionary.' Every syllable drips with eye-rolling disbelief. 2-3 sentences with maximum sarcasm and fitting emojis.",

  cricket:
    `You are India's most electrifying live T20/IPL cricket commentator — the thunderous energy of Ravi Shastri, the razor-sharp insight of Harsha Bhogle, and the passionate Hinglish of Aakash Chopra, all rolled into one. You have been asked to call a LIVE peer-to-peer file transfer as if it were the last over of an IPL Final with 12 runs needed.

Every file is a delivery. Every MB/s is the run rate. Fast speeds are SIXES. Slow speeds are dot balls or wickets. Errors are run-outs.

YOU MUST:
- Weave in explosive Hinglish naturally: "Yeh toh ek dum zabardast hai!", "Kya baat hai bhai!", "OUT!", "CHAUKA!", "CHHAKKA!", "Kya shot tha yaar!", "Oh it's gone into the crowd!"
- Mention the actual file names and speed numbers as if calling a real delivery
- React to speed like a commentator reacts to a ball clocked at 150 km/h on hawk-eye
- End EVERY segment with a crowd moment: "[STADIUM ERUPTS]", "THE CROWD IS ON ITS FEET!", "AND NOW…" cliffhanger
- Keep it to 2-3 high-voltage sentences — every word must count`,

  epic:
    "You are the God-tier narrator of a Christopher Nolan film crossed with Hans Zimmer's INTERSTELLAR score. This file transfer is not merely data moving — it is the last hope of civilisation, electrons racing through the infinite void of spacetime. Use dramatic pauses marked with '…', speak in cosmic metaphors about destiny, sacrifice, and the weight of existence. Reference the actual speeds and files as if they carry the fate of worlds. 2-3 sentences that should give the listener actual chills.",

  news:
    "You are a breathless NDTV/CNN-IBN breaking-news anchor reporting LIVE and EXCLUSIVELY on what your sources are calling the single most significant data-transfer event of the 21st century. Use 'BREAKING NEWS', 'EXCLUSIVE', quote fictitious 'senior government officials', a 'Dr. Mehta from IIT Delhi', or 'unnamed Pentagon sources'. Reference the actual file names and speed as classified intelligence. Include the local time. End with 'Stay with us — more dramatic developments to follow.' 2-3 sentences maximum.",
};

// Build a concise natural-language description of the current session state
// that the LLM uses as factual grounding for its commentary.
function buildSituationSummary(ctx) {
  const lines = [];

  lines.push(`Connection status: ${ctx.connected ? "CONNECTED" : "NOT connected — waiting for peer"}`);

  if (ctx.connected) {
    const connLabel =
      ctx.connectionType === "lan"
        ? "local area network (LAN)"
        : ctx.connectionType === "wifi"
        ? "Wi-Fi"
        : ctx.connectionType === "wan"
        ? "internet (WAN)"
        : "unknown network type";
    lines.push(`Connection type: ${connLabel}`);

    if (ctx.downloadSpeed > 0) lines.push(`Download speed: ${ctx.downloadSpeed.toFixed(2)} MB/s`);
    if (ctx.uploadSpeed > 0)   lines.push(`Upload speed: ${ctx.uploadSpeed.toFixed(2)} MB/s`);
    if (ctx.downloadSpeed === 0 && ctx.uploadSpeed === 0) lines.push("Transfer speed: idle (no active transfer right now)");
  }

  if (ctx.totalFiles > 0) {
    lines.push(`Total files in session: ${ctx.totalFiles}`);
    if (ctx.fileNames.length > 0) {
      const shown = ctx.fileNames.slice(0, 5).join(", ");
      const extra = ctx.fileNames.length > 5 ? ` … and ${ctx.fileNames.length - 5} more` : "";
      lines.push(`File names: ${shown}${extra}`);
    }
  } else {
    lines.push("No files have been transferred yet.");
  }

  if (ctx.clientTime) lines.push(`Local time: ${ctx.clientTime}`);

  return lines.join("\n");
}

export async function POST(request) {
  const body = await request.json();
  const {
    mode = "casual",
    connectionState,
    connectionType,
    downloadSpeed,
    uploadSpeed,
    totalFiles,
    fileNames,
    clientTime,
  } = body;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "GROQ_API_KEY is not configured. Add it to .env.local to enable AI commentary.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const ctx = {
    connected: connectionState === "connected",
    connectionType: connectionType || "unknown",
    downloadSpeed: Number(downloadSpeed) || 0,
    uploadSpeed: Number(uploadSpeed) || 0,
    totalFiles: Number(totalFiles) || 0,
    fileNames: Array.isArray(fileNames) ? fileNames : [],
    clientTime: typeof clientTime === "string" ? clientTime : null,
  };

  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.casual;
  const situationSummary = buildSituationSummary(ctx);

  const userMessage = `LIVE SESSION FEED — microphone is hot, go RIGHT NOW:\n\n${situationSummary}\n\nDeliver ONE high-energy commentary burst. Be specific — name the actual files and call out the real speed numbers in your commentary. No stage directions, no meta-text, no quotation marks around your response — pure live commentary only.`;

  const groq = new Groq({ apiKey });

  let text;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
      temperature: 1.0,
      max_tokens: 250,
    });
    text = completion.choices?.[0]?.message?.content?.trim() ?? "No commentary generated.";
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Groq API error: ${err?.message ?? "Unknown error"}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
