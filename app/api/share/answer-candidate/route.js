import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function POST(request) {
  await startMongodb();

  const { shareId, candidate } = await request.json();

  if (!shareId || !candidate) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = await ShareSession.findOneAndUpdate(
    { shareId },
    { $push: { answerCandidates: candidate } },
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
