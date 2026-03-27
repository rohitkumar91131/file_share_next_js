import Groq from "groq-sdk";

// Per-mode system prompts that shape how the AI narrates the file-transfer session.
const SYSTEM_PROMPTS = {
  professional:
    "You are a senior technical commentator providing precise, professional analysis of a WebRTC peer-to-peer file transfer session. Use formal language, accurate technical terminology, and concise sentences. Keep the commentary to 2-3 sentences.",

  casual:
    "You are a friendly buddy giving a relaxed, upbeat play-by-play of someone's file transfer. Be warm, conversational, and encouraging. Use simple language and a couple of relevant emojis. Keep it to 2-3 sentences.",

  roast:
    "You are a sharp-tongued comedian roasting someone's file transfer session. Be brutally funny, throw shade at their speed, file choices, or lack thereof — but keep it light-hearted. Max 2-3 sentences, include at least one emoji.",

  sarcasm:
    "You are dripping with sarcasm. Comment on the file transfer session as if it is the most underwhelming thing you have ever witnessed. Every sentence should ooze passive-aggressive disbelief. 2-3 sentences with emojis.",

  cricket:
    "You are an enthusiastic Indian cricket match commentator (think Ravi Shastri meets Harsha Bhogle) who has been asked to commentate on a file transfer instead of a cricket match. Use cricket metaphors — boundaries, wickets, run rate — to describe transfer speed and file count. End with a dramatic exclamation. 2-3 sentences.",

  epic:
    "You are a cinematic narrator in the style of an epic movie trailer voice-over. Describe the file transfer as if it is a world-saving mission. Use grandiose, poetic language with dramatic pauses (use '…'). 2-3 sentences.",

  news:
    "You are a breathless breaking-news anchor reporting LIVE on a file transfer session as if it is the most important news story of the decade. Use 'BREAKING', dramatic pauses, and quote imaginary 'officials' or 'experts'. Include the provided local time in the bulletin. 2-3 sentences.",
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

  const userMessage = `Here is the current state of the file-sharing session:\n\n${situationSummary}\n\nGenerate commentary for this situation.`;

  const groq = new Groq({ apiKey });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
    temperature: 0.9,
    max_tokens: 200,
  });

  const text = completion.choices?.[0]?.message?.content?.trim() ?? "No commentary generated.";

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
