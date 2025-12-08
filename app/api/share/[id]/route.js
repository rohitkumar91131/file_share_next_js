import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function GET(request, context) {
  // Turbopack: params is a Promise → must await
  const { id } = await context.params;

  await startMongodb();

  if (!id) {
    return new Response(
      JSON.stringify({ session: null, error: "No session ID" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const session = await ShareSession.findOne({ shareId: id }).lean();

  if (!session) {
    return new Response(
      JSON.stringify({ session: null, error: "Session not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ session }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
