const Product = require("../models/Product");
const PriceHistory = require("../models/PriceHistory");

console.log("=================================");
console.log("PRODUCT MODEL CHECK");
console.log("Product type:", typeof Product);
console.log("Product model name:", Product?.modelName);
console.log("Product.find type:", typeof Product?.find);
console.log("Product.create type:", typeof Product?.create);
console.log("=================================");

const {
    fetchProductDetails,
    detectWebsite
} = require("../services/productService");

const {
    sendPriceAlert
} = require("../services/emailService");


// ======================================================
// Add Product
// POST /api/products
// ======================================================

const addProduct = async (req, res) => {

    try {

        const {
            productUrl,
            targetPrice
        } = req.body;


        // --------------------------------------------------
        // Validate input
        // --------------------------------------------------

        if (!productUrl || !targetPrice) {

            return res.status(400).json({

                message:
                    "Please provide product URL and target price"

            });

        }


        // --------------------------------------------------
        // Validate target price
        // --------------------------------------------------

        const numericTargetPrice =
            Number(targetPrice);


        if (
            !Number.isFinite(numericTargetPrice) ||
            numericTargetPrice <= 0
        ) {

            return res.status(400).json({

                message:
                    "Target price must be a valid positive number"

            });

        }


        // --------------------------------------------------
        // Detect website
        // --------------------------------------------------

        const website =
            detectWebsite(productUrl);


        if (website === "invalid") {

            return res.status(400).json({

                message:
                    "Please provide a valid product URL"

            });

        }


        if (website === "unknown") {

            return res.status(400).json({

                message:
                    "This e-commerce website is not supported yet"

            });

        }


        // --------------------------------------------------
        // Get logged-in user
        // --------------------------------------------------

        const userId =
            req.user.id;


        // --------------------------------------------------
        // Fetch real product details
        // --------------------------------------------------

        console.log(
            `Fetching product from ${website}...`
        );


        const productDetails =
            await fetchProductDetails(
                productUrl
            );


        // --------------------------------------------------
        // Product details could not be fetched
        // --------------------------------------------------

        if (!productDetails) {

            let message =
                "Unable to fetch product details.";


            if (website === "amazon") {

                message =
                    "Unable to fetch Amazon product details. The product page may be blocking the request or the price could not be found.";

            }


            if (website === "myntra") {

                message =
                    "Unable to fetch Myntra product details. The product price could not be found.";

            }


            if (website === "flipkart") {

                message =
                    "Unable to fetch Flipkart product details. The product price could not be found.";

            }


            return res.status(400).json({

                message

            });

        }


        // ==================================================
        // GET CURRENT PRICE
        // ==================================================

        const currentPrice =
            productDetails.currentPrice ??
            productDetails.price;


        console.log(
            "Product details received:"
        );

        console.log(
            "Title:",
            productDetails.title
        );

        console.log(
            "Current price:",
            currentPrice
        );

        console.log(
            "Amazon/service currentPrice:",
            productDetails.currentPrice
        );

        console.log(
            "Legacy price:",
            productDetails.price
        );


        // --------------------------------------------------
        // Validate current price
        // --------------------------------------------------

        if (
            currentPrice === undefined ||
            currentPrice === null ||
            !Number.isFinite(Number(currentPrice)) ||
            Number(currentPrice) <= 0
        ) {

            console.error(
                "Invalid price received for:",
                productDetails.title
            );

            console.error(
                "Full product details:",
                productDetails
            );


            return res.status(400).json({

                message:
                    "Unable to fetch a valid current price for this product."

            });

        }


        // --------------------------------------------------
        // Convert current price to Number
        // --------------------------------------------------

        const numericCurrentPrice =
            Number(currentPrice);


        // ==================================================
        // CREATE PRODUCT
        // ==================================================

        const product =
            await Product.create({

                userId:
                    userId,

                title:
                    productDetails.title,

                productUrl:
                    productUrl,

                currentPrice:
                    numericCurrentPrice,

                targetPrice:
                    numericTargetPrice,

                website:
                    website,

                isActive:
                    true,

                lastChecked:
                    new Date()

            });


        // ==================================================
        // CREATE INITIAL PRICE HISTORY
        // ==================================================

        await PriceHistory.create({

            productId:
                product._id,

            price:
                numericCurrentPrice,

            checkedAt:
                new Date()

        });


        // --------------------------------------------------
        // Success logs
        // --------------------------------------------------

        console.log(
            "========================================"
        );

        console.log(
            "PRODUCT CREATED SUCCESSFULLY"
        );

        console.log(
            "Title:",
            product.title
        );

        console.log(
            "Website:",
            product.website
        );

        console.log(
            "Current Price:",
            product.currentPrice
        );

        console.log(
            "Target Price:",
            product.targetPrice
        );

        console.log(
            "INITIAL PRICE HISTORY CREATED"
        );

        console.log(
            "========================================"
        );


        // --------------------------------------------------
        // Success response
        // --------------------------------------------------

        return res.status(201).json({

            message:
                "Product added successfully",

            product

        });

    }
    catch (error) {

        console.error(
            "Add Product Error:",
            error
        );


        // --------------------------------------------------
        // ScrapingDog account limit
        // --------------------------------------------------

        if (
            error.code ===
            "SCRAPINGDOG_LIMIT"
        ) {

            return res.status(429).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // Missing ScrapingDog API key
        // --------------------------------------------------

        if (
            error.code ===
            "MISSING_SCRAPINGDOG_KEY"
        ) {

            return res.status(500).json({

                message:
                    "ScrapingDog API key is not configured on the server."

            });

        }


        // --------------------------------------------------
        // Myntra API error
        // --------------------------------------------------

        if (
            error.code ===
            "MYNTRA_API_ERROR"
        ) {

            return res.status(502).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // Flipkart API error
        // --------------------------------------------------

        if (
            error.code ===
            "FLIPKART_API_ERROR"
        ) {

            return res.status(502).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // Generic error
        // --------------------------------------------------

        return res.status(500).json({

            message:
                "Something went wrong while adding the product."

        });

    }

};


// ======================================================
// Get Logged-in User Products
// GET /api/products
// ======================================================

const getMyProducts = async (req, res) => {

    try {

        const products =
            await Product.find({

                userId:
                    req.user.id

            })
            .sort({

                createdAt:
                    -1

            });


        return res.status(200).json({

            count:
                products.length,

            products

        });

    }
    catch (error) {

        return res.status(500).json({

            message:
                error.message

        });

    }

};


// ======================================================
// Get Single Product
// GET /api/products/:id
// ======================================================

const getProductById = async (req, res) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        // --------------------------------------------------
        // Ownership check
        // --------------------------------------------------

        if (
            product.userId.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            });

        }


        return res.status(200).json(
            product
        );

    }
    catch (error) {

        return res.status(500).json({

            message:
                error.message

        });

    }

};


