require("dotenv").config();
const express = require("express");
const { Pool } = require("pg"); // Changed from mysql2 to pg
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const router = express.Router();
const secretKey = process.env.SECRET_KEY;
const LoginAttempts = {}; // Track failed login attempts

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

router.post("/login", async (req, res) => {
  if (!req.body?.username || !req.body?.password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const { username, password } = req.body;
  const currentTime = Date.now();

  // Block temporary lockout check
  if (LoginAttempts[username]?.count >= 3) {
    const timePassed = (currentTime - LoginAttempts[username].firstAttemptTime) / 1000;
    const retryAfter = Math.max(60 - timePassed, 0);
    
    if (retryAfter > 0) {
      return res.status(429).json({
        message: "Too many login attempts. Try again later.",
        retryAfter: Math.ceil(retryAfter)
      });
    }
    delete LoginAttempts[username];
  }

  try {
    // PostgreSQL query with $1 placeholder
    const { rows } = await pool.query(
      "SELECT * FROM tbl_users WHERE username = $1;", 
      [username]
    );

    if (rows.length === 0) {
      return handleLoginFailure(username, currentTime, res);
    }

    const user = rows[0];

    // Password hashing check
    if (!user.password.startsWith("$2b$")) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        "UPDATE tbl_users SET password = $1 WHERE userId = $2;", 
        [hashedPassword, user.userid] // Note: PostgreSQL often uses lowercase column names
      );
      user.password = hashedPassword;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return handleLoginFailure(username, currentTime, res);
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.userid,
        username: user.username,
        school: user.school,
        schoolCode: user.schoolcode,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      },
      secretKey,
      { expiresIn: "1h" }
    );

    delete LoginAttempts[username];
    return res.json({ message: "Login successful", token });

  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// (Keep the same handleLoginFailure function)

// Function to handle failed login attempts
function handleLoginFailure(username, currentTime, res) {
    if (!LoginAttempts[username]) {
        LoginAttempts[username] = { count: 1, firstAttemptTime: currentTime };
    } else {
        LoginAttempts[username].count += 1;
    }

    if (LoginAttempts[username].count >= 3) {
        return res.status(429).json({
            message: "Too many login attempts. Try again later.",
            retryAfter: 60,
        });
    }

    return res.status(401).json({
        message: "Invalid username or password",
        remainingAttempts: 3 - LoginAttempts[username].count,
    });
}

module.exports = router;
