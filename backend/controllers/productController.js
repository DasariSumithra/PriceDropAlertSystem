const Product = require("../models/Product");
const { fetchProductDetails } = require("../services/productService");


// Add Product
const addProduct = async (req, res) => {

    try {

        const { productUrl, targetPrice, productId } = req.body;


        if (!productUrl || !targetPrice || !productId) {

            return res.status(400).json({
                message:"Please provide productId, product URL and target price"
            });

        }


        const userId = req.user.id;


        // Fetch product details
        const apiProduct = await fetchProductDetails(productId);


        if(!apiProduct){

            return res.status(404).json({
                message:"Unable to fetch product details"
            });

        }



        const product = await Product.create({

            userId:userId,

            productId:productId,

            title:apiProduct.title,

            productUrl:productUrl,

            currentPrice:apiProduct.price,

            targetPrice:targetPrice,

            isActive:true,

            lastChecked:new Date()

        });



        return res.status(201).json({

            message:"Product added successfully",

            product

        });



    }
    catch(error){

        return res.status(500).json({

            message:error.message

        });

    }

};




// Get Logged-in User Products

const getMyProducts = async(req,res)=>{

    try{


        const products = await Product.find({

            userId:req.user.id

        })
        .sort({
            createdAt:-1
        });



        res.status(200).json({

            count:products.length,

            products

        });


    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};




// Get Single Product

const getProductById = async(req,res)=>{


    try{


        const product = await Product.findById(req.params.id);


        if(!product){

            return res.status(404).json({
                message:"Product not found"
            });

        }



        if(product.userId.toString() !== req.user.id){

            return res.status(403).json({
                message:"Access denied"
            });

        }



        res.status(200).json(product);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }


};




// Update Product

const updateProduct = async(req,res)=>{


    try{


        const product =
        await Product.findById(req.params.id);



        if(!product){

            return res.status(404).json({
                message:"Product not found"
            });

        }



        if(product.userId.toString() !== req.user.id){

            return res.status(403).json({
                message:"Access denied"
            });

        }



        if(req.body.targetPrice){

            product.targetPrice=req.body.targetPrice;

        }


        await product.save();



        res.status(200).json({

            message:"Product updated successfully",

            product

        });



    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }


};




// Delete Product

const deleteProduct = async(req,res)=>{


    try{


        const product =
        await Product.findById(req.params.id);



        if(!product){

            return res.status(404).json({
                message:"Product not found"
            });

        }



        if(product.userId.toString() !== req.user.id){

            return res.status(403).json({
                message:"Access denied"
            });

        }



        await product.deleteOne();



        res.status(200).json({

            message:"Product deleted successfully"

        });



    }
    catch(error){

        res.status(500).json({

            message:error.message

        });

    }

};



module.exports={
    addProduct,
    getMyProducts,
    getProductById,
    updateProduct,
    deleteProduct
};