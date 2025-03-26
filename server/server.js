const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// Database connection (ensure this initializes your PostgreSQL pool)
require('./routes/conn');

// API Routes
const router = require('./routes/login');
const ticketRoutes = require("./routes/ticket");
const batchRoutes = require("./routes/batch");
const resetRoutes = require("./routes/reset");
const depedRoutes = require("./routes/depedacc");

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "https://sdo-deped-cabuyao-ticketing-system-2.onrender.com"
  ],
  credentials: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// API Routes
app.use("/api/auth", router);          // /api/auth/login
app.use("/api/tickets", ticketRoutes); // /api/tickets
app.use("/api/batches", batchRoutes);  // /api/batches
app.use("/api/reset", resetRoutes);    // /api/reset
app.use("/api/deped", depedRoutes);    // /api/deped

// Static Files
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use("/deped_uploads", express.static(path.join(__dirname, "deped_uploads")));

// Serve React Frontend (PRODUCTION ONLY)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../client/dist")));
  
  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../client/dist", "index.html"));
  });
}

// Root route
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    frontend: process.env.NODE_ENV === "production" 
      ? "Served from client/dist" 
      : "Not served in development"
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});