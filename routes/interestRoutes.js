const express = require("express");
const router = express.Router();
const interestController = require("../controllers/interestController");
const jwtCheck = require("../middlewares/authVerify");

router.use(jwtCheck);

router.post("/send", interestController.sendInterest);
router.get("/list", interestController.getInterests);
router.patch("/update", interestController.updateInterestStatus);

module.exports = router;
