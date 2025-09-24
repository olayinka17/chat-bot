const client = require("./cache");

const  persistEvent = async (deviceId, type, event, payload) => {
  const msg = {
    type,
    event,
    payload,
    ts: Date.now(),
  };

  await client.rPush(`chat:${deviceId}`, JSON.stringify(msg));
  await client.expire(`chat:${deviceId}`, 7200);
};


module.exports = persistEvent