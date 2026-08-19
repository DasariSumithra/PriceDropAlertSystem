// ======================================================
// Update Product
// PUT /api/products/:id
// ======================================================

const updateProduct = async (req, res) => {

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


        // --------------------------------------------------
        // Check whether target price was provided
        // --------------------------------------------------

        if (
            req.body.targetPrice === undefined
        ) {

            return res.status(400).json({

                message:
                    "Target price is required"

            });

        }


        // --------------------------------------------------
        // Convert target price to number
        // --------------------------------------------------

        const newTargetPrice =
            Number(
                req.body.targetPrice
            );


        // --------------------------------------------------
        // Validate target price
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
        // Store old target price
        // --------------------------------------------------

        const oldTargetPrice =
            Number(product.targetPrice);


        // --------------------------------------------------
        // Check whether target actually changed
        // --------------------------------------------------

        const targetChanged =
            oldTargetPrice !== newTargetPrice;


        console.log("\n========================================");
        console.log("🎯 TARGET PRICE UPDATE");
        console.log("========================================");

        console.log(
            "Product:",
            product.title
        );

        console.log(
            `Old target price: ₹${oldTargetPrice.toFixed(2)}`
        );

        console.log(
            `New target price: ₹${newTargetPrice.toFixed(2)}`
        );

        console.log(
            `Current product price: ₹${Number(product.currentPrice).toFixed(2)}`
        );

        console.log(
            "Target changed:",
            targetChanged
        );


        // --------------------------------------------------
        // Update target price
        // --------------------------------------------------

        product.targetPrice =
            newTargetPrice;


        // ==================================================
        // IMMEDIATE TARGET ALERT
        // ==================================================
        //
        // Example:
        //
        // Current price = ₹90
        // Old target    = ₹80
        // New target    = ₹100
        //
        // Current price is already below the NEW target.
        //
        // Therefore send the alert immediately.
        //
        // ==================================================

        const currentPrice =
            Number(product.currentPrice);


        const currentPriceAtOrBelowTarget =
            Number.isFinite(currentPrice) &&
            currentPrice > 0 &&
            currentPrice <= newTargetPrice;


        console.log(
            `Current price <= new target: ${currentPriceAtOrBelowTarget}`
        );


        if (
            targetChanged &&
            currentPriceAtOrBelowTarget
        ) {

            console.log(
                "🎯 Current price is already at/below the new target."
            );

            console.log(
                "📧 Immediate target alert required."
            );


            // --------------------------------------------------
            // Check user email
            // --------------------------------------------------

            if (
                product.userId &&
                product.userId.email
            ) {

                try {

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
                        `✅ Immediate price alert sent to ${product.userId.email}`
                    );

                    console.log(
                        `📌 Alert recorded at: ${product.lastAlertSent}`
                    );

                }
                catch (emailError) {

                    console.error(
                        "❌ Failed to send immediate price alert:"
                    );

                    console.error(
                        emailError.message
                    );


                    // --------------------------------------------------
                    // Do not fail target-price update because email failed
                    // --------------------------------------------------

                    console.log(
                        "⚠️ Target price will still be updated."
                    );

                }

            }
            else {

                console.log(
                    "⚠️ User email not found."
                );

                console.log(
                    "⚠️ Target price will still be updated."
                );

            }

        }


        // ==================================================
        // TARGET IS ABOVE CURRENT PRICE
        // ==================================================
        //
        // If the user changes the target to a value that is
        // BELOW the current price, the previous alert state
        // should not block a future alert.
        //
        // Example:
        //
        // Current = ₹90
        // Old target = ₹100
        // New target = ₹80
        //
        // Current is now above target.
        //
        // Reset alert state so a future drop to ₹80 or below
        // can generate a fresh alert.
        //
        // ==================================================

        if (
            targetChanged &&
            Number.isFinite(currentPrice) &&
            currentPrice > newTargetPrice
        ) {

            console.log(
                "📈 Current price is above the new target."
            );


            if (product.lastAlertSent) {

                console.log(
                    "🔄 Resetting previous alert state."
                );

                product.lastAlertSent =
                    null;

            }

        }


        // --------------------------------------------------
        // Save product
        // --------------------------------------------------

        await product.save();


        console.log(
            "✅ Target price updated successfully."
        );

        console.log(
            `Final target price: ₹${product.targetPrice.toFixed(2)}`
        );

        console.log(
            `Current price: ₹${product.currentPrice.toFixed(2)}`
        );

        console.log(
            "========================================\n"
        );


        // --------------------------------------------------
        // Response
        // --------------------------------------------------

        return res.status(200).json({

            message:
                "Product updated successfully",

            product

        });

    }
    catch (error) {

        console.error(
            "Update Product Error:",
            error
        );


        // --------------------------------------------------
        // Email/API errors
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
        // Generic error
        // --------------------------------------------------

        return res.status(500).json({

            message:
                "Unable to update product right now."

        });

    }

};