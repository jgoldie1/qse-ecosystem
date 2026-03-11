const express = require("express");
const router = express.Router();

router.get("/status", (_req, res) => {
  res.json({
    system: "QSE Core",
    status: "active",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
