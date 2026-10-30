const mongoose = require("mongoose");

const distributionSchema = new mongoose.Schema(
    {
        beneficiary: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Beneficiary",
            required: true
        },
        items: [
            {
                inventoryItem: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Inventory",
                    required: true
                },
                itemName: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 0.001
                },
                unit: {
                    type: String,
                    required: true
                },
                pricePerUnit: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        distributedBy: {
            type: String,
            default: "System"
        },
        distributionDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ["Completed", "Cancelled"],
            default: "Completed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Distribution", distributionSchema);