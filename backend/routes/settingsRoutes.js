const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET: Retrieve shop settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({
      message: 'Failed to retrieve settings'
    });
  }
});

// PUT: Update shop settings
router.put('/', async (req, res) => {
  try {
    const allowedFields = [
      'shopName',
      'address',
      'phone',
      'adminName',
      'adminEmail',
      'currency',
      'dateFormat',
      'lowStockNotifications',
      'distributionNotifications',
      'emailNotifications'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (
      typeof updates.shopName === 'string' &&
      updates.shopName.trim() === ''
    ) {
      return res.status(400).json({
        message: 'Shop name cannot be empty'
      });
    }

    if (
      typeof updates.adminEmail === 'string' &&
      updates.adminEmail !== '' &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.adminEmail)
    ) {
      return res.status(400).json({
        message: 'Please provide a valid administrator email'
      });
    }

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    for (const [field, value] of Object.entries(updates)) {
      settings.set(field, value);
    }

    await settings.save();

    res.status(200).json({
      message: 'Settings saved successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Failed to save settings'
    });
  }
});

// POST: Reset settings to defaults
router.post('/reset', async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    } else {
      settings.shopName = 'Coimbatore Shop';
      settings.address = '';
      settings.phone = '';
      settings.adminName = 'Devananth P K';
      settings.adminEmail = '';
      settings.currency = 'INR';
      settings.dateFormat = 'DD MMMM YYYY';
      settings.lowStockNotifications = true;
      settings.distributionNotifications = true;
      settings.emailNotifications = false;

      await settings.save();
    }

    res.status(200).json({
      message: 'Settings restored to defaults',
      settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      message: 'Failed to reset settings'
    });
  }
});

module.exports = router;
