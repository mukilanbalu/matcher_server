const express = require("express");
const router = express.Router();
const authRoutes = require("./authRoutes");
const profileRoutes = require("./profileRoutes");
const searchRoutes = require("./searchRoutes");
const pokeralaRoutes = require("./pokeralaRoutes");
const doc = require("../apiDoc.json");
const jwtCheck = require("../middlewares/authVerify")

router.get("/", (req, res) => res.status(200).send(doc))
router.use(authRoutes)

router.use(jwtCheck)
router.use(profileRoutes)
router.use(searchRoutes)
router.use(pokeralaRoutes)


module.exports = router;