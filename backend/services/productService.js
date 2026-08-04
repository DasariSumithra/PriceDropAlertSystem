const axios = require("axios");

const fetchProductDetails = async (productId = 1) => {
    try {

        const response = await axios.get(
            `https://dummyjson.com/products/${productId}`
        );

        console.log("===== API RESPONSE =====");
        console.log(response.data);
        console.log("========================");

        return response.data;

    } catch (error) {

        console.log("Product API Error:", error.message);

        return null;
    }
};

module.exports = {
    fetchProductDetails
};