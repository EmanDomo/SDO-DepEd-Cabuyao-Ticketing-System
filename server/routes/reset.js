//IDASRESET.JS

const express = require("express");
const router = express.Router();
const conn = require("./conn"); // Import MySQL connection

// Get all IDAS reset requests
router.get("/idas-reset", (req, res) => {
    const query = "SELECT * FROM tbl_idas_reset";
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching reset requests:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Fetched reset requests:", result);
        res.json(result);
    });
});

// Create a new IDAS reset request
router.post("/idas-reset", (req, res) => {
    const { name, school, schoolId, employeeNumber } = req.body;

    if (!name || !school || !schoolId || !employeeNumber) {
        return res.status(400).json({ error: "All fields are required." });
    }

    conn.query(
        "INSERT INTO tbl_idas_reset (name, school, schoolId, employeeNumber) VALUES (?, ?, ?, ?)",
        [name, school, schoolId, employeeNumber],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Reset request submitted successfully" });
        }
    );
});

const generateResetTicketNumber = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
    // Generate 3 random letters (extra letter for uniqueness)
    const randomLetters = 
      letters[Math.floor(Math.random() * letters.length)] + 
      letters[Math.floor(Math.random() * letters.length)] +
      letters[Math.floor(Math.random() * letters.length)];
  
    // Generate 4 random digits from timestamp
    const timestampDigits = Date.now().toString().slice(-4);
  
    // Generate 6 random numbers (100000 - 999999)
    const randomNumbers = Math.floor(100000 + Math.random() * 900000);
  
    return `RST-${randomLetters}${timestampDigits}${randomNumbers}`;
  };

module.exports = router;
