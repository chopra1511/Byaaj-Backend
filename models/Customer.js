const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    interest: { type: Number, default: 0 },
    entries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entry" }],
    interestTracking: [
      { type: mongoose.Schema.Types.ObjectId, ref: "InterestTracking" },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);
