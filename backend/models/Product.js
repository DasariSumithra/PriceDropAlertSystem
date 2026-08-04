const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    productId:Number,

    title:String,

    productUrl:String,

    currentPrice:Number,

    targetPrice:Number,

    isActive:{
        type:Boolean,
        default:true
    },

    lastChecked:{
        type:Date,
        default:Date.now
    },

    lastAlertSent:{
        type:Date,
        default:null
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Product", productSchema);