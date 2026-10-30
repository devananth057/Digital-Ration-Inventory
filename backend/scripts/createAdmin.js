
require("dotenv").config();

const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function createAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_FULL_NAME } = process.env;

  if (!process.env.MONGO_DB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGO_DB_URI and JWT_SECRET must be configured");
  }

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_FULL_NAME) {
    throw new Error(
      "Set ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_FULL_NAME in .env"
    );
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("Admin password must contain at least 12 characters");
  }

  await mongoose.connect(process.env.MONGO_DB_URI);

  const username = ADMIN_USERNAME.trim().toLowerCase();

  const existingAdmin = await Admin.findOne({ username }).select("+password");

  if (existingAdmin) {
    // Reset the existing password.
    // Admin.js will hash it once through its pre-save hook.
    existingAdmin.password = ADMIN_PASSWORD;
    existingAdmin.fullName = ADMIN_FULL_NAME.trim();
    existingAdmin.status = "Active";

    await existingAdmin.save();

    console.log("Existing Admin password reset successfully.");
  } else {
    // Admin.js will hash the password automatically.
    await Admin.create({
      username,
      password: ADMIN_PASSWORD,
      fullName: ADMIN_FULL_NAME.trim(),
      status: "Active"
    });

    console.log("Initial Admin account created successfully.");
  }
}

createAdmin()
  .catch((error) => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
