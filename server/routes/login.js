require("dotenv").config();
const express = require("express");
const conn = require("./conn");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();
const secretKey = process.env.SECRET_KEY;
const LoginAttempts = {}; // Track failed login attempts

router.post("/login", async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
''
    const { username, password } = req.body;
    const currentTime = Date.now();

    // Check if user is temporarily blocked
    if (LoginAttempts[username] && LoginAttempts[username].count >= 3) {
        const timePassed = (currentTime - LoginAttempts[username].firstAttemptTime) / 1000;
        const retryAfter = Math.max(60 - timePassed, 0);

        if (retryAfter > 0) {
            return res.status(429).json({
                message: "Too many login attempts. Try again later.",
                retryAfter: Math.ceil(retryAfter)
            });
        }
        delete LoginAttempts[username]; // Reset if timeout has passed
    }

    // Fetch user from the database
    conn.query("SELECT * FROM tbl_users WHERE username = ?", [username], async (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return handleLoginFailure(username, currentTime, res);
        }

        const user = results[0];

        // Check if password is already hashed (bcrypt hashes start with "$2b$")
        if (!user.password.startsWith("$2b$")) {
            // Password is in plain text, so hash it and update the database
            const hashedPassword = await bcrypt.hash(user.password, 10);
            conn.query("UPDATE tbl_users SET password = ? WHERE userId = ?", [hashedPassword, user.userId], (updateErr) => {
                if (updateErr) {
                    console.error("Error updating password:", updateErr);
                } else {
                    console.log(`Password hashed and updated for user ${user.userId}`);
                }
            });
            user.password = hashedPassword; // Update the user object with the hashed password
        }

        // Compare input password with stored hashed password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return handleLoginFailure(username, currentTime, res);
        }

        // Create user object for token
        const userData = {
            id: user.userId,
            username: user.username,
            school: user.school,
            schoolCode: user.schoolCode,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role
        };

        // Generate JWT token
        const token = jwt.sign(userData, secretKey, { expiresIn: "1h" });

        // Clear failed attempts after successful login
        delete LoginAttempts[username];

        return res.json({ message: "Login successful", token });
    });
});

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
