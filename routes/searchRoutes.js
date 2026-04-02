const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.post("/search", profileController.getProfiles);
router.get("/matches", profileController.getProfiles);
router.get("/matches/:id", profileController.getProfiles);

module.exports = router;
