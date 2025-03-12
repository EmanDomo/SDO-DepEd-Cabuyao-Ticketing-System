require("dotenv").config();
const express = require("express");
const router = express.Router();
const conn = require("./conn");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const secretKey = process.env.SECRET_KEY;

// Get all IDAS reset requests
router.get("/idas-reset", async (req, res) => {
    try {
        const query = "SELECT * FROM tbl_idas_reset";
        const [result] = await conn.promise().query(query);
        
        if (result.length === 0) {
            return res.status(404).json({ message: "No reset requests found." });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Error fetching reset requests:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Create a new IDAS reset request
router.post("/idas-reset", async (req, res) => {
    try {
        const { name, school, schoolId, employeeNumber } = req.body;

        if (!name || !school || !schoolId || !employeeNumber) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const query = "INSERT INTO tbl_idas_reset (name, school, schoolId, employeeNumber) VALUES (?, ?, ?, ?)";
        await conn.promise().query(query, [name, school, schoolId, employeeNumber]);

        res.status(201).json({ message: "Reset request submitted successfully." });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
});

// Generate reset ticket number
const generateResetTicketNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetters = Array(3).fill().map(() => letters[Math.floor(Math.random() * letters.length)]).join('');
    const timestampDigits = Date.now().toString().slice(-4);
    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
    
    return `RST-${randomLetters}${timestampDigits}${randomNumbers}`;
};

// Middleware to authenticate user
// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }
  
    // Corrected: Use secretKey instead of process.env.JWT_SECRET
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token." });
      }
  
      req.user = decoded;
      // Ensure userId is correctly assigned from the token payload
      req.user.userId = decoded.userId || decoded.id;
  
      next();
    });
};
  



// Change Password Route
// Change Password Route
router.post("/change-password", authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    if (!userId) {
        return res.status(400).json({ message: "User ID is missing from token." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "New passwords do not match." });
    }

    try {
        // Fetch user from database
        const [rows] = await conn.promise().query("SELECT password FROM tbl_users WHERE userId = ?", [userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        const user = rows[0];
        // Compare current password with stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        // Hash new password and update
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        await conn.promise().query(
            "UPDATE tbl_users SET password = ? WHERE userId = ?",
            [hashedPassword, userId]
        );

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});



module.exports = router;
