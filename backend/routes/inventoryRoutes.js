const express = require("express");
const router = express.Router();

const Inventory = require("../models/Inventory");

// 1. Add a new inventory item
router.post("/", async (req, res) => {
    try {
        const item = await Inventory.create(req.body);

        res.status(201).json({
            message: "Inventory item added successfully",
            item
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Failed to add inventory item"
        });
    }
});

// 2. Get all inventory items
router.get("/", async (req, res) => {
    try {
        const items = await Inventory.find().sort({
            createdAt: -1
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch inventory items"
        });
    }
});

// 3. Get inventory items with low stock
router.get("/low-stock", async (req, res) => {
    try {
        const items = await Inventory.find({
            $expr: {
                $lte: ["$quantity", "$lowStockThreshold"]
            }
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch low-stock items"
        });
    }
});

// 4. Update an inventory item
router.put("/:id", async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!item) {
            return res.status(404).json({
                message: "Inventory item not found"
            });
        }

        res.status(200).json({
            message: "Inventory item updated successfully",
            item
        });
    } catch (error) {
        if (error.name === "ValidationError" ||
            error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid inventory data or item ID"
            });
        }

        res.status(500).json({
            message: "Failed to update inventory item"
        });
    }
});

// 5. Delete an inventory item
router.delete("/:id", async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Inventory item not found"
            });
        }

        res.status(200).json({
            message: "Inventory item deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid inventory item ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete inventory item"
        });
    }
});

module.exports = router;