// ======================================================
// Check Product Price Now
// POST /api/products/:id/check
// ======================================================

const checkProductPriceNow = async (req, res) => {

    try {

        // --------------------------------------------------
        // Find product
        // --------------------------------------------------

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        // --------------------------------------------------
        // Check ownership
        // --------------------------------------------------

        if (
            product.userId.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            });

        }


        console.log(
            "========================================"
        );

        console.log(
            `🔄 Manual price check: ${product.title}`
        );

        console.log(
            "Website:",
            product.website
        );

        console.log(
            "URL:",
            product.productUrl
        );


        // --------------------------------------------------
        // Fetch latest product details
        // --------------------------------------------------

        const productDetails =
            await fetchProductDetails(
                product.productUrl
            );


        if (!productDetails) {

            return res.status(400).json({

                message:
                    "Unable to fetch the latest product price."

            });

        }


        // --------------------------------------------------
        // Support Amazon + Myntra + Flipkart
        // --------------------------------------------------

        const currentPrice =
            productDetails.currentPrice ??
            productDetails.price;


        console.log(
            "Fetched product details:",
            productDetails
        );

        console.log(
            "Fetched current price:",
            currentPrice
        );


        // --------------------------------------------------
        // Validate price
        // --------------------------------------------------

        const numericCurrentPrice =
            Number(currentPrice);


        if (
            !Number.isFinite(numericCurrentPrice) ||
            numericCurrentPrice <= 0
        ) {

            console.error(
                "Invalid price received:",
                currentPrice
            );


            return res.status(400).json({

                message:
                    "Invalid price received from the website."

            });

        }


        // --------------------------------------------------
        // Save price history
        // --------------------------------------------------

        await PriceHistory.create({

            productId:
                product._id,

            price:
                numericCurrentPrice,

            checkedAt:
                new Date()

        });


        // --------------------------------------------------
        // Update product
        // --------------------------------------------------

        product.currentPrice =
            numericCurrentPrice;

        product.lastChecked =
            new Date();


        await product.save();


        console.log(
            `✅ Manual price check completed: ₹${numericCurrentPrice.toFixed(2)}`
        );

        console.log(
            "========================================"
        );


        // --------------------------------------------------
        // Response
        // --------------------------------------------------

        return res.status(200).json({

            message:
                "Price checked successfully",

            product

        });

    }
    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "MANUAL PRICE CHECK ERROR"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "========================================"
        );


        // --------------------------------------------------
        // ScrapingDog limit
        // --------------------------------------------------

        if (
            error.code ===
            "SCRAPINGDOG_LIMIT"
        ) {

            return res.status(429).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // ScrapingDog timeout
        // --------------------------------------------------

        if (
            error.code ===
            "SCRAPINGDOG_TIMEOUT"
        ) {

            return res.status(504).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // Missing API key
        // --------------------------------------------------

        if (
            error.code ===
            "MISSING_SCRAPINGDOG_KEY"
        ) {

            return res.status(500).json({

                message:
                    "ScrapingDog API key is not configured on the server."

            });

        }


        // --------------------------------------------------
        // Myntra error
        // --------------------------------------------------

        if (
            error.code ===
            "MYNTRA_API_ERROR"
        ) {

            return res.status(502).json({

                message:
                    error.message ||
                    "Unable to fetch the Myntra product price right now."

            });

        }


        // --------------------------------------------------
        // Flipkart error
        // --------------------------------------------------

        if (
            error.code ===
            "FLIPKART_API_ERROR"
        ) {

            return res.status(502).json({

                message:
                    error.message ||
                    "Unable to fetch the Flipkart product price right now."

            });

        }


        // --------------------------------------------------
        // Generic error
        // --------------------------------------------------

        return res.status(500).json({

            message:
                "Unable to check product price right now."

        });

    }

};


