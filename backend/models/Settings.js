
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
      default: 'Coimbatore Shop'
    },
    shopId: {
      type: String,
      required: true,
      unique: true,
      default: 'TN-CBE-042'
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    adminName: {
      type: String,
      default: 'Devananth P K',
      trim: true
    },
    adminEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true
    },
    currency: {
      type: String,
      enum: ['INR', 'USD', 'EUR'],
      default: 'INR'
    },
    dateFormat: {
      type: String,
      enum: ['DD MMMM YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'DD MMMM YYYY'
    },
    lowStockNotifications: {
      type: Boolean,
      default: true
    },
    distributionNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
