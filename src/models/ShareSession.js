import mongoose from "mongoose"

const ShareSessionSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    offerer: {
      ip: String,
      userAgent: String,
      deviceName: String
    },

    answerer: {
      ip: String,
      userAgent: String,
      deviceName: String
    },

    offer: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    offerCandidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    answerCandidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },

    status: {
      type: String,
      enum: [
        "created",
        "offer-received",
        "answer-received",
        "ice-exchange",
        "connected",
        "expired"
      ],
      default: "created"
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 5)
    },

    expired: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const ShareSession =
  mongoose.models.ShareSession ||
  mongoose.model("ShareSession", ShareSessionSchema)

export default ShareSession
