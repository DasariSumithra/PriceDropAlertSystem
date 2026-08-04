const Product = require("../models/Product");
const { fetchProductDetails } = require("../services/productService");
const { sendPriceAlert } = require("../services/emailService");

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const startPriceScheduler = () => {

    setInterval(async () => {

        try {

            console.log("\nChecking product prices...");

            const products = await Product.find({
                isActive: true
            }).populate("userId", "name email");

            console.log(`Found ${products.length} products`);

            for (const product of products) {

                const apiProduct = await fetchProductDetails(product.productId);

                if (!apiProduct) {
                    continue;
                }

                const currentPrice = apiProduct.price;

                // Update latest product information
                product.currentPrice = currentPrice;
                product.lastChecked = new Date();

                // Send alert only once every 24 hours
                const shouldSendAlert =
                    !product.lastAlertSent ||
                    (Date.now() - new Date(product.lastAlertSent).getTime()) >
                        TWENTY_FOUR_HOURS;

                if (currentPrice <= product.targetPrice && shouldSendAlert) {

                    console.log(`Price dropped for ${product.title}`);

                    await sendPriceAlert(
                        product.userId.email,
                        product.title,
                        currentPrice,
                        product.targetPrice,
                        product.productUrl
                    );

                    product.lastAlertSent = new Date();

                    console.log(
                        `Email sent to ${product.userId.email}`
                    );
                }

                await product.save();
            }

        } catch (error) {

            console.error("Scheduler Error:", error.message);

        }

    }, 60000); // Check every 1 minute
};

module.exports = {
    startPriceScheduler
};