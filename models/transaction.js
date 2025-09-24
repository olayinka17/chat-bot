const mongoose = require("mongoose");
const shortid = require("shortid");

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  created_at: { type: Date, default: new Date() },
  amount: { type: Number, required: 0 },
  order_id: { type: String, required: true, ref: "Order" },
  status: {
    type: String,
    required: true,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
});

const Transaction = mongoose.model("Transactions", TransactionSchema);

module.exports = Transaction;