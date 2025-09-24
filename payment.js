const Transaction = require("./models/transaction");
const Order = require("./models/order");
const persistEvent = require("./persist");
const { getIo } = require("./socket");

const paystackWebhook = async (req, res) => {
  body = req.body;

  const transaction = await Transaction.findOne({
    _id: body.data.reference,
    status: "pending",
  });

  if (!transaction) {
    return {
      status: "fail",
      message: "No transaction was found",
    };
  }
  const io = getIo();
  if (body.event === "charge.success") {
    const order = await Order.findOne({ _id: transaction.order_id });
    if (order) {
      order.payment_status = "successful";
      order.status = "successful";
      await order.save();
    }

    transaction.status = "success";
    await transaction.save();
    const message = "Your order was successful";
    io.emit("payment_successful", { payload: message, ts: Date.now() });

    await persistEvent(
      order.device_id,
      "server",
      "payment_successful",
      message
    );
  }

  if (body.event === "charge.failed") {
    const order = await Order.findOne({ _id: transaction.order_id });

    if (order) {
      order.payment_status = "unsuccesful";
      order.status = "failed";
      await order.save();
    }

    transaction.status = "failed";
    await transaction.save();
    io.emit("payment_failed", { message: "Payment failed.", ts: Date.now() });
    await persistEvent(order.device_id, "server", "payment_failed", message);
  }

  res.status(200).json({
    message: "webhook received",
  });
};

const paystackCallback = async (req, res) => {
  res.redirect("/");
};

module.exports = { paystackWebhook, paystackCallback };
