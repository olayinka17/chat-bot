const mongoose = require("mongoose");
const shortid = require("shortid");

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  device_id: {
    type: String,
    required: true,
  },
  items: [
    {
      menu_item: {
        type: mongoose.Schema.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: Number,
    },
  ],
  status: {
    type: String,
    enum: ["pending", "successful", "cancelled"],
    default: "pending",
  },
  transaction_id: {
    type: String,
    ref: "transaction",
  },
  payment_status: {
    type: String,
    enum: ["successful", "unsuccesful", "cancelled", "pending"],
    default: "pending",
  },
  total_price: Number,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("order", OrderSchema);

module.exports = Order;
