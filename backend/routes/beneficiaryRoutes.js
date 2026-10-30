const express = require("express");
const router = express.Router();

const Beneficiary = require("../models/Beneficiary");

// Register a beneficiary
router.post("/", async (req, res) => {
    try {
        const beneficiary = await Beneficiary.create(req.body);

        res.status(201).json({
            message: "Beneficiary registered successfully",
            beneficiary
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This ration card number already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to register beneficiary"
        });
    }
});

// Get all beneficiaries
router.get("/", async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.find().sort({
            createdAt: -1
        });

        res.json(beneficiaries);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch beneficiaries"
        });
    }
});

module.exports = router;