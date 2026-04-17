const express = require("express");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const socialRoutes = require("./modules/social/social.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/social", socialRoutes);

module.exports = app;