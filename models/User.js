const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  customer: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
});

module.exports = mongoose.model("User", userSchema);