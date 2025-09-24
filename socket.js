let io;

const init = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server);

  return io;
};

const getIo = () => {
  return io;
};
module.exports = { init, getIo };
