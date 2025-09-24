const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MenuItemSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minLength: [2, "Item name should not be less than 2 characters"],
    maxLength: [100, "Item name should not be more than 100 characters"],
  },
  price: {
    type: Number,
    allowNull: false,
    required: true,
    min: [1, "Price should not be lower than $1"],
    max: [10000, "Price should not be more than $10000"],
  },
  created_at: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

const Item = mongoose.model("MenuItem", MenuItemSchema);

module.exports = Item;
