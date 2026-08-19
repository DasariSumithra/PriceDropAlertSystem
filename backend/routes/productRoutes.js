const express = require("express");

const router = express.Router();


// Product Controller
const {
    addProduct,
    getMyProducts,
    getProductById,
    checkProductPriceNow,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");


// Price History Controller
const {
    getPriceHistory
} = require("../controllers/priceHistoryController");


// Authentication Middleware
const {
    protect
} = require("../middleware/authMiddleware");


// ========================================
// CREATE PRODUCT
// POST /api/products
// ========================================

router.post(
    "/",
    protect,
    addProduct
);


// ========================================
// GET ALL USER PRODUCTS
// GET /api/products
// ========================================

router.get(
    "/",
    protect,
    getMyProducts
);


// ========================================
// GET PRICE HISTORY
// GET /api/products/:id/history
// ========================================

router.get(
    "/:id/history",
    protect,
    getPriceHistory
);


// ========================================
// GET SINGLE PRODUCT
// GET /api/products/:id
// ========================================

router.get(
    "/:id",
    protect,
    getProductById
);

router.post(
    "/:id/check",
    protect,
    checkProductPriceNow
);


// ========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ========================================

router.put(
    "/:id",
    protect,
    updateProduct
);


// ========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ========================================

router.delete(
    "/:id",
    protect,
    deleteProduct
);


module.exports = router;