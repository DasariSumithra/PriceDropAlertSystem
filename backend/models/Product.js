const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        // --------------------------------------------------
        // User who owns the product
        // --------------------------------------------------
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // --------------------------------------------------
        // Product information
        // --------------------------------------------------
        productId: {
            type: String
        },

        title: {
            type: String,
            required: true
        },

        productUrl: {
            type: String,
            required: true
        },

        website: {
            type: String,
            required: true,
            enum: [
                "amazon",
                "flipkart",
                "myntra"
            ]
        },

        // --------------------------------------------------
        // Price information
        // --------------------------------------------------
        currentPrice: {
            type: Number,
            required: true
        },

        targetPrice: {
            type: Number,
            required: true
        },

        // --------------------------------------------------
        // Tracking status
        // --------------------------------------------------
        isActive: {
            type: Boolean,
            default: true
        },

        // Last time scheduler attempted to check
        lastChecked: {
            type: Date,
            default: null
        },

        // Last time scheduler successfully fetched price
        lastSuccessfulCheck: {
            type: Date,
            default: null
        },


        // --------------------------------------------------
        // Fetch status
        // --------------------------------------------------
        fetchStatus: {
            type: String,
            enum: [
                "tracking",
                "temporarily_unavailable",
                "error"
            ],
            default: "tracking"
        },

        // Last error received while fetching
        lastError: {
            type: String,
            default: null
        },

        // Number of consecutive failed checks
        consecutiveFailures: {
            type: Number,
            default: 0
        },

        // --------------------------------------------------
        // Email alert information
        // --------------------------------------------------
        lastAlertSent: {
            type: Date,
            default: null
        }
        
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Product",
    productSchema
);