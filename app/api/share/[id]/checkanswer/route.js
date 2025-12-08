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

    if (!session || !session.answer) {
      return Response.json({ found: false }, { status: 200 });
    }

    return Response.json(
      {
        found: true,
        session,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ found: false }, { status: 500 });
  }
}
