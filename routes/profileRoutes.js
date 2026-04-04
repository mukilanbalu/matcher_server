const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require('multer');

// Configure multer to store files in memory for direct Supabase upload
const upload = multer({ storage: multer.memoryStorage() });
const fp = upload.fields([{ name: 'profileImage' }, { name: 'astroImage', maxCount: 1 }]);

const jwtCheck = require("../middlewares/authVerify");

// Profile retrieval and manipulation
router.post("/get-profile", jwtCheck, profileController.getProfile);
router.post("/profiles/search", jwtCheck, profileController.getProfiles);
router.post("/profile", jwtCheck, fp, profileController.createProfile);
router.patch("/profiles", jwtCheck, fp, profileController.editProfile);

module.exports = router;

