const path = require("path");
const express = require("express");
const cors = require("cors")
const paymentRouter = require('./payment.route')

const app = express();

app.use(cors("*"))
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use('/api/v1/payment', paymentRouter)
module.exports = app;
