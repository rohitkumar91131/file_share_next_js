import { NextResponse } from "next/server";
import startMongodb from "@/lib/startMongodb";
import ShareSession from "@/models/ShareSession";

export async function POST(req) {
  try {
    // 1. Connect DB
    await startMongodb();

    // 2. Parse Body
    const body = await req.json();
    const { shareId, offer } = body;

    if (!shareId || !offer) {
      return NextResponse.json(
        { message: "Missing shareId or offer" },
        { status: 400 }
      );
    }

    // 3. Find Session and Update Offer
    // Hum session dhund kar usme 'offer' field set kar rahe hain
    // Aur status update kar rahe hain taaki Sender ko pata chale
    const updatedSession = await ShareSession.findOneAndUpdate(
      { shareId: shareId },
      { 
        $set: { 
          offer: offer, // SDP object save karo
          status: "offer-created" // Status change zaroori hai
        } 
      },
      { new: true } // Return updated document
    );

    if (!updatedSession) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Offer saved successfully", session: updatedSession },
      { status: 200 }
    );

  } catch (error) {
    console.error("API Error saving offer:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}