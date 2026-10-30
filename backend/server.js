const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const distributionRoutes = require("./routes/distributionRoutes");
const employeeRoutes = require('./routes/employeeRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/distributions", distributionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/settings', settingsRoutes);
// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_DB_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });