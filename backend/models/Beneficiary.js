
const mongoose = require("mongoose");

const beneficiarySchema = new mongoose.Schema(
  {
    rationCardNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    familyMembers: {
      type: Number,
      required: true,
      min: 1
    },

    cardType: {
      type: String,
      enum: ["PHH", "AAY", "NPHH"],
      required: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Beneficiary", beneficiarySchema);
