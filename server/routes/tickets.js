const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const conn = require("./conn");

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        // Add timestamp to prevent filename collisions
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Add file filter to restrict file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).array("attachments", 10);

router.get("/tickets", (req, res) => {
    const query = "SELECT * FROM tbl_tickets ORDER BY date DESC";
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching tickets:", err.message);
            return res.status(500).json({ error: "Failed to fetch tickets" });
        }
        res.json(result);
    });
});

router.post("/createTickets", (req, res) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: "File upload error: " + err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        const { requestor, category, request, comments, status } = req.body;
        const attachments = req.files ? req.files.map(file => file.filename) : [];
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Validate required fields
        if (!requestor || !category || !request) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const query = `
            INSERT INTO tbl_tickets 
            (ticketNumber, requestor, category, request, comments, attachments, status, date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        conn.query(
            query,
            [ticketNumber, requestor, category, request, comments, JSON.stringify(attachments), status || 'In Progress'],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to create ticket" });
                }
                res.json({ 
                    message: "Ticket submitted successfully", 
                    ticketNumber,
                    ticketId: result.insertId
                });
            }
        );
    });
});

// Add this to your tickets.js route file

router.put("/tickets/:ticketId/status", (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    if (!["In Progress", "Closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const query = `
        UPDATE tbl_tickets 
        SET status = ?, 
            closedAt = ${status === 'Closed' ? 'NOW()' : 'NULL'}
        WHERE ticketId = ?
    `;

    conn.query(query, [status, ticketId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to update ticket status" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        
        res.json({ message: "Ticket status updated successfully" });
    });
});

module.exports = router;