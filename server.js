const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/index");
const HttpError = require("./models/httpError");
const connectDB = require("./DB/db")
const formidableMiddleware = require('express-formidable');
const path = require('path');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(bodyParser.json());
app.use("/api/uploads/images", express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
})


// Middleware to parse form data
app.use("/api", routes);

app.use(formidableMiddleware());

//Middleware function to handle 404 errors.
app.use((req, res, next) => {
  const err = new HttpError("not found", 404)
  next(err)

})


/**Error handling middleware function.
 * This function catches errors thrown by previous middleware functions and sends a JSON response with the error message and status code.
 **/
app.use(
  (error, req, res, next) => {
    // Check if the response headers have already been sent.
    // If they have, we cannot send a response, so we pass the error to the next middleware function.
    if (res.headersSent) {
      return next(error);
    }

    // Set the HTTP status code of the response to the error code (or 500 if not provided).
    // Send a JSON response with the error message (or "Unknown error occurred" if not provided).
    res.status(error.code || 500).json({ message: error.message || "Unknown error occurred" });
  })
const startServer = async () => {
  const dbConnected = await connectDB();
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

startServer();

module.exports = app;