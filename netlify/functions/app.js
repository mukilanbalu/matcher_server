const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const routes = require("../../routes/index");
const HttpError = require("../../models/httpError");
const connectDB = require("../../DB/db");
const formidableMiddleware = require('express-formidable');
const path = require('path');
const app = express();
const cors = require('cors');

// const PORT = process.env.PORT;
app.use(cors({
  origin: 'https://marriagematcher.netlify.app', // Allow only this origin to access the server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json());
app.use("/.netlify/functions/app/api/uploads/images", express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(formidableMiddleware());

app.use("/.netlify/functions/app/api", routes);

// Middleware function to handle 404 errors.
app.use((req, res, next) => {
  const err = new HttpError("not found", 404);
  next(err);
});

// Error handling middleware function.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500).json({ message: error.message || "Unknown error occurred" });
});

// Instead of starting the server, export the app as a serverless function.
module.exports.handler = serverless(app);
