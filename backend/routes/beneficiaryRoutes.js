
const express = require("express");
const router = express.Router();

const Beneficiary = require("../models/Beneficiary");

// Register a beneficiary without requiring a password
router.post("/", async (req, res) => {
  try {
    const {
      rationCardNumber,
      fullName,
      phone,
      address,
      familyMembers,
      cardType,
      status
    } = req.body;

    // Validate required fields
    if (
      !rationCardNumber ||
      !fullName ||
      !phone ||
      !address ||
      familyMembers === undefined ||
      !cardType
    ) {
      return res.status(400).json({
        message: "All required beneficiary fields must be provided"
      });
    }

    // Check whether the ration card number already exists
    const existingBeneficiary = await Beneficiary.findOne({
      rationCardNumber: rationCardNumber.trim()
    });

    if (existingBeneficiary) {
      return res.status(409).json({
        message: "This ration card number already exists"
      });
    }

    // Save beneficiary details to MongoDB
    const beneficiary = await Beneficiary.create({
      rationCardNumber: rationCardNumber.trim(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      familyMembers,
      cardType,
      status: status || "Active"
    });

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

    console.error("Beneficiary creation error:", error);

    res.status(500).json({
      message: "Failed to register beneficiary"
    });
  }
});

// Get all beneficiaries
router.get("/", async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json(beneficiaries);
  } catch (error) {
    console.error("Fetch beneficiaries error:", error);

    res.status(500).json({
      message: "Failed to fetch beneficiaries"
    });
  }
});

module.exports = router;
