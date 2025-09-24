const express = require("express");
const { paystackCallback, paystackWebhook } = require("./payment");

const Router = express.Router();

Router.post("/webhook", paystackWebhook);
Router.get("/callback", paystackCallback);

module.exports = Router;
