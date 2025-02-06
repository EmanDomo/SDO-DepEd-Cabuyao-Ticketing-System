require('dotenv').config();
const express = require("express");
const conn = require("./conn");
const router = express.Router();
const jwt = require("jsonwebtoken");

const secretKey = process.env.SECRET_KEY;
const LoginAttempts = {};

router.post("/login", (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const { username, password } = req.body;
    const currentTime = Date.now();

    if (LoginAttempts[username] && LoginAttempts[username].count >= 3) {
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

    conn.query(
        "SELECT * FROM tbl_users WHERE username = ? AND password = ?",
        [username, password],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
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

            const user = {
                id: results[0].id,
                username: results[0].username,
                school: results[0].school,
                firstname: results[0].firstname,
                lastname: results[0].lastname,
                role: results[0].role // Ensure the role is included
              };
              
              const token = jwt.sign(user, secretKey, { expiresIn: "1h" });
              
            delete LoginAttempts[username];

            // const token = jwt.sign(user, secretKey, { expiresIn: "1h" });

            return res.json({ message: "Login successful", token });
        }
    );
});


module.exports = router;
