const express = require("express");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const socialRoutes = require("./modules/social/social.routes");
const reviewRoutes = require("./modules/review/review.routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/api/social", socialRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

module.exports = app;