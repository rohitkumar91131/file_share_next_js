import { NextResponse } from "next/server";
import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function POST(req) {
  try {
    await startMongodb();
    const body = await req.json();
    const { shareId, candidate } = body;

    if (!shareId || !candidate) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // ICE candidates array me push karne hain
    await ShareSession.findOneAndUpdate(
      { shareId: shareId },
      { $push: { offerCandidates: candidate } } // 'offerCandidates' schema me hona chahiye
    );

    return NextResponse.json({ message: "Candidate added" }, { status: 200 });

  } catch (error) {
    console.error("API ICE Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}