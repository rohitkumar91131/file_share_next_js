import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function POST(request) {
  await startMongodb();

  const { shareId, answer } = await request.json();

  if (!shareId || !answer) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await ShareSession.findOneAndUpdate(
    { shareId },
    { answer, status: "answer-received" },
    { new: true }
  );

  if (!session) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
