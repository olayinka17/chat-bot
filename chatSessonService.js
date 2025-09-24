const Order = require("./models/order");
const Item = require("./models/mealItems");
const Cart = require("./models/cart");
const Transaction = require("./models/transaction");
const axios = require("axios");
require("dotenv").config();

class Chats {
  // constructor() {

  // }
  // async createMenu() {

  // }
  async getAllMenu() {
    const menu = await Item.find();
    // console.log(menu)
    return {
      status: "success",
      data: menu,
    };
  }
  async manageCart(deviceId, menu, qty, isRemove = false) {
    const cart = await Cart.findOne({ device_id: deviceId });
    if (cart) {
      if (isRemove) {
        const items = cart.items.filter((item) => {
          item.menu_item !== menu.id;
        });
        cart.items = items;
      } else {
        const cartIndex = cart.items.findIndex((item) => {
          return item === menu.id;
        });
        if (cartIndex > -1) {
          cart.items[cartIndex].quantity = qty;
        } else {
          cart.items.push({
            menu_item: menu.id,
            price: menu.price,
            quantity: qty,
          });
        }
      }
      return await cart.save();
    } else {
      console.log(menu.id);
      return await Cart.create({
        device_id: deviceId,
        items: [{ menu_item: menu.id, quantity: qty, price: menu.price }],
      });
    }
  }

  async createOrder(deviceId) {
    const cart = await Cart.findOne({ device_id: deviceId });
    //console.log(cart);
    if (cart) {
      let total_price = 0;
      let cartItems = cart.items;
      //console.log(cartItems);
      if (cartItems.length > 0) {
        total_price = cartItems.reduce((prev, curr) => {
          const qty = curr.quantity ?? 1;
          return prev + curr.price * qty;
        }, 0);

        const order = await Order.create({
          device_id: deviceId,
          total_price,
          status: "pending",
          items: cartItems,
        });
        cart.items = [];
        await cart.save();

        const transaction = await Transaction.create({
          amount: order.total_price,
          status: "pending",
          order_id: order._id,
        });

        const data = {
          amount: transaction.amount * 100,
          email: "customer@order.com",
          reference: transaction._id,
        };

        const headers = {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        };
        console.log(headers);
        const response = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          data,
          { headers }
        );
        const paymentUrl = response.data.data.authorization_url;
        return {
          status: "success",
          data: {
            order,
            paymentUrl,
          },
        };
      }
    }

    // console.log(total_price);

    return {
      status: "fail",
      message: "You are yet to add to cart.",
    };
  }

  async getAllOrders(deviceId) {
    const orders = await Order.find({ device_id: deviceId });
    console.log(orders);
    // if (!orders) {
    //   return {
    //     status: "fail",
    //     message: "No past orders found",
    //   };
    // }
    return {
      status: "success",
      data: {
        orders,
      },
    };
  }

  async getOrder(orderId) {
    const order = await Order.findOne({ _id: orderId }).populate({
      path: "items.menu_item",
      select: "name",
    });
    //console.log(order)
    if (!order) {
      return {
        status: "fail",
        message: "No order has been created",
      };
    }
    return {
      status: "success",
      data: {
        order,
      },
    };
  }

  async cancelOrder(orderId) {
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return {
        status: "fail",
        message: "you have no order to cancelled",
      };
    }

    if (
      order.status === "successful" ||
      order.payment_status === "successful"
    ) {
      return {
        status: "fail",
        message: "sorry you can't cancelled paid order.",
      };
    }
    order.status = "cancelled";
    order.payment_status = "cancelled";
    await order.save();

    return {
      status: "success",
      message: "Order cancelled successfully",
    };
  }

  async getCart(deviceId) {
    const cart = await Cart.findOne({ device_id: deviceId }).populate({
      path: "items.menu_item",
      select: "name",
    });

    if (!cart) {
      return {
        status: "fail",
        message: "Your cart is empty",
      };
    }

    return {
      status: "success",
      data: {
        cart,
      },
    };
  }
}

module.exports = Chats;
