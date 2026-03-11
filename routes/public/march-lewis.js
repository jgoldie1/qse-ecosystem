const express = require("express");
const router = express.Router();
const dashboardEngine = require("../../core/engines/dashboard-engine");

router.get("/stats", (_req, res) => {
  res.json(dashboardEngine.getMarchLewisStats());
});

router.get("/services", (_req, res) => {
  res.json([
    "Recruitment",
    "Staffing",
    "Employer Intake",
    "Candidate Intake",
    "Onboarding"
  ]);
});

module.exports = router;
