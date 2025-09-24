const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CartSchema = new Schema({
  device_id: String,
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
});

const Cart = mongoose.model("cart", CartSchema);

module.exports = Cart;
