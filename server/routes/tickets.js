const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const conn = require("./conn");

const storage = multer.diskStorage({
    destination: "./uploads/",    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage }).array("attachments", 10); 

router.get("/tickets", (req, res) => {
    const query = "SELECT * FROM tbl_tickets";
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching tickets:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Fetched tickets:", result);
        res.json(result);
    });
});


router.post("/createTickets", upload, (req, res) => {
    const { requestor, category, request, comments } = req.body;
    const attachments = req.files ? req.files.map(file => file.filename) : [];

    const ticketNumber = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    conn.query(
        "INSERT INTO tbl_tickets (ticketNumber, requestor, category, request, comments, attachments) VALUES (?, ?, ?, ?, ?, ?)",
        [ticketNumber, requestor, category, request, comments, JSON.stringify(attachments)],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Ticket submitted successfully", ticketNumber });
        }
    );
});

module.exports = router;
