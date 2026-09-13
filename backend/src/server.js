const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fraudRoutes = require("./routes/fraudRoutes");

const app = express();

const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Credit Card Fraud Detection API is running",
    status: "success",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "fraud-detection-backend",
  });
});

// API routes
app.use(
  "/api/v1/fraud",
  fraudRoutes
);

// Start server
app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});