const express = require("express");
const router = express.Router();
const dashboardEngine = require("../../core/engines/dashboard-engine");

router.get("/stats", (_req, res) => {
  res.json(dashboardEngine.getSculptifyStats());
});

router.get("/services", (_req, res) => {
  res.json([
    "Body Sculpting",
    "Massage Therapy",
    "Acupuncture",
    "Acupressure",
    "Reiki"
  ]);
});

module.exports = router;
