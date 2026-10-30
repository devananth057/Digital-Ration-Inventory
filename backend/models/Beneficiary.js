const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    }
  },
  { timestamps: true }
);

beneficiarySchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

beneficiarySchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("Beneficiary", beneficiarySchema);