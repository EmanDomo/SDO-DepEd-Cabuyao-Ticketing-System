const express = require("express");
const conn = require("./conn");
const router = express.Router();
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); 

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); 
        req.user = user; 
        next();
    });
};

const LoginAttempts = {};

router.post("/login", (req, res) => {

    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    const { username, password } = req.body;

    if (LoginAttempts[username] >= 3) {
        return res.status(429).json({ error: "Too many login attempts" });
    }

    conn.query("SELECT * FROM tbl_users WHERE username = ? AND password = ?", [username, password], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        return res.json({ message: "Login successful", token: "your-jwt-token-here" });
    });
});


module.exports = router;
