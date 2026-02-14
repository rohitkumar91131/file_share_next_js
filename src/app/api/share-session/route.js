import { NextResponse } from "next/server"
import startMongodb from "@/lib/startMongodb"
import ShareSession from "@/models/ShareSession"

export async function POST(req) {
  const body = await req.json()
  const { shareId, type } = body

  if (!shareId || !type) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 })
  }

  await startMongodb()

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"

  const userAgent = req.headers.get("user-agent") || "unknown"

  let session = await ShareSession.findOne({ shareId })

  if (!session) {
    session = await ShareSession.create({
      shareId,
      offerer: { ip, userAgent },
      offerCandidates: [],
      answerCandidates: []
    })
  }

  if (session.expired) {
    return NextResponse.json({ error: "session expired" }, { status: 410 })
  }

  if (type === "offer") {
    session.offer = body.offer
    session.status = "offer-received"
    session.offerer = { ip, userAgent }
  }

  if (type === "answer") {
    session.answer = body.answer
    session.status = "answer-received"
    session.answerer = { ip, userAgent }
  }

  if (type === "offer-candidate") {
    session.offerCandidates.push(body.candidate)
    session.status = "ice-exchange"
  }

  if (type === "answer-candidate") {
    session.answerCandidates.push(body.candidate)
    session.status = "ice-exchange"
  }

  if (Date.now() > session.expiresAt.getTime()) {
    session.expired = true
    session.status = "expired"
  }

  await session.save()

  return NextResponse.json({ ok: true })
}
