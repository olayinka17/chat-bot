const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

const DBConnection = () => {
  mongoose.connect(MONGO_URI);

  mongoose.connection.on("connected", () => {
    console.log("Connection to db successfully");
  });

  mongoose.connection.on("error", () => {
    console.log("An error occured while connecting to the db");
  });
};

module.exports = DBConnection;
