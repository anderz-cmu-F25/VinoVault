const express = require("express");
const {
  getNotificationPreference,
  updateNotificationPreference,
} = require("./notification-preference/notificationPreference.controller");
const { authMiddleware } = require("../../common/middleware/auth.middleware");

const router = express.Router();

router.get("/notification-preference", authMiddleware, getNotificationPreference);
router.patch("/notification-preference", authMiddleware, updateNotificationPreference);

router.get("/test", (req, res) => {
  res.json({ message: "social route works" });
});

module.exports = router;