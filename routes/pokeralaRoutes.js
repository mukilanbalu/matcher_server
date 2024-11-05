const express = require("express");
const router = express.Router();
const pokeralaController = require("../controllers/prokeralaController");



router.post("/getToken", pokeralaController.getToken);
router.get("/getMatch", pokeralaController.getPorutham);

// router.delete("/profiles/:email", profileController.deleteProfile)

module.exports = router;

