const app = require("./app");
const DBConnection = require("./db");
const ChatSession = require("./chatSession");
const client = require("./cache");
const persistEvent = require("./persist");
require("dotenv").config();

const PORT = process.env.PORT;

DBConnection();
client;

const menuInstructions = `
<b>📋 Menu Options</b><br>
1️⃣ <b>View Menu</b><br>
99️⃣ <b>Create New Order</b><br>
98️⃣ <b>View Order History</b><br>
97️⃣ <b>Track Current Order</b><br>
96️⃣ <b>View Cart</b><br>
0️⃣ <b>Cancel Current Order</b>
`;
const History = async (socket, deviceId) => {
  const history = await client.lRange(`chat:${deviceId}`, 0, -1);

  if (history.length === 0) {
    const welcomeMessage = `👋 Welcome! How can I help you today?\n${menuInstructions}`;
    socket.emit("server-welcome", { payload: welcomeMessage, ts: Date.now() });

    await persistEvent(deviceId, "server", "server-welcome", welcomeMessage);
    return;
  }
  for (const item of history) {
    const { type, event, payload, ts } = JSON.parse(item);

    if (type === "server") {
      socket.emit(event, { payload, ts });

    } else if (type === "client") {
      socket.emit("client-history-chats", { event, payload, ts });
    }
  }
};
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

const { init } = require("./socket");

const io = init(server);

io.on("connection", async (socket) => {
  const chatSession = new ChatSession({ io });
  socket.deviceId = socket.handshake.auth.deviceId;
  socket.orderId = socket.handshake.auth.orderId;
  await client.del(`chat:${socket.deviceId}`);


  await History(socket, socket.deviceId);

  socket.on("session", async (data) => {
    await persistEvent(socket.deviceId, "client", "session", data);

    switch (data) {
      case "1":
        chatSession.getallMenu(socket.deviceId);

        console.log("yes");
        break;
      case "99":
        chatSession.createOrder(socket.deviceId);
        break;
      case "98":
        chatSession.getAllOrders(socket.deviceId);
        break;
      case "97":
        chatSession.getOrder(socket.orderId, socket.deviceId);
        break;
      case "96":
        chatSession.getCart(socket.deviceId);
        break;
      case "0":
        chatSession.cancelOrder(socket.orderId, socket.deviceId);
        console.log("i dont know");
        break;
      default:
        const errorMessage = `❌ Invalid input.\n${menuInstructions}`;
        socket.emit("server-error", { payload: errorMessage, ts: Date.now() });
        await persistEvent(
          socket.deviceId,
          "server",
          "server-error",
          errorMessage
        );
    }
  });

  socket.on("manage-cart", (data) => {
    const menu = data.menu;
    const qty = data.qty;

    chatSession.addToCart(socket.deviceId, menu, qty);
  });

  socket.on("remove-menu", (data) => {
    chatSession.removeFromCart(socket.id, data);
  });

  socket.on("get-order-details", (data) => {
    chatSession.getOrder(data.id);
  });

  socket.on("diconnect", () => {});
});
