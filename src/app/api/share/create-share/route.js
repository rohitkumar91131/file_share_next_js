import { v4 as uuidv4 } from "uuid";
import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function POST() {
  await startMongodb();

  const id = uuidv4();

  await ShareSession.create({
    shareId: id,
    status: "created",
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const link = `${baseUrl}/share/${id}`;

  return new Response(JSON.stringify({ link, shareId: id }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
