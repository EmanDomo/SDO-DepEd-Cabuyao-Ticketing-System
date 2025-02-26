const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const conn = require("./conn");

router.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

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
    limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
    { name: "proofOfIdentity", maxCount: 1 },
    { name: "prcID", maxCount: 1 },
    { name: "endorsementLetter", maxCount: 1 }
]);

router.use(express.json());

router.post("/request-deped-account", (req, res) => {
    console.log("request header", req.headers);
    console.log("req files", req.files);
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error("Multer error:", err);
            return res.status(400).json({ error: "File upload error: " + err.message });
        } else if (err) {
            console.error("General upload error:", err);
            return res.status(400).json({ error: err.message });
        }

        const {
            selectedType,
            surname,
            firstName,
            middleName,
            designation,
            school,
            schoolID,
            personalGmail
        } = req.body;

        if (!selectedType || !surname || !firstName || !designation || !school || !schoolID || !personalGmail) {
            console.error("Missing fields:", req.body);
            return res.status(400).json({ error: "Missing required fields" });
        }

        const fullName = `${surname}, ${firstName} ${middleName || ''}`.trim();

        const proofOfIdentity = req.files?.proofOfIdentity?.[0]?.filename;
        const prcID = req.files?.prcID?.[0]?.filename;
        const endorsementLetter = req.files?.endorsementLetter?.[0]?.filename;

        if (!proofOfIdentity || !prcID || !endorsementLetter) {
            console.error("Missing files:", req.files);
            return res.status(400).json({ error: "All files are required" });
        }

        const query = `
            INSERT INTO deped_account_requests
            (selected_type, name, surname, first_name, middle_name, designation, school, school_id, personal_gmail,
             proof_of_identity, prc_id, endorsement_letter)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conn.query(
            query,
            [selectedType, fullName, surname, firstName, middleName || '', designation, school, schoolID, personalGmail,
             proofOfIdentity, prcID, endorsementLetter],
            (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Failed to submit request", dbError: err.message });
                }
                res.json({
                    message: "New account request submitted successfully",
                    requestId: result.insertId
                });
            }
        );
    });
});

router.post("/reset-deped-account", (req, res) => {
    console.log("Request Body:", req.body); // Log the entire request body

    const {
        selectedType,
        surname,
        firstName,
        middleName,
        school,
        schoolID,
        employeeNumber
    } = req.body;

    if (!selectedType || !surname || !firstName || !school || !schoolID || !employeeNumber) {
        console.error("Missing fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    const fullName = `${surname}, ${firstName} ${middleName || ''}`.trim();

    const query = `
        INSERT INTO deped_account_reset_requests
        (selected_type, name, surname, first_name, middle_name, school, school_id, employee_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conn.query(
        query,
        [selectedType, fullName, surname, firstName, middleName || '', school, schoolID, employeeNumber],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Failed to submit reset request", dbError: err.message });
            }
            res.json({
                message: "Your request submitted successfully",
                requestId: result.insertId
            });
        }
    );
});

// New route to fetch schools
router.get("/schoolList", (req, res) => {
    const query = "SELECT schoolCode, school FROM tbl_users GROUP BY schoolCode, school"; // Get all schools
    conn.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

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