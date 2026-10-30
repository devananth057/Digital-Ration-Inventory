
const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");

// GET: Retrieve all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json(employees);
  } catch (error) {
    console.error("Retrieve employees error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve employees",
    });
  }
});

// POST: Add an employee
router.post("/", async (req, res) => {
  try {
    const { employeeId, fullName, phone, email, role } = req.body;

    if (!employeeId || !fullName || !phone || !role) {
      return res.status(400).json({
        message: "Employee ID, name, phone and role are required",
      });
    }

    if (!["Manager", "Staff"].includes(role)) {
      return res.status(400).json({
        message:
          "Only Manager and Staff accounts can be created through this endpoint",
      });
    }

    const normalizedEmployeeId = employeeId.trim();
    const normalizedPhone = phone.trim();

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    const employee = await Employee.create({
      employeeId: normalizedEmployeeId,
      fullName: fullName.trim(),
      phone: normalizedPhone,
      email: email ? email.trim() : "",
      role,
      status: "Active",
    });

    res.status(201).json({
      message: "Employee account created successfully",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Employee creation error:", error.message);

    res.status(500).json({
      message: "Failed to add employee",
    });
  }
});

// PUT: Update employee details
router.put("/:id", async (req, res) => {
  try {
    const allowedFields = [
      "employeeId",
      "fullName",
      "phone",
      "email",
      "role",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (updates.phone !== undefined && !/^\d{10}$/.test(updates.phone)) {
      return res.status(400).json({
        message: "Phone number must contain exactly 10 digits",
      });
    }

    if (
      updates.role !== undefined &&
      !["Admin", "Manager", "Staff"].includes(updates.role)
    ) {
      return res.status(400).json({
        message: "Invalid employee role",
      });
    }

    if (
      updates.status !== undefined &&
      !["Active", "Inactive"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid employee status",
      });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Employee ID already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Update employee error:", error.message);

    res.status(500).json({
      message: "Failed to update employee",
    });
  }
});

module.exports = router;
