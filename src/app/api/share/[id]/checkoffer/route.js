import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function GET(request, ctx) {
  const { id } = await ctx.params;

  await startMongodb();

  if (!id) {
    return Response.json({ found: false }, { status: 400 });
  }

  try {
    const session = await ShareSession.findOne({ shareId: id }).lean();

    if (!session || !session.offer) {
      return Response.json({ found: false }, { status: 200 });
    }

    // full session with offer + offerCandidates + answerCandidates etc
    return Response.json(
      {
        found: true,
        session,  // <-- full session returned
      },
      { status: 200 }
    );
  } catch (err) {
    return Response.json({ found: false, error: "DB error" }, { status: 500 });
  }
}
