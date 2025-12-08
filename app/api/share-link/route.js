import { v4 as uuidv4 } from "uuid";
import ShareSession from "../../../models/ShareSession";
import startMongodb from "../../../lib/startMongodb";

export async function POST() {
  await startMongodb();

  const id = uuidv4();

  const session = await ShareSession.create({
    shareId: id,
    status: "created",
  });

  console.log("Created share session with ID:", id);
  console.log("Session details:", session);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const link = `${baseUrl}/share/${id}`;

  return new Response(JSON.stringify({ link, shareId: id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
