This respository is a number based chat-bot for a restuarant. user need to Select 1 to Place an order, Select 99 to checkout order, Select 98 to see order history, Select 97 to see current order, and Select 0 to cancel order.
The app use redis that has 2 hours TTL, to store user session so the user can have a history of the message for a particular session. I used redis because websocket(socket.io) does not live after reloads and i 
implemented paystack that will take the user to pay for their order and the chat page will reload. I used MongoDB to store user order history and the restuarant menus, i also used socket.io for bi-directional connection 
between the user and the bot.
