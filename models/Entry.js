const mongoose = require("mongoose");
const { Schema } = mongoose;

const entrySchema = new Schema({
  customerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  entries: [
    {
      type: { type: String, enum: ["Paid", "Got"], required: true },
      amount: { type: Number, required: true },
      details: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  balance: {
    totalAmount: { type: Number, required: true },
    type: { type: String, enum: ["Paid", "Got", "Settled"] },
  },
});

module.exports = mongoose.model("Entry", entrySchema);
