const express = require("express");
const router = express.Router();
const profileRoutes = require("./profileRoutes");
const searchRoutes = require("./searchRoutes");
const interestRoutes = require("./interestRoutes");
const doc = require("../apiDoc.json");
const jwtCheck = require("../middlewares/authVerify")

router.get("/", (req, res) => res.status(200).send(doc))

router.use(jwtCheck)
router.use(profileRoutes)
router.use(searchRoutes)
router.use("/interests", interestRoutes)


module.exports = router;