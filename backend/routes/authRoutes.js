const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Beneficiary = require("../models/Beneficiary");
const Employee = require("../models/Employee");

const router = express.Router();

// POST /api/auth/admin-login
router.post("/admin-login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
      status: "Active"
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid credentials or inactive account"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        role: "Admin"
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        fullName: admin.fullName,
        role: "Admin"
      }
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      message: "Unable to process login"
    });
  }
});

// POST /api/auth/beneficiary-login
router.post("/beneficiary-login", async (req, res) => {
  try {
    const { rationCardNumber, phone } = req.body;

    if (!rationCardNumber || !phone) {
      return res.status(400).json({
        message: "Ration card number and phone number are required.",
      });
    }

    const beneficiary = await Beneficiary.findOne({
      rationCardNumber: rationCardNumber.trim(),
      phone: phone.trim(),
      status: "Active",
    });

    if (!beneficiary) {
      return res.status(401).json({
        message: "Invalid ration card number or phone number.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      {
        id: beneficiary._id.toString(),
        role: "Beneficiary",
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Beneficiary login successful",
      token,
      user: {
        id: beneficiary._id,
        rationCardNumber: beneficiary.rationCardNumber,
        fullName: beneficiary.fullName,
        phone: beneficiary.phone,
        address: beneficiary.address,
        familyMembers: beneficiary.familyMembers,
        cardType: beneficiary.cardType,
        status: beneficiary.status,
        role: "Beneficiary",
      },
    });
  } catch (error) {
    console.error("Beneficiary login error:", error);

    return res.status(500).json({
      message: "Unable to process beneficiary login.",
    });
  }
});



// POST /api/auth/employee-login
router.post("/employee-login", async (req, res) => {
  try {
    const { employeeId, phoneNumber } = req.body;

    if (!employeeId || !phoneNumber) {
      return res.status(400).json({
        message: "Employee ID and mobile number are required",
      });
    }

    const employee = await Employee.findOne({
      employeeId: employeeId.trim(),
      phone: phoneNumber.trim(),
      status: "Active",
      role: { $in: ["Manager", "Staff"] },
    });

    if (!employee) {
      return res.status(401).json({
        message: "Invalid employee ID or mobile number",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        id: employee._id.toString(),
        role: employee.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Employee login successful",
      token,
      user: {
        id: employee._id,
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error("Employee login error:", error.message);

    return res.status(500).json({
      message: "Unable to process login",
    });
  }
});


module.exports = router;