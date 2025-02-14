const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const conn = require("./conn");

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
                    message: "Request submitted successfully",
                    requestId: result.insertId
                });
            }
        );
    });
});

module.exports = router;