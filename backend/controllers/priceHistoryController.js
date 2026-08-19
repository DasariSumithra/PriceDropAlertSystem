const Product = require("../models/Product");
const PriceHistory = require("../models/PriceHistory");


// ========================================
// GET PRICE HISTORY
// GET /api/products/:id/history
// ========================================

const getPriceHistory = async (req, res) => {

    try {

        const productId = req.params.id;


        // Find product
        const product = await Product.findById(productId);


        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }


        // Check product ownership
        if (
            product.userId.toString() !== req.user.id
        ) {

            return res.status(403).json({

                message: "Access denied"

            });

        }


        // Get price history
        const history = await PriceHistory.find({

            productId: product._id

        }).sort({

            checkedAt: 1

        });


        return res.status(200).json({

            product: {

                id: product._id,

                title: product.title,

                currentPrice: product.currentPrice,

                targetPrice: product.targetPrice

            },

            history: history.map((item) => ({

                price: item.price,

                checkedAt: item.checkedAt

            }))

        });

    }
    catch (error) {

        console.error(
            "Price History Error:",
            error.message
        );


        return res.status(500).json({

            message: error.message

        });

    }

};


module.exports = {

    getPriceHistory

};