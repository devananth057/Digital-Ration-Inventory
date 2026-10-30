const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
    {
        itemName: {
            type: String,
            required: true,
            trim: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },
        unit: {
            type: String,
            required: true,
            enum: ["kg", "litre", "packet", "piece"]
        },
        pricePerUnit: {
            type: Number,
            required: true,
            min: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 10,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Inventory", inventorySchema);