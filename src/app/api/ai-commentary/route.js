// Commentary templates per mode.
// Each template receives a `ctx` object with live app state and returns a string.

const TEMPLATES = {
  professional: (ctx) => {
    if (!ctx.connected) {
      return "The peer-to-peer session is currently in an unestablished state. Awaiting successful WebRTC handshake to initiate data channel operations.";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr = speed > 0 ? ` at a throughput of ${speed.toFixed(2)} MB/s` : "";
    const filesStr =
      ctx.totalFiles > 0
        ? ` A total of ${ctx.totalFiles} asset(s) have been processed.`
        : " No file assets have been exchanged at this time.";
    return `The ${ctx.connectionType === "lan" ? "local area network" : ctx.connectionType === "wifi" ? "Wi-Fi" : "wide area network"} peer connection is fully operational${speedStr}.${filesStr} System performance metrics remain within acceptable parameters.`;
  },

  casual: (ctx) => {
    if (!ctx.connected) {
      return "Hey, waiting for the other person to connect! Hang tight, it'll happen soon 😄";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr = speed > 0 ? ` at like ${speed.toFixed(1)} MB/s` : "";
    const filesStr =
      ctx.totalFiles > 0
        ? ` Already sent ${ctx.totalFiles} file(s), not bad!`
        : " Nothing's been shared yet, go ahead and drop some files!";
    return `Yeah yeah, we're connected over ${ctx.connectionType === "lan" ? "the same network" : ctx.connectionType === "wifi" ? "Wi-Fi" : "the internet"}${speedStr}! 🎉${filesStr} Pretty smooth, right?`;
  },

  roast: (ctx) => {
    if (!ctx.connected) {
      return "Wow, still not connected? Even a carrier pigeon would've arrived by now. Maybe try turning it off and on again? 🐦";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    if (speed > 0 && speed < 1) {
      return `${speed.toFixed(2)} MB/s?! My grandma's dial-up modem is calling — it wants its speed back. At this rate you'll finish transferring by next century. 🐢`;
    }
    if (ctx.totalFiles === 0) {
      return "Connected and doing absolutely nothing. Classic. You set up this whole P2P connection just to stare at the screen? Impressive dedication to wasting technology. 🙄";
    }
    return `Oh look at you, ${ctx.totalFiles} file(s) transferred like a big shot. Hope none of them were your 47 copies of the same blurry photo. 📸`;
  },

  sarcasm: (ctx) => {
    if (!ctx.connected) {
      return "Oh sure, just keep waiting. I'm sure the connection will establish itself any second now. It's not like you could have just used a USB drive or something. 🙃";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr = speed > 0 ? ` Oh wow, ${speed.toFixed(2)} MB/s. Absolutely revolutionary.` : "";
    return `Wow, a peer-to-peer file transfer. How incredibly cutting-edge.${speedStr} I'm sure inventing the internet was totally worth it for this moment. ${ctx.totalFiles > 0 ? `${ctx.totalFiles} files. Amazing achievement, truly.` : "And you haven't even sent anything yet. Peak efficiency."} 👏`;
  },

  cricket: (ctx) => {
    if (!ctx.connected) {
      return "And the players are still in the dressing room, folks! The pitch is being prepared — we're awaiting the big connection. The crowd is restless! 🏏";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr =
      speed > 0
        ? speed > 5
          ? `It's flying at ${speed.toFixed(1)} MB/s — SIX! Over the boundary!`
          : speed > 2
          ? `A solid ${speed.toFixed(1)} MB/s — that's a safe two runs!`
          : `A careful ${speed.toFixed(1)} MB/s — he's playing it defensively.`
        : "The batsman is taking a moment to assess the field.";
    return `AND HE'S CONNECTED! The stadium erupts! ${speedStr} ${ctx.totalFiles > 0 ? `${ctx.totalFiles} file(s) transferred — each one a boundary! What a performance!` : "No files yet but the partnership looks strong!"} Magnificent display from both ends, Ravi! 🏏🎙️`;
  },

  epic: (ctx) => {
    if (!ctx.connected) {
      return "In the vast digital darkness, two machines reach out across the void… waiting… searching… for that one fateful moment of connection. The universe holds its breath. 🌌";
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr =
      speed > 0
        ? `At ${speed.toFixed(2)} MB/s, data surges like a river unleashed from ancient glaciers. `
        : "";
    return `Against all odds, the connection held. ${speedStr}Packets brave the treacherous seas of the internet, carrying their precious cargo to distant shores. ${ctx.totalFiles > 0 ? `${ctx.totalFiles} file(s) — each a story, each a small piece of someone's digital soul — now safely delivered.` : "The channel stands ready, awaiting the first brave file to begin its heroic journey."} This… is file sharing. ⚡🌊`;
  },

  news: (ctx) => {
    const now = ctx.clientTime || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (!ctx.connected) {
      return `BREAKING: ${now} IST — Sources confirm that a peer-to-peer connection is being attempted. Live coverage continues as we await developments. Our correspondent on the ground reports no files have been exchanged. Stay with us for minute-by-minute updates. 📺`;
    }
    const speed = ctx.downloadSpeed > 0 ? ctx.downloadSpeed : ctx.uploadSpeed;
    const speedStr = speed > 0 ? ` Experts confirm transfer speeds of ${speed.toFixed(2)} MB/s.` : "";
    return `BREAKING NEWS ${now} IST — A ${ctx.connectionType === "lan" ? "local network" : ctx.connectionType === "wifi" ? "Wi-Fi" : "remote internet"} peer connection has been SUCCESSFULLY ESTABLISHED.${speedStr} ${ctx.totalFiles > 0 ? `${ctx.totalFiles} file(s) have been confirmed transferred, officials say.` : "No files have been exchanged yet, but authorities assure the situation is under control."} More updates as the story develops. 📢`;
  },
};

export async function POST(request) {
  const body = await request.json();
  const { mode = "casual", connectionState, connectionType, downloadSpeed, uploadSpeed, totalFiles, fileNames, clientTime } = body;

  const ctx = {
    connected: connectionState === "connected",
    connectionType: connectionType || "unknown",
    downloadSpeed: Number(downloadSpeed) || 0,
    uploadSpeed: Number(uploadSpeed) || 0,
    totalFiles: Number(totalFiles) || 0,
    fileNames: fileNames || [],
    clientTime: typeof clientTime === "string" ? clientTime : null,
  };

  const generator = TEMPLATES[mode] || TEMPLATES.casual;
  const text = generator(ctx);

  return new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
