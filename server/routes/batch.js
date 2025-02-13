require('dotenv').config();
const express = require("express");
const conn = require("./conn");
const router = express.Router();

router.get("/schools", (req, res) => {
    const district = req.query.district;
    const query = "SELECT schoolCode, school FROM tbl_users WHERE district = ? AND role = 'Staff'";

    conn.query(query, [district], (err, results) => {
        console.log("Query results:", results); // Add this log
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Get all batches
router.get("/batches", (req, res) => {
    const query = "SELECT * FROM tbl_batches";
    conn.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching batches:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Fetched batches:", result);
        res.json(result);
    });
});

// Get devices for selection
router.get('/devices', (req, res) => {
    const query = 'SELECT device_name FROM tbl_devices'; // Select device_name from your table
    conn.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching devices:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(result); // Return the list of device names
    });
});


router.post("/adddevice", (req, res) => {
    const { device_name } = req.body; // Extract device_name from request body

    if (!device_name) {
        return res.status(400).json({ error: "Device name is required" });
    }

    const query = "INSERT INTO tbl_devices (device_name) VALUES (?)";
    conn.query(query, [device_name], (err, result) => {
        if (err) {
            console.error("Error adding device:", err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("Added device:", result);
        res.json({ message: "Device added successfully", device_id: result.insertId });
    });
});


// Create a new batch
router.post("/createbatch", (req, res) => {
    const { batchNumber, sendDate, district, schoolCode, schoolName, devices } = req.body;

    const query = "INSERT INTO tbl_batches (batch_number, send_date, schoolCode, school_name, status) VALUES (?, ?, ?, ?, ?)";
    conn.query(
        query,
        [batchNumber, sendDate, schoolCode, schoolName, "Pending"],
        (err, result) => {
            if (err) {
                console.error("Error creating batch:", err.message);
                return res.status(500).json({ error: err.message });
            }
            const batchId = result.insertId;

            // Insert devices
            devices.forEach(device => {
                // In the backend route's device insertion
                const deviceQuery = "INSERT INTO tbl_batch_devices (batch_id, device_type, device_number) VALUES (?, ?, ?)";
                conn.query(
                    deviceQuery,
                    [batchId, device.deviceType, device.serialNumber],
                    (err) => {
                        if (err) console.error("Error adding device:", err);
                    }
                );
            });

            res.json({ message: "Batch created!", batchId });
        }
    );
});

// Server-side route to get next batch number
router.get("/nextBatchNumber", (req, res) => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, "");
    const query = `
        SELECT batch_number 
        FROM tbl_batches 
        WHERE batch_number LIKE '${today}-%' 
        ORDER BY batch_number DESC 
        LIMIT 1`;

    conn.query(query, (err, results) => {
        if (err) {
            console.error("Error getting next batch number:", err);
            return res.status(500).json({ error: err.message });
        }

        let nextNumber = '0001';
        if (results.length > 0) {
            // Extract the current counter and increment it
            const currentNumber = results[0].batch_number.split('-')[1];
            nextNumber = (parseInt(currentNumber) + 1).toString().padStart(4, '0');
        }

        res.json({ nextBatchNumber: `${today}-${nextNumber}` });
    });
});

router.get("/getbatches", (req, res) => {
    const district = req.query.district;
    const query = "SELECT schoolCode, school FROM tbl_users WHERE district = ? AND role = 'Staff'";

    conn.query(query, [district], (err, results) => {
        console.log("Query results:", results); // Add this log
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;
