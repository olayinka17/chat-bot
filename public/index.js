function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

const socket = io("", {
  auth: {
    deviceId: getDeviceId(),
    orderId: localStorage.getItem("lastOrderId"),
  },
});

const messageContainer = document.getElementById("message-container");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");

socket.on("server-welcome", (data) => {
  // const msg = document.createElement("div");
  // msg.className = "bot-msg";
  // msg.innerHTML = data.payload;
  addMessageToUI(false, data.payload, data.ts);
});
socket.on("server-error", (data) => {
  addMessageToUI(false, data.payload, data.ts);
});
socket.on("client-history-chats", ({ payload, ts }) => {
  addMessageToUI(true, payload, ts);
});

socket.on("error", (data) => {
  addMessageToUI(false, data.payload, data.ts);
});

// socket.on("orders", (data) => {
//   addMessageToUI(false, data);
// });
socket.on("payment_successful", (data) => {
  addMessageToUI(false, data.payload, data.ts);
});
socket.on("payment_failed", (data) => {
  console.log(data);
  addMessageToUI(false, data.payload, data.ts);
});
socket.on("created-order", (data) => {
  window.location.href = data.paymentUrl;
  localStorage.setItem("lastOrderId", data.order._id);
});

// socket.on("current-order", (data) => {
//   addMessageToUI(false, data);
// });
socket.on("cancelled", (data) => {
  addMessageToUI(false, data.payload, data.ts);
});

socket.on("menus", (data) => {
  //menuList(data);
  addMessageToUI(false, menuList(data.payload), data.ts);
});

const menuList = (data) => {
  let html = "";
  console.log(data);
  data.forEach((menu) => {
    console.log(menu._id);
    html += `
      <div class="menu-item"  data-id="${menu._id}" data-price="${menu.price}" >
        <h3>${menu.name}</h3>
        <p>₦${menu.price}</p>
        <button class="decrease">-</button>
        <button class="increase">+</button>
      </div>
    `;
  });
  return html;
};

socket.on("view-cart", (data) => {
  addMessageToUI(false, cart(data.payload), data.ts);
});

const cart = (data) => {
  let total = 0;
  let html = `
    <div class="cart-box">
      <h3>Your Cart</h3>
      <ul class="cart-list">
  `;
  console.log(data);
  data.items.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    html += `
      <li class="cart-item">
        <span class="cart-name">${item.menu_item.name}</span>
        <span class="cart-qty">x${item.quantity}</span>
        <span class="cart-price">₦${subtotal}</span>
      </li>
    `;
  });

  html += `
      </ul>
      <div class="cart-total">
        <b>Total: ₦${total}</b>
      </div>
    </div>
  `;

  return html;
};
const manageCart = (menu, qty) => {
  socket.emit("manage-cart", { menu, qty });
};

const Order = (data) => {
  console.log(data);
  return `
    <div class="receipt">
      <h3>🧾 Order Receipt</h3>
      <p><strong>Order ID:</strong> ${data._id}</p>
      <p><strong>Date:</strong> ${moment(data.created_at).format(
        "YYYY-MM-DD HH:mm"
      )}</p>
      <p><strong>Order Status:</strong> ${data.status}</p>
      <p><strong>Payment Status:</strong> ${data.payment_status}</p>
      <hr>
      <ul class="receipt-items">
        ${data.items
          .map(
            (item) => `
            <li>
              ${item.menu_item.name} (x${item.quantity}) - ₦${
              item.price * item.quantity
            }
            </li>`
          )
          .join("")}
      </ul>
      <hr>
      <p><strong>Total:</strong> ₦${data.total_price}</p>
    </div>
  `;
};

socket.on("order", (data) => {
  addMessageToUI(false, Order(data.payload), data.ts);
});

const orderHistory = (data) => {
  if (!data || data.length === 0) {
    return `<p><b>No past orders found.</b></p>`;
  }
  let html = `
    <div class="history-box">
      <h3>📦 Order History</h3>
      <ul class="history-list">
  `;

  data.forEach((order) => {
    // compute total from items
    let total = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    html += `
      <li class="history-item" data-id="${order._id}">
        <div class="history-header">
          <span class="history-id">#${order._id}</span>
          <span class="history-date">${moment(order.created_at).format(
            "DD/MM/YYYY HH:mm"
          )}</span>
        </div>
        <div class="history-body">
          <span class="history-total">₦${total}</span>
          <span class="history-status ${order.status.toLowerCase()}">${
      order.status
    }</span>
        </div>
      </li>
    `;
  });

  html += `</ul></div>`;
  return html;
};

socket.on("order-history", (data) => {
  addMessageToUI(false, orderHistory(data.payload), data.ts);

  document.querySelectorAll(".history-item").forEach((item) => {
    item.addEventListener("click", () => {
      const orderId = item.getAttribute("data-id");
      socket.emit("get-order-details", { id: orderId });
    });
  });
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});
const sendMessage = () => {
  if (messageInput.value === "") return;

  const data = { sent: messageInput.value, datetime: Date.now() };
  console.log(data);
  socket.emit("session", data.sent);
  addMessageToUI(true, data.sent);
  console.log(data.sent);
  messageInput.value = "";
};

const addMessageToUI = (isOwnedMessage, data, ts = Date.now()) => {
  const time = moment(ts).format("hh:mm A");

  const element = `
      <li class="${isOwnedMessage ? "message-right" : "message-left"}">
        <p class="message">
          ${data}
          <span> • ${time}</span>
        </p>
      </li>`;
  messageContainer.innerHTML += element;
  messageContainer.scrollTo(0, messageContainer.scrollHeight);

  const menuItem = document.querySelectorAll(".menu-item");
  menuItem.forEach((item) => {
    let qty = 0;

    // const qtyEl = item.querySelector(".qty");
    const incBtn = item.querySelector(".increase");
    const decBtn = item.querySelector(".decrease");

    incBtn.addEventListener("click", () => {
      qty++;
      //  qtyEl.textContent = qty;
      //   socket.emit('add-to-cart', ())
      manageCart(
        {
          id: item.dataset.id,
          price: item.dataset.price,
        },
        qty
      );
    });

    decBtn.addEventListener("click", () => {
      if (qty > 0) {
        qty--;
        // qtyEl.textContent = qty;

        manageCart(
          {
            id: item.dataset.id,
            price: item.dataset.price,
          },
          qty
        );
      } else {
        socket.emit("remove-menu", { id: item.dataset.id });
      }
    });
  });
};
