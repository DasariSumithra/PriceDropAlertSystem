const express = require("express");

const router = express.Router();

const {
    addProduct,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");

// Create
router.post("/", protect, addProduct);

// Read All
router.get("/", protect, getMyProducts);

// Read One
router.get("/:id", protect, getProductById);

// Update
router.put("/:id", protect, updateProduct);

// Delete
router.delete("/:id", protect, deleteProduct);

module.exports = router;