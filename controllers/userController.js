const HttpError = require("../models/httpError")
const app_users = require("../models/userModel")


const registerUser = async (req, res, next) => {
  const { email, password, name, mobile } = req.body;

  try {
    const result = await app_users.find({ email });
    if (result.length > 0) {
      const err = new HttpError("User already exist", 500)
      return next(err)
    }
    const insert = await app_users.create({
      email,
      password,
      name,
      mobile
    })
    res.status(201).json({ status: 201, message: "User Registered" })
  }
  catch (err) {
    next(err)
  }


}


const loginUser = async (req, res, next) => {
  try {
    const result = await app_users.findOne({ email: req.body.email, password: req.body.password })
    // .updateOne({ email: req.body.email },
    //   {
    //     last_login: new Date().toDateString(),
    //     logged_in: true
    //   })
    if (result.matchedCount < 1) {
      const err = new HttpError("Invalid credintials", 401)
      return next(err)
    }
    res.status(200).json({ result, message: "User logged in" })
  }
  catch (err) {
    next(err)
  }
}
const logoutUser = async (req, res, next) => {
  try {
    const result = await app_users.findOne({ email: req.body.email, logged_in: true })
      .updateOne({ email: req.body.email }, { logged_in: false });
    res.status(200).json({ result, message: "User logged out" })
  }
  catch (err) {
    next(err)
  }
}

exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.logoutUser = logoutUser;
