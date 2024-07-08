const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const fileUpload = require("../middlewares/file-upload");



router.get("/profile", profileController.getProfile);
router.post("/profiles/search", profileController.getProfiles);
router.post("/profile", profileController.createProfile);
router.patch("/profiles", profileController.editProfile);
// router.delete("/profiles/:email", profileController.deleteProfile)

module.exports = router;

