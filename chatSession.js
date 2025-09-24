const ChatService = require("./chatSessonService");
const persistEvent = require("./persist");

const Service = new ChatService();
class ChatSession {
  constructor({ io }) {
    this.io = io;
  }

  async getallMenu(deviceId) {
    const response = await Service.getAllMenu();

    await persistEvent(deviceId, "server", "menus", response.data);

    this.io.emit("menus", { payload: response.data, ts: Date.now() });
  }

  async getCart(deviceId) {
    const response = await Service.getCart(deviceId);

    if (response.status === "fail") {
      await persistEvent(deviceId, "server", "error", {
        payload: response.message,
        ts: Date.now(),
      });
      this.io.emit("error", { payload: response.message, ts: Date.now() });
    } else {
      await persistEvent(deviceId, "server", "view-cart", response.data.cart);
      this.io.emit("view-cart", {
        payload: response.data.cart,
        ts: Date.now(),
      });
    }
  }
  async addToCart(deviceId, menu, qty) {
    const response = await Service.manageCart(deviceId, menu, qty);
    this.io.emit("cart", response);
  }

  async removeFromCart(deviceId, menu) {
    const response = await Service.manageCart(deviceId, menu, 0, true);

    this.io.emit("cart", response);
  }

  async createOrder(deviceId) {
    const response = await Service.createOrder(deviceId);
    if (response.status === "fail") {
      
      const message = response.message;
      await persistEvent(deviceId, "server", "error", message);
      this.io.emit("error", { payload: message, ts: Date.now() });
    } else {

      this.io.emit("created-order", response.data);
    }
  }

  async getAllOrders(deviceId) {
    const response = await Service.getAllOrders(deviceId);
    await persistEvent(
      deviceId,
      "server",
      "order-history",
      response.data.orders
    );
    this.io.emit("order-history", {
      payload: response.data.orders,
      ts: Date.now(),
    });
  }

  async cancelOrder(orderId, deviceId) {
    const response = await Service.cancelOrder(orderId);

    if (response.status === "fail") {
      await persistEvent(deviceId, "server", "error", {
        payload: response.message,
        ts: Date.now(),
      });
      this.io.emit("error", { payload: response.message, ts: Date.now() });
    } else {
      await persistEvent(deviceId, "server", "cancelled", {
        payload: response.message,
        ts: Date.now(),
      });
      this.io.emit("cancelled", { payload: response.message, ts: Date.now() });
    }
  }

  async getOrder(orderId, deviceId) {
    const response = await Service.getOrder(orderId);

    if (response.status === "fail") {
      await persistEvent(deviceId, "server", "error", {
        payload: response.message,
        ts: Date.now(),
      });
      this.io.emit("error", { payload: response.message, ts: Date.now() });
    } else {
      await persistEvent(deviceId, "server", "order", response.data.order);
      this.io.emit("order", { payload: response.data.order, ts: Date.now() });
    }
  }
}

module.exports = ChatSession;
