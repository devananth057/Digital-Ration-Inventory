
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// GET: Retrieve all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve employees' });
  }
});

// POST: Add an employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, fullName, phone, email, role } = req.body;

    if (!employeeId || !fullName || !phone || !role) {
      return res.status(400).json({
        message: 'Employee ID, name, phone and role are required'
      });
    }

    const employee = await Employee.create({
      employeeId,
      fullName,
      phone,
      email,
      role
    });

    res.status(201).json({
      message: 'Employee added successfully',
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Employee ID already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to add employee' });
  }
});

// PUT: Update employee details
router.put('/:id', async (req, res) => {
  try {
    const allowedFields = [
      'employeeId',
      'fullName',
      'phone',
      'email',
      'role',
      'status'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({
      message: 'Employee updated successfully',
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Employee ID already exists'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Failed to update employee' });
  }
});

module.exports = router;
