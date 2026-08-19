import api from "../api/axios";


// ==========================================
// GET ALL PRODUCTS
// ==========================================

export const getProducts = async () => {

    const response = await api.get("/products");

    return response.data;

};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export const getProductById = async (id) => {

    const response =
        await api.get(`/products/${id}`);

    return response.data;

};


// ==========================================
// ADD PRODUCT
// ==========================================

export const addProduct = async (productData) => {

    const response =
        await api.post(
            "/products",
            productData
        );

    return response.data;

};
// ==========================================
// CHECK PRODUCT PRICE NOW
// ==========================================

export const checkProductPriceNow = async (id) => {

    const response =
        await api.post(
            `/products/${id}/check`
        );

    return response.data;

};

// ==========================================
// UPDATE PRODUCT
// ==========================================

export const updateProduct = async (
    id,
    productData
) => {

    const response =
        await api.put(
            `/products/${id}`,
            productData
        );

    return response.data;

};


// ==========================================
// DELETE PRODUCT
// ==========================================

export const deleteProduct = async (id) => {

    const response =
        await api.delete(
            `/products/${id}`
        );

    return response.data;

};


// ==========================================
// GET PRICE HISTORY
// ==========================================

export const getPriceHistory = async (id) => {

    const response =
        await api.get(
            `/products/${id}/history`
        );

    return response.data;

};