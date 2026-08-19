const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        checkedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "PriceHistory",
    priceHistorySchema
);