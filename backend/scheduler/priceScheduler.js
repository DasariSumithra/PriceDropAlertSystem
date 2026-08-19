const Product = require("../models/Product");
const PriceHistory = require("../models/PriceHistory");

const {
    fetchProductDetails
} = require("../services/productService");

const {
    sendPriceAlert
} = require("../services/emailService");


// ======================================================
// PREVENT OVERLAPPING SCHEDULER RUNS
// ======================================================

let isPriceCheckRunning = false;


// ======================================================
// CHECK ALL ACTIVE PRODUCTS
// ======================================================

const checkProductPrices = async () => {

    // --------------------------------------------------
    // Prevent overlapping runs
    // --------------------------------------------------

    if (isPriceCheckRunning) {

        console.log(
            "⚠️ Price check is already running. Skipping this run."
        );

        return;

    }


    isPriceCheckRunning = true;


    try {

        console.log("\n========================================");
        console.log("🚀 STARTING PRICE CHECK");
        console.log("========================================");


        // ==================================================
        // GET ACTIVE PRODUCTS
        // ==================================================

        const products =
            await Product.find({

                isActive:
                    true

            })
            .populate("userId");


        console.log(
            `Found ${products.length} active products`
        );


        // ==================================================
        // CHECK PRODUCTS ONE BY ONE
        // ==================================================

        for (const product of products) {

            console.log("\n========================================");

            console.log(
                `Checking: ${product.title}`
            );

            console.log(
                `Website: ${product.website}`
            );

            console.log(
                `URL: ${product.productUrl}`
            );


            try {

                // ==================================================
                // FETCH CURRENT PRODUCT DETAILS
                // ==================================================

                const productDetails =
                    await fetchProductDetails(
                        product.productUrl
                    );


                if (!productDetails) {

                    console.log(
                        `⚠️ Unable to fetch product details: ${product.title}`
                    );

                    console.log(
                        "Skipping product and continuing..."
                    );

                    continue;

                }


                // ==================================================
                // GET CURRENT PRICE
                // ==================================================

                const rawCurrentPrice =
                    productDetails.currentPrice ??
                    productDetails.price;


                const currentPrice =
                    Number(rawCurrentPrice);


                // ==================================================
                // VALIDATE CURRENT PRICE
                // ==================================================

                if (
                    !Number.isFinite(currentPrice) ||
                    currentPrice <= 0
                ) {

                    console.log(
                        `❌ Invalid price received for ${product.title}`
                    );

                    console.log(
                        "Received:",
                        rawCurrentPrice
                    );

                    continue;

                }


                console.log(
                    `💰 Current fetched price: ₹${currentPrice.toFixed(2)}`
                );


                // ==================================================
                // PREVIOUS PRICE
                // ==================================================

                const previousPrice =
                    Number(product.currentPrice);


                // ==================================================
                // TARGET PRICE
                // ==================================================

                const targetPrice =
                    Number(product.targetPrice);


                // ==================================================
                // VALIDATE PREVIOUS PRICE
                // ==================================================

                if (
                    !Number.isFinite(previousPrice) ||
                    previousPrice <= 0
                ) {

                    console.log(
                        `❌ Invalid previous price for ${product.title}`
                    );

                    continue;

                }


                // ==================================================
                // VALIDATE TARGET PRICE
                // ==================================================

                if (
                    !Number.isFinite(targetPrice) ||
                    targetPrice <= 0
                ) {

                    console.log(
                        `❌ Invalid target price for ${product.title}`
                    );

                    continue;

                }


                console.log(
                    `Previous price: ₹${previousPrice.toFixed(2)}`
                );

                console.log(
                    `Target price: ₹${targetPrice.toFixed(2)}`
                );


                // ==================================================
                // PRICE CHANGE
                // ==================================================

                const priceDifference =
                    currentPrice -
                    previousPrice;


                const priceDrop =
                    previousPrice -
                    currentPrice;


                let priceDropPercentage =
                    0;


                if (previousPrice > 0) {

                    priceDropPercentage =
                        (priceDrop / previousPrice) *
                        100;

                }


                // ==================================================
                // PRICE STATE
                // ==================================================

                const priceChanged =
                    currentPrice !== previousPrice;


                const priceDropped =
                    currentPrice < previousPrice;


                const priceIncreased =
                    currentPrice > previousPrice;


                // ==================================================
                // TARGET STATE
                // ==================================================

                const wasAboveTarget =
                    previousPrice >
                    targetPrice;


                const currentlyAtOrBelowTarget =
                    currentPrice <=
                    targetPrice;


                // ==================================================
                // TARGET CROSSING
                // ==================================================

                const newTargetCrossing =
                    wasAboveTarget &&
                    currentlyAtOrBelowTarget;


                console.log(
                    `Current price: ₹${currentPrice.toFixed(2)}`
                );

                console.log(
                    `Price changed: ${priceChanged}`
                );

                console.log(
                    `Price dropped: ${priceDropped}`
                );

                console.log(
                    `Was above target: ${wasAboveTarget}`
                );

                console.log(
                    `Currently at/below target: ${currentlyAtOrBelowTarget}`
                );

                console.log(
                    `New target crossing: ${newTargetCrossing}`
                );


                // ==================================================
                // SAVE PRICE HISTORY
                // ==================================================

                await PriceHistory.create({

                    productId:
                        product._id,

                    price:
                        currentPrice,

                    checkedAt:
                        new Date()

                });


                console.log(
                    `📊 Price history saved: ₹${currentPrice.toFixed(2)}`
                );


                // ==================================================
                // UPDATE CURRENT PRICE
                // ==================================================

                product.currentPrice =
                    currentPrice;

                product.lastChecked =
                    new Date();


                // ==================================================
                // PRICE INFORMATION
                // ==================================================

                if (priceDropped) {

                    console.log(
                        `📉 Price dropped: ₹${previousPrice.toFixed(2)} → ₹${currentPrice.toFixed(2)}`
                    );

                    console.log(
                        `💰 You save: ₹${priceDrop.toFixed(2)}`
                    );

                    console.log(
                        `📊 Drop percentage: ${priceDropPercentage.toFixed(2)}%`
                    );

                }
                else if (priceIncreased) {

                    console.log(
                        `📈 Price increased: ₹${previousPrice.toFixed(2)} → ₹${currentPrice.toFixed(2)}`
                    );

                    console.log(
                        `📊 Increase: ₹${priceDifference.toFixed(2)}`
                    );

                }
                else {

                    console.log(
                        `➡️ Price unchanged: ₹${currentPrice.toFixed(2)}`
                    );

                }


                // ==================================================
                // TARGET PRICE ALERT
                // ==================================================

                if (newTargetCrossing) {

                    console.log(
                        "🎯 TARGET PRICE CROSSED!"
                    );


                    // --------------------------------------------------
                    // Duplicate protection
                    // --------------------------------------------------

                    if (!product.lastAlertSent) {

                        console.log(
                            "📧 No previous alert found."
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

                                targetPrice,

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
                    else {

                        console.log(
                            "📭 Alert already sent."
                        );

                        console.log(
                            `📌 Previous alert: ${product.lastAlertSent}`
                        );

                        console.log(
                            "Duplicate email prevented."
                        );

                    }

                }


                // ==================================================
                // PRICE ABOVE TARGET
                // ==================================================

                if (
                    currentPrice >
                    targetPrice
                ) {

                    console.log(
                        "📈 Price is above target."
                    );


                    if (product.lastAlertSent) {

                        console.log(
                            "🔄 Price moved above target."
                        );

                        console.log(
                            "🔄 Resetting alert state."
                        );


                        product.lastAlertSent =
                            null;

                    }

                }


                // ==================================================
                // SAVE PRODUCT
                // ==================================================

                await product.save();


                console.log(
                    `✅ Product updated successfully: ${product.title}`
                );

            }
            catch (error) {

                // ==================================================
                // ONE PRODUCT FAILURE MUST NOT STOP SCHEDULER
                // ==================================================

                console.error(
                    `❌ Error processing product: ${product.title}`
                );

                console.error(
                    error.message
                );


                if (
                    error.code ===
                    "SCRAPINGDOG_LIMIT"
                ) {

                    console.log(
                        "⚠️ ScrapingDog API limit reached."
                    );

                    console.log(
                        "Skipping this product."
                    );

                }


                console.log(
                    "➡️ Continuing with next product..."
                );

            }

        }


        console.log("\n========================================");

        console.log(
            "✅ PRICE CHECK COMPLETED"
        );

        console.log(
            "========================================\n"
        );

    }
    catch (error) {

        console.error(
            "❌ Price scheduler error:"
        );

        console.error(
            error.message
        );

    }
    finally {

        isPriceCheckRunning =
            false;

    }

};


// ======================================================
// START PRICE SCHEDULER
// ======================================================

const startPriceScheduler = () => {

    console.log(
        "🚀 Price scheduler started."
    );

    console.log(
        "⏰ First price check will run immediately."
    );


    // ==================================================
    // FIRST CHECK
    // ==================================================

    checkProductPrices();


    // ==================================================
    // EVERY 6 HOURS
    // ==================================================

    const SIX_HOURS =
        6 * 60 * 60 * 1000;


    setInterval(() => {

        console.log(
            "⏰ Running scheduled price check..."
        );


        checkProductPrices();

    }, SIX_HOURS);


    console.log(
        "⏰ Price checks will run every 6 hours."
    );

};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    startPriceScheduler,

    checkProductPrices

};