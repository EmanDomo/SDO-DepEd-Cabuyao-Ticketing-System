const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const conn = require("./conn");

// Add CORS middleware
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./deped_uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/msword"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPG, PNG, DOCS and PDF allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).fields([
    { name: "proofOfIdentity", maxCount: 1 },
    { name: "prcID", maxCount: 1 },
    { name: "endorsementLetter", maxCount: 1 }
]);

// Process JSON data for reset requests
router.use(express.json());

// Create a new DepEd Account Request
router.post("/request-deped-account", (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: "File upload error: " + err.message });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }

        const {
            selected_type,
            name,
            designation,
            school,
            school_id,
            personal_gmail
        } = req.body;

        // Debug log
        console.log("New account request data:", req.body);
        console.log("Files received:", req.files);

        // Validate required fields
        if (!selected_type || !name || !designation || !school || !school_id || !personal_gmail) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get filenames from uploaded files
        const proofOfIdentity = req.files?.proofOfIdentity?.[0]?.filename;
        const prcID = req.files?.prcID?.[0]?.filename;
        const endorsementLetter = req.files?.endorsementLetter?.[0]?.filename;

        if (!proofOfIdentity || !prcID || !endorsementLetter) {
            return res.status(400).json({ error: "All files are required" });
        }

        const query = `
            INSERT INTO deped_account_requests 
            (selected_type, name, designation, school, school_id, personal_gmail, 
             proof_of_identity, prc_id, endorsement_letter) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conn.query(
            query,
            [selected_type, name, designation, school, school_id, personal_gmail,
             proofOfIdentity, prcID, endorsementLetter],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to submit request" });
                }
                res.json({
                    message: "New account request submitted successfully",
                    requestId: result.insertId
                });
            }
        );
    });
});

// Add reset account request endpoint
router.post("/reset-deped-account", (req, res) => {
    // Log the received data
    console.log("Reset request received:", req.body);
    
    const {
        selected_type,
        name,
        school,
        school_id,
        employee_number
    } = req.body;

    // Improved validation
    const missingFields = [];
    if (!selected_type) missingFields.push("selected_type");
    if (!name) missingFields.push("name");
    if (!school) missingFields.push("school");
    if (!school_id) missingFields.push("school_id");
    if (!employee_number) missingFields.push("employee_number");

    if (missingFields.length > 0) {
        return res.status(400).json({ 
            error: "Missing required fields", 
            missingFields: missingFields 
        });
    }

    const query = `
        INSERT INTO deped_account_reset_requests 
        (selected_type, name, school, school_id, employee_number) 
        VALUES (?, ?, ?, ?, ?)
    `;

    conn.query(
        query,
        [selected_type, name, school, school_id, employee_number],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to submit reset request" });
            }
            res.json({
                message: "Your request submitted successfully",
                requestId: result.insertId
            });
        }
    );
});

// Get all new account requests
router.get("/deped-account-requests", (req, res) => {
    const query = `
        SELECT * FROM deped_account_requests 
        ORDER BY created_at ASC
    `;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch account requests" });
        }
        res.json(results);
    });
});

// Get all reset account requests
router.get("/deped-account-reset-requests", (req, res) => {
    const query = `
        SELECT * FROM deped_account_reset_requests 
        ORDER BY created_at ASC
    `;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to fetch reset requests" });
        }
        res.json(results);
    });
});

// Update status for new account request
router.put("/deped-account-requests/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const query = `
        UPDATE deped_account_requests 
        SET status = ? 
        WHERE id = ?
    `;

    conn.query(query, [status, id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to update status" });
        }
        res.json({ message: "Status updated successfully" });
    });
});

// Update status for reset account request
router.put("/deped-account-reset-requests/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const query = `
        UPDATE deped_account_reset_requests 
        SET status = ?, 
            notes = ?,
            completed_at = ${status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL'}
        WHERE id = ?
    `;

    conn.query(query, [status, notes, id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to update status" });
        }
        res.json({ message: "Status updated successfully" });
    });
});

module.exports = router;