const express = require("express");
const router = express.Router();

const Beneficiary = require("../models/Beneficiary");

// Register a beneficiary
router.post("/", async (req, res) => {
  try {
    const {
      rationCardNumber,
      fullName,
      phone,
      address,
      familyMembers,
      cardType,
      status,
      password
    } = req.body;

    if (
      !rationCardNumber ||
      !fullName ||
      !phone ||
      !address ||
      familyMembers === undefined ||
      !cardType ||
      !password
    ) {
      return res.status(400).json({
        message: "All required beneficiary fields and password must be provided"
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    const beneficiary = await Beneficiary.create({
      rationCardNumber,
      fullName,
      phone,
      address,
      familyMembers,
      cardType,
      status,
      password
    });

    const safeBeneficiary = beneficiary.toObject();
    delete safeBeneficiary.password;

    res.status(201).json({
      message: "Beneficiary account created successfully",
      beneficiary: safeBeneficiary
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

    console.error("Beneficiary creation error:", error.message);

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