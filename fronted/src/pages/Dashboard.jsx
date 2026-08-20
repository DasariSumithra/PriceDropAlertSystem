import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

import {
    getProducts,
    deleteProduct,
    checkProductPriceNow
} from "../services/productService";


function Dashboard() {

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    // Stores the ID of the product currently being checked
    const [checkingPrice, setCheckingPrice] = useState(null);

    // Stores the price BEFORE the latest manual price check
    const [previousPrices, setPreviousPrices] = useState({});

    // Stores the product ID waiting for delete confirmation
    const [deleteId, setDeleteId] = useState(null);

    // Prevents multiple delete clicks while deleting
    const [deleting, setDeleting] = useState(false);


    // ======================================================
    // LOAD PRODUCTS
    // ======================================================

    const loadProducts = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await getProducts();

            setProducts(response.products || []);

        }
        catch (err) {

            console.log(err);

            setError(
                err.response?.data?.message ||
                "Unable to load products."
            );

        }
        finally {

            setLoading(false);

        }

    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        loadProducts();

    }, []);


    // ======================================================
    // OPEN DELETE CONFIRMATION
    // ======================================================

    const handleDelete = (id) => {

        setDeleteId(id);

    };


    // ======================================================
    // CONFIRM DELETE PRODUCT
    // ======================================================

    const confirmDelete = async () => {

        if (!deleteId) {

            return;

        }

        try {

            setDeleting(true);

            setError("");

            await deleteProduct(deleteId);

            setSuccess(
                "Product deleted successfully."
            );

            // Close modal
            setDeleteId(null);

            // Reload products
            await loadProducts();

            setTimeout(() => {

                setSuccess("");

            }, 3000);

        }
        catch (err) {

            console.error(
                "Delete product error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to delete product."
            );

        }
        finally {

            setDeleting(false);

        }

    };


    // ======================================================
    // CHECK PRODUCT PRICE NOW
    // ======================================================

    const handleCheckPrice = async (id) => {

        // ==================================================
        // FIND PRODUCT BEFORE CHECKING
        // ==================================================

        const existingProduct =
            products.find(
                product => product._id === id
            );


        if (!existingProduct) {

            setError(
                "Product not found."
            );

            return;

        }


        // ==================================================
        // SAVE OLD PRICE LOCALLY
        // ==================================================

        const oldPrice =
            Number(existingProduct.currentPrice);


        try {

            // ==================================================
            // START CHECKING
            // ==================================================

            setCheckingPrice(id);

            setError("");

            setSuccess("");


            console.log(
                "========================================"
            );

            console.log(
                "MANUAL PRICE CHECK"
            );

            console.log(
                "Product:",
                existingProduct.title
            );

            console.log(
                "Old price:",
                oldPrice
            );

            console.log(
                "Checking latest price..."
            );


            // ==================================================
            // CALL BACKEND
            // ==================================================

            const response =
                await checkProductPriceNow(id);


            console.log(
                "Price check response:",
                response
            );


            // ==================================================
            // UPDATE PRODUCT
            // ==================================================

            if (response.product) {

                const newProduct =
                    response.product;


                const newPrice =
                    Number(newProduct.currentPrice);


                const priceDifference =
                    newPrice - oldPrice;


                console.log(
                    "New price:",
                    newPrice
                );


                console.log(
                    "Price difference:",
                    priceDifference
                );


                // ==============================================
                // UPDATE PRODUCT WITH NEW PRICE
                // ==============================================

                setProducts(prevProducts =>

                    prevProducts.map(product =>

                        product._id === id
                            ? newProduct
                            : product

                    )

                );


                // ==============================================
                // SAVE OLD PRICE ONLY AFTER API COMPLETES
                // ==============================================

                setPreviousPrices(prev => ({

                    ...prev,

                    [id]: oldPrice

                }));

            }


            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            setSuccess(
                response.message ||
                "Price checked successfully."
            );


            setTimeout(() => {

                setSuccess("");

            }, 3000);

        }
        catch (err) {

            console.error(
                "Manual price check error:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to check product price right now."
            );

        }
        finally {

            // ==================================================
            // STOP SPINNER ONLY AFTER API COMPLETES
            // ==================================================

            setCheckingPrice(null);

        }

    };


    // ======================================================
    // ACTIVE PRODUCTS
    // ======================================================

    const activeProducts =
        products.filter(
            product =>
                product.isActive
        );


    // ======================================================
    // TARGET REACHED
    // ======================================================

    const targetReached =
        products.filter(
            product =>
                Number(product.currentPrice) <=
                Number(product.targetPrice)
        );


    return (

        <div className="min-h-screen bg-slate-50">

            <Navbar />


            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-4
                    sm:px-6
                    lg:px-8
                    py-8
                "
            >


                {/* ==================================================
                    WELCOME
                ================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        bg-gradient-to-br
                        from-indigo-600
                        via-indigo-700
                        to-purple-700
                        p-8
                        md:p-10
                        text-white
                        shadow-xl
                        shadow-indigo-200
                        mb-8
                    "
                >

                    <div
                        className="
                            absolute
                            -right-20
                            -top-20
                            w-64
                            h-64
                            bg-white/10
                            rounded-full
                        "
                    />


                    <div
                        className="
                            absolute
                            -bottom-24
                            right-32
                            w-48
                            h-48
                            bg-white/10
                            rounded-full
                        "
                    />


                    <div className="relative">

                        <p
                            className="
                                text-indigo-200
                                text-sm
                                font-semibold
                                uppercase
                                tracking-wider
                            "
                        >
                            Price Alert Dashboard
                        </p>


                        <h1
                            className="
                                text-3xl
                                md:text-4xl
                                font-bold
                                mt-2
                            "
                        >
                            Track smarter. Save more. 💰
                        </h1>


                        <p
                            className="
                                text-indigo-100
                                mt-3
                                max-w-2xl
                            "
                        >
                            Keep an eye on your favorite products and
                            receive alerts when prices reach your target.
                        </p>

                    </div>

                </section>


                {/* ==================================================
                    ERROR MESSAGE
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-red-700
                            text-sm
                        "
                    >
                        {error}
                    </div>

                )}


                {/* ==================================================
                    SUCCESS MESSAGE
                ================================================== */}

                {success && (

                    <div
                        className="
                            mb-6
                            rounded-xl
                            border
                            border-emerald-200
                            bg-emerald-50
                            px-4
                            py-3
                            text-emerald-700
                            text-sm
                        "
                    >
                        {success}
                    </div>

                )}


                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-5
                        mb-10
                    "
                >

                    {/* Total Products */}

                    <div
                        className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div className="flex justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Total Products
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-slate-900
                                        mt-2
                                    "
                                >
                                    {products.length}
                                </p>

                            </div>


                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-indigo-50
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                "
                            >
                                📦
                            </div>

                        </div>

                    </div>


                    {/* Active Alerts */}

                    <div
                        className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div className="flex justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Active Alerts
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-slate-900
                                        mt-2
                                    "
                                >
                                    {activeProducts.length}
                                </p>

                            </div>


                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-blue-50
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                "
                            >
                                🔔
                            </div>

                        </div>

                    </div>


                    {/* Target Reached */}

                    <div
                        className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div className="flex justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Target Reached
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-emerald-600
                                        mt-2
                                    "
                                >
                                    {targetReached.length}
                                </p>

                            </div>


                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-emerald-50
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                "
                            >
                                🎯
                            </div>

                        </div>

                    </div>


                    {/* Price Monitoring */}

                    <div
                        className="
                            bg-white
                            border
                            border-slate-200
                            rounded-2xl
                            p-5
                            shadow-sm
                        "
                    >

                        <div className="flex justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Price Monitoring
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-purple-600
                                        mt-2
                                    "
                                >
                                    ON
                                </p>

                            </div>


                            <div
                                className="
                                    w-12
                                    h-12
                                    rounded-xl
                                    bg-purple-50
                                    flex
                                    items-center
                                    justify-center
                                    text-xl
                                "
                            >
                                📈
                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    PRODUCTS HEADING
                ================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-4
                        mb-6
                    "
                >

                    <div>

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-slate-900
                            "
                        >
                            My Products
                        </h2>


                        <p
                            className="
                                text-sm
                                text-slate-500
                                mt-1
                            "
                        >
                            Products you are currently monitoring.
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loading && (

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-6
                        "
                    >

                        {[1, 2, 3].map(item => (

                            <div
                                key={item}
                                className="
                                    h-80
                                    bg-white
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    animate-pulse
                                "
                            />

                        ))}

                    </div>

                )}


                {/* ==================================================
                    EMPTY STATE
                ================================================== */}

                {!loading &&
                    products.length === 0 && (

                    <div
                        className="
                            bg-white
                            border
                            border-dashed
                            border-slate-300
                            rounded-3xl
                            p-12
                            text-center
                        "
                    >

                        <div
                            className="
                                w-20
                                h-20
                                rounded-full
                                bg-indigo-50
                                flex
                                items-center
                                justify-center
                                mx-auto
                                text-3xl
                            "
                        >
                            🛍️
                        </div>


                        <h3
                            className="
                                text-xl
                                font-bold
                                text-slate-900
                                mt-5
                            "
                        >
                            No products yet
                        </h3>


                        <p
                            className="
                                text-slate-500
                                mt-2
                            "
                        >
                            Start tracking a product and we'll monitor
                            its price for you.
                        </p>

                    </div>

                )}


                {/* ==================================================
                    PRODUCT GRID
                ================================================== */}

                {!loading &&
                    products.length > 0 && (

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-6
                        "
                    >

                        {products.map(product => (

                            <ProductCard
                                key={product._id}
                                product={product}
                                onDelete={handleDelete}
                                onCheckPrice={handleCheckPrice}
                                checkingPrice={
                                    checkingPrice === product._id
                                }
                                previousPrice={
                                    previousPrices[product._id]
                                }
                            />

                        ))}

                    </div>

                )}

            </main>


            {/* ======================================================
                DELETE CONFIRMATION MODAL
            ====================================================== */}

            {deleteId && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-950/60
                        backdrop-blur-sm
                        px-4
                    "
                    onClick={() => {
                        if (!deleting) {
                            setDeleteId(null);
                        }
                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-md
                            overflow-hidden
                            rounded-3xl
                            bg-white
                            shadow-2xl
                            border
                            border-white/20
                        "
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Modal Header */}

                        <div
                            className="
                                px-6
                                pt-6
                                pb-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-red-100
                                        text-2xl
                                    "
                                >
                                    🗑️
                                </div>


                                <div className="flex-1">

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-slate-900
                                        "
                                    >
                                        Delete Product?
                                    </h2>


                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        This action cannot be undone.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() =>
                                        setDeleteId(null)
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-slate-400
                                        hover:bg-slate-100
                                        hover:text-slate-600
                                        transition
                                        disabled:opacity-40
                                    "
                                    aria-label="Close"
                                >
                                    ✕
                                </button>

                            </div>

                        </div>


                        {/* Modal Content */}

                        <div
                            className="
                                px-6
                                pb-6
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    bg-red-50
                                    border
                                    border-red-100
                                    px-4
                                    py-4
                                "
                            >

                                <p
                                    className="
                                        text-sm
                                        leading-6
                                        text-red-800
                                    "
                                >
                                    Are you sure you want to delete this
                                    product? Your product will be removed
                                    from your dashboard.
                                </p>

                            </div>

                        </div>


                        {/* Modal Buttons */}

                        <div
                            className="
                                flex
                                flex-col-reverse
                                sm:flex-row
                                sm:justify-end
                                gap-3
                                bg-slate-50
                                border-t
                                border-slate-100
                                px-6
                                py-4
                            "
                        >

                            <button
                                type="button"
                                disabled={deleting}
                                onClick={() =>
                                    setDeleteId(null)
                                }
                                className="
                                    w-full
                                    sm:w-auto
                                    rounded-xl
                                    border
                                    border-slate-300
                                    bg-white
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    hover:bg-slate-100
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={deleting}
                                onClick={confirmDelete}
                                className="
                                    w-full
                                    sm:w-auto
                                    rounded-xl
                                    bg-red-600
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    hover:bg-red-700
                                    hover:shadow-md
                                    transition
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                "
                            >

                                {deleting ? (

                                    <>

                                        <span
                                            className="
                                                h-4
                                                w-4
                                                rounded-full
                                                border-2
                                                border-white
                                                border-t-transparent
                                                animate-spin
                                            "
                                        />

                                        Deleting...

                                    </>

                                ) : (

                                    <>
                                        🗑️ Delete Product
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Dashboard;