// ======================================================
// Update Product
// PUT /api/products/:id
// ======================================================
//
// IMPORTANT:
// If the user changes the target price and the current
// price is already at/below the NEW target price,
// send the email immediately.
//
// Example:
//
// Current price = ₹90.90
// Old target    = ₹80
// New target    = ₹91
//
// ₹90.90 <= ₹91
//
// Therefore send alert immediately.
// ======================================================

const updateProduct = async (req, res) => {

    try {

        // --------------------------------------------------
        // Find product and populate user
        // --------------------------------------------------

        const product =
            await Product
                .findById(req.params.id)
                .populate("userId");


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        // --------------------------------------------------
        // Check ownership
        // --------------------------------------------------

        if (
            product.userId._id.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            });

        }


        // --------------------------------------------------
        // Update target price
        // --------------------------------------------------

        if (
            req.body.targetPrice !== undefined
        ) {

            const newTargetPrice =
                Number(
                    req.body.targetPrice
                );


            // --------------------------------------------------
            // Validate new target
            // --------------------------------------------------

            if (
                !Number.isFinite(newTargetPrice) ||
                newTargetPrice <= 0
            ) {

                return res.status(400).json({

                    message:
                        "Target price must be a valid positive number"

                });

            }


            // --------------------------------------------------
            // Existing values
            // --------------------------------------------------

            const oldTargetPrice =
                Number(product.targetPrice);

            const currentPrice =
                Number(product.currentPrice);


            console.log(
                "========================================"
            );

            console.log(
                "🎯 TARGET PRICE UPDATE"
            );

            console.log(
                `Old target price: ₹${oldTargetPrice.toFixed(2)}`
            );

            console.log(
                `New target price: ₹${newTargetPrice.toFixed(2)}`
            );

            console.log(
                `Current product price: ₹${currentPrice.toFixed(2)}`
            );


            // --------------------------------------------------
            // Update target
            // --------------------------------------------------

            product.targetPrice =
                newTargetPrice;


            // --------------------------------------------------
            // Check whether current price already reached
            // new target
            // --------------------------------------------------

            const targetReached =
                Number.isFinite(currentPrice) &&
                currentPrice > 0 &&
                currentPrice <= newTargetPrice;


            console.log(
                `Current price <= new target: ${targetReached}`
            );


            // ==================================================
            // IMMEDIATE TARGET ALERT
            // ==================================================

            if (
                targetReached &&
                !product.lastAlertSent
            ) {

                console.log(
                    "🎯 NEW TARGET ALREADY REACHED!"
                );

                console.log(
                    "📧 Attempting to send price alert..."
                );


                // --------------------------------------------------
                // Check user email
                // --------------------------------------------------

                if (
                    product.userId &&
                    product.userId.email
                ) {

                    await sendPriceAlert(

                        product.userId.email,

                        product.title,

                        currentPrice,

                        newTargetPrice,

                        product.productUrl

                    );


                    // --------------------------------------------------
                    // Record alert
                    // --------------------------------------------------

                    product.lastAlertSent =
                        new Date();


                    console.log(
                        `✅ Price alert sent to ${product.userId.email}`
                    );

                    console.log(
                        `📌 Alert recorded at: ${product.lastAlertSent}`
                    );

                }
                else {

                    console.log(
                        "⚠️ User email not found."
                    );

                    console.log(
                        "⚠️ Alert was not sent."
                    );

                }

            }
            else if (
                targetReached &&
                product.lastAlertSent
            ) {

                console.log(
                    "📭 Product is already at/below target."
                );

                console.log(
                    "📭 Alert was already sent previously."
                );

            }
            else {

                console.log(
                    "📈 Current price is above target."
                );

                console.log(
                    "📭 No immediate alert required."
                );

            }


            console.log(
                "========================================"
            );

        }


        // --------------------------------------------------
        // Save product
        // --------------------------------------------------

        await product.save();


        return res.status(200).json({

            message:
                "Product updated successfully",

            product

        });

    }
    catch (error) {

        console.error(
            "========================================"
        );

        console.error(
            "UPDATE PRODUCT ERROR"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            error
        );

        console.error(
            "========================================"
        );


        // --------------------------------------------------
        // Email authentication error
        // --------------------------------------------------

        if (
            error.code ===
            "EAUTH"
        ) {

            return res.status(500).json({

                message:
                    "Email authentication failed. Please check your email configuration."

            });

        }


        // --------------------------------------------------
        // ScrapingDog limit
        // --------------------------------------------------

        if (
            error.code ===
            "SCRAPINGDOG_LIMIT"
        ) {

            return res.status(429).json({

                message:
                    error.message

            });

        }


        // --------------------------------------------------
        // Missing API key
        // --------------------------------------------------

        if (
            error.code ===
            "MISSING_SCRAPINGDOG_KEY"
        ) {

            return res.status(500).json({

                message:
                    "ScrapingDog API key is not configured on the server."

            });

        }


        return res.status(500).json({

            message:
                error.message ||
                "Unable to update product."

        });

    }

};


// ======================================================
// Delete Product
// DELETE /api/products/:id
// ======================================================

const deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                message:
                    "Product not found"

            });

        }


        // --------------------------------------------------
        // Ownership check
        // --------------------------------------------------

        if (
            product.userId.toString() !==
            req.user.id
        ) {

            return res.status(403).json({

                message:
                    "Access denied"

            });

        }


        await product.deleteOne();


        return res.status(200).json({

            message:
                "Product deleted successfully"

        });

    }
    catch (error) {

        return res.status(500).json({

            message:
                error.message

        });

    }

};


// ======================================================
// Exports
// ======================================================

module.exports = {

    addProduct,

    getMyProducts,

    getProductById,

    checkProductPriceNow,

    updateProduct,

    deleteProduct

};