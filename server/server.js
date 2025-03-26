const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// API
require('./routes/conn');
const router = require('./routes/login');
const ticketRoutes = require("./routes/ticket");
const batchRoutes = require("./routes/batch");
const resetRoutes = require("./routes/reset");
const depedRoutes = require("./routes/depedacc");

const corsOptions = {
  origin: ["http://localhost:5173", "https://sdo-deped-cabuyao-ticketing-system-2.onrender.com"],
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// API Routes
app.use(router);
app.use(ticketRoutes);
app.use(batchRoutes);
app.use(resetRoutes);
app.use(depedRoutes);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, "uploads")));
app.use("/deped_uploads", express.static(path.join(__dirname, "deped_uploads")));

// Serve frontend (assuming your built frontend is in a 'dist' or 'build' folder)
app.use(express.static(path.join(__dirname, "dist")));

// Handle SPA (for React/Vue/Angular)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Use Render's port or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});