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
    const { showArchived } = req.query;
    const query = `
        SELECT * FROM tbl_tickets 
        WHERE archived = ?
        ORDER BY date DESC
    `;
    
    conn.query(query, [showArchived === 'true' ? 1 : 0], (err, result) => {
        if (err) {
            console.error("Error fetching tickets:", err.message);
            return res.status(500).json({ error: "Failed to fetch tickets" });
        }
        res.json(result);
    });
});

router.get('/getBatches/:schoolCode', (req, res) => {
    const { schoolCode } = req.params;

    console.log("Fetching batches for school code:", schoolCode); // Debug log

    const query = `
        SELECT 
            batch_id,
            batch_number,
            send_date,
            status
        FROM tbl_batches 
        WHERE schoolCode = ?
        ORDER BY send_date DESC
    `;

    conn.query(query, [schoolCode], (err, results) => {
        if (err) {
            console.error('Error fetching batches:', err.message);
            return res.status(500).json({ 
                message: 'Error fetching batches',
                error: err.message 
            });
        }

        console.log("Found batches:", results); // Debug log

        // Return an empty array if no batches found
        res.json(results.length > 0 ? results : []);
    });
});

router.post("/createTickets", (req, res) => {
    upload(req, res, function (err) {
        // Handle file upload errors
        if (err instanceof multer.MulterError) {
            console.log("Multer Error:", err.message);
            return res.status(400).json({ error: "File upload error: " + err.message });
        } else if (err) {
            console.log("General Error:", err.message);
            return res.status(400).json({ error: err.message });
        }

        // Destructure and log the body for better debugging
        const { requestor, category, request, comments } = req.body;
        const batchId = req.body.batchId || null;
        const attachments = req.files ? req.files.map(file => file.filename) : [];

        console.log("Request Body:", req.body);
        console.log("Uploaded Files:", req.files);

        // Validate required fields
        if (!requestor || !category || !request || !comments) {
            console.log("Missing required fields:", { requestor, category, request, comments });
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Validate requestor field
        if (typeof requestor !== 'string' || requestor.trim() === '') {
            console.log("Invalid requestor:", requestor);
            return res.status(400).json({ error: "Invalid requestor" });
        }

        // Validate category field
        const validCategories = ['Hardware', 'Software'];
        if (!validCategories.includes(category)) {
            console.log("Invalid category:", category);
            return res.status(400).json({ error: "Invalid category" });
        }

        // Validate request field
        if (typeof request !== 'string' || request.trim() === '') {
            console.log("Invalid request:", request);
            return res.status(400).json({ error: "Invalid request" });
        }

        // Validate comments field
        if (typeof comments !== 'string' || comments.trim() === '') {
            console.log("Invalid comments:", comments);
            return res.status(400).json({ error: "Invalid comments" });
        }

        // Hardware-specific validation
        if (category === 'Hardware' && !batchId) {
            console.log("Missing batchId for hardware category");
            return res.status(400).json({ error: "Batch ID is required for hardware requests" });
        }

        // Validate batchId (if provided)
        if (batchId && typeof batchId !== 'string') {
            console.log("Invalid batchId:", batchId);
            return res.status(400).json({ error: "Invalid batch ID" });
        }

        // Validate attachments (if any)
        if (attachments.length > 0) {
            console.log("Attachments:", attachments);
            // You can add further checks here, such as file type validation if necessary
        } else {
            console.log("No attachments uploaded.");
        }

        // Generate a unique ticket number
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // SQL query to insert the ticket into the database
        const query = `
            INSERT INTO tbl_tickets 
            (ticketNumber, requestor, category, request, comments, attachments, status, date, archived, batchId) 
            VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW(), 0, ?)
        `;

        // Execute query and handle result
        conn.query(query, [
            ticketNumber,
            requestor,
            category,
            request,
            comments,
            JSON.stringify(attachments),
            batchId  // This will be null for Software tickets
        ], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(400).json({ error: "Database error: " + err.message });
            }
            console.log("Ticket created successfully:", {
                message: "Ticket created successfully",
                ticketNumber,
                ticketId: result.insertId
            });
            res.json({
                message: "Ticket created successfully",
                ticketNumber,
                ticketId: result.insertId
            });
        });
    });
});

router.put("/tickets/:ticketId/status", (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;

    console.log(`Received ticketId: ${ticketId} and status: ${status}`);

    const validStatuses = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];
    
    if (!validStatuses.includes(status)) {
        console.log(`Invalid status: ${status}`);
        return res.status(400).json({ error: "Invalid status" });
    }

    const query = `
        UPDATE tbl_tickets 
        SET status = ?, 
            closedAt = ${status === 'Completed' ? 'NOW()' : 'NULL'}
        WHERE ticketId = ?
    `;

    console.log("Generated query:", query);  // Log the generated query for debugging purposes

    conn.query(query, [status, ticketId], (err, result) => {
        if (err) {
            console.error("Database error:", err);  // Log the actual error object
            return res.status(500).json({ error: "Failed to update ticket status" });
        }

        console.log("Query result:", result);  // Log the result of the query for debugging purposes

        if (result.affectedRows === 0) {
            console.log("No rows affected. Ticket might not exist.");
            return res.status(404).json({ error: "Ticket not found" });
        }

        console.log("Ticket status updated successfully");
        res.json({ message: "Ticket status updated successfully" });
    });
});

router.get("/tickets/:username/:status", (req, res) => {
    const { username, status } = req.params;
    
    const validStatuses = ["Completed", "Pending", "On Hold", "In Progress", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
  
    const query = `
      SELECT * FROM tbl_tickets 
      WHERE requestor = ? 
      AND status = ?
      AND archived = 0
      ORDER BY date DESC
    `;
  
    conn.query(query, [username, status], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to fetch tickets" });
      }
      res.json(results);
    });
});


  router.put("/tickets/:ticketId/archive", (req, res) => {
    const { ticketId } = req.params;
    
    const query = `
        UPDATE tbl_tickets 
        SET archived = 1
        WHERE ticketId = ?
    `;

    conn.query(query, [ticketId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to delete ticket" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Ticket not found" });
        }

        res.json({ message: "Ticket deleted successfully" });
    });
});

  
module.exports = router;