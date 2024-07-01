const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const fileUpload = require("../middlewares/file-upload");



router.get("/profile", profileController.getProfile);
router.post("/profiles/search", profileController.getProfiles);
router.post("/profile",
    fileUpload.fields([
        { name: 'profile_img', maxCount: 3 },
        { name: 'astro_img', maxCount: 1 }
    ]), profileController.createProfile);
router.patch("/profiles", fileUpload.fields([
    { name: 'profile_img', maxCount: 3 },
    { name: 'astro_img', maxCount: 1 }
]), profileController.editProfile);
// router.delete("/profiles/:email", profileController.deleteProfile)

module.exports = router;

