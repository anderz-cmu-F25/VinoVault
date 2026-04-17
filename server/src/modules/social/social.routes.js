const express = require("express");
const {
  getNotificationPreference,
  updateNotificationPreference,
} = require("./notification-preference/notificationPreference.controller");

const router = express.Router();

router.get("/notification-preferences", getNotificationPreference);
router.patch("/notification-preferences", updateNotificationPreference);

module.exports = router;