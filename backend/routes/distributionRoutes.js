
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Beneficiary = require("../models/Beneficiary");
const Inventory = require("../models/Inventory");
const Distribution = require("../models/Distribution");


// ==========================================
// ISSUE RATION TO A BENEFICIARY
// POST /api/distributions
// ==========================================

router.post("/", async (req, res) => {
    const { beneficiaryId, items, distributedBy } = req.body;

    if (
        !mongoose.isValidObjectId(beneficiaryId) ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        return res.status(400).json({
            message:
                "A valid beneficiary ID and at least one item are required."
        });
    }

    for (const item of items) {
        if (
            !mongoose.isValidObjectId(item.inventoryItem) ||
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            return res.status(400).json({
                message:
                    "Each item needs a valid inventory ID and a positive quantity."
            });
        }
    }

    try {
        const beneficiary = await Beneficiary.findById(beneficiaryId);

        if (!beneficiary || beneficiary.status !== "Active") {
            return res.status(404).json({
                message: "Active beneficiary not found."
            });
        }

        const distributionItems = [];
        let totalAmount = 0;
        const reserved = [];

        try {
            for (const requestedItem of items) {
                const inventory = await Inventory.findOneAndUpdate(
                    {
                        _id: requestedItem.inventoryItem,
                        quantity: { $gte: requestedItem.quantity }
                    },
                    {
                        $inc: {
                            quantity: -requestedItem.quantity
                        }
                    },
                    {
                        new: true
                    }
                );

                if (!inventory) {
                    throw new Error(
                        `Insufficient stock or inventory item not found: ${requestedItem.inventoryItem}`
                    );
                }

                reserved.push({
                    inventoryItem: inventory._id,
                    quantity: requestedItem.quantity
                });

                distributionItems.push({
                    inventoryItem: inventory._id,
                    itemName: inventory.itemName,
                    quantity: requestedItem.quantity,
                    unit: inventory.unit,
                    pricePerUnit: inventory.pricePerUnit
                });

                totalAmount +=
                    requestedItem.quantity * inventory.pricePerUnit;
            }

            const distribution = await Distribution.create({
                beneficiary: beneficiary._id,
                items: distributionItems,
                totalAmount: Number(totalAmount.toFixed(2)),
                distributedBy: distributedBy || "System"
            });

            return res.status(201).json({
                message: "Ration distributed successfully.",
                distribution
            });
        } catch (error) {
            // Restore stock if creating the distribution fails.
            for (const entry of reserved) {
                await Inventory.updateOne(
                    { _id: entry.inventoryItem },
                    {
                        $inc: {
                            quantity: entry.quantity
                        }
                    }
                );
            }

            if (error.name === "ValidationError") {
                return res.status(400).json({
                    message: error.message
                });
            }

            if (error.message.startsWith("Insufficient stock")) {
                return res.status(400).json({
                    message: error.message
                });
            }

            throw error;
        }
    } catch (error) {
        console.error("Distribution error:", error.message);

        return res.status(500).json({
            message: "Failed to record ration distribution."
        });
    }
});

// ==========================================
// GET ALL DISTRIBUTIONS
// GET /api/distributions
// Existing admin/employee history endpoint
// ==========================================

router.get("/", async (req, res) => {
    try {
        const distributions = await Distribution.find()
            .populate("beneficiary", "rationCardNumber fullName")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json(distributions);
    } catch (error) {
        console.error("Fetch distributions error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch distribution history."
        });
    }
});

// ==========================================
// GET DISTRIBUTIONS FOR ONE BENEFICIARY
// GET /api/distributions/beneficiary/:id
// ==========================================

router.get("/beneficiary/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid beneficiary ID."
            });
        }

        const beneficiary = await Beneficiary.findById(id)
            .select("_id rationCardNumber fullName status")
            .lean();

        if (!beneficiary) {
            return res.status(404).json({
                message: "Beneficiary not found."
            });
        }

        const distributions = await Distribution.find({
            beneficiary: beneficiary._id
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            beneficiary: {
                id: beneficiary._id,
                rationCardNumber: beneficiary.rationCardNumber,
                fullName: beneficiary.fullName
            },
            distributions
        });
    } catch (error) {
        console.error(
            "Fetch beneficiary distributions error:",
            error.message
        );

        return res.status(500).json({
            message: "Failed to fetch beneficiary distribution history."
        });
    }
});

module.exports = router;
