const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MonthSchema = new Schema({
  month: { type: String, required: true }, // "Jan", "Feb", etc.
  interestAmt: { type: Number, required: true }, // Interest amount for that month
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" }, // Payment status
  paidDate: { type: Date, default: null }, // Store the date when the payment is completed
});


const YearSchema = new Schema({
  year: { type: Number, required: true }, // Year like 2024, 2025
  months: [MonthSchema], // Array of month objects
});



const interestTrackingSchema = new Schema(
  {
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    }, // Reference to Customer
    tracking: [YearSchema], // Array of years with monthly details
    totalInterestPaid: { type: Number, default: 0 }, // Keeps track of total interest paid
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterestTracking", interestTrackingSchema);
