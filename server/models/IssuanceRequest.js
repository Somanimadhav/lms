const mongoose = require("mongoose"); // <-- This was missing!

const IssuanceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "returned"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
});

const IssuanceRequest = mongoose.model(
  "IssuanceRequest",
  IssuanceRequestSchema
);
module.exports = IssuanceRequest;
