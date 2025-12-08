import mongoose from "mongoose";

const ShareSessionSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    sender: {
      ip: String,
      userAgent: String,
      deviceName: String,
    },

    receiver: {
      ip: String,
      userAgent: String,
      deviceName: String,
    },

    offer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    offerCandidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    answerCandidates: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "created",
        "offer-received",
        "answer-received",
        "ice-exchange",
        "connected",
      ],
      default: "created",
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 1000 * 60 * 60),
    },
  },
  { timestamps: true }
);

ShareSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ShareSession =
  mongoose.models.ShareSession ||
  mongoose.model("ShareSession", ShareSessionSchema);

export default ShareSession;
