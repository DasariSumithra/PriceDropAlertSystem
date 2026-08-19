import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { addProduct } from "../services/productService";


function AddProduct() {

    const navigate = useNavigate();


    // ==========================================
    // Form State
    // ==========================================

    const [formData, setFormData] = useState({

        productUrl: "",

        targetPrice: ""

    });


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    // ==========================================
    // Handle Input Changes
    // ==========================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value

        });

    };


    // ==========================================
    // Submit Product
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");

        setLoading(true);


        try {

            await addProduct({

                productUrl:
                    formData.productUrl,

                targetPrice:
                    Number(
                        formData.targetPrice
                    )

            });


            // Successfully added
            navigate("/dashboard");


        }
        catch (error) {

            console.error(
                "Add Product Error:",
                error
            );


            setError(

                error.response?.data?.message ||

                "Failed to add product. Please try again."

            );

        }
        finally {

            setLoading(false);

        }

    };


    return (

        <div className="
            min-h-screen
            bg-slate-50
        ">

            <Navbar />


            <main className="
                max-w-3xl
                mx-auto
                px-4
                sm:px-6
                py-10
            ">


                {/* =================================
                    Back To Dashboard
                ================================== */}

                <Link
                    to="/dashboard"
                    className="
                        text-sm
                        font-medium
                        text-indigo-600
                        hover:text-indigo-700
                    "
                >
                    ← Back to dashboard
                </Link>


                {/* =================================
                    Page Header
                ================================== */}

                <div className="
                    mt-5
                    mb-8
                ">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-slate-900
                    ">
                        Add Product
                    </h1>


                    <p className="
                        text-slate-500
                        mt-2
                    ">
                        Paste a product URL and we'll
                        monitor its price for you.
                    </p>

                </div>


                {/* =================================
                    Form Card
                ================================== */}

                <div className="
                    bg-white
                    rounded-3xl
                    border
                    border-slate-200
                    shadow-sm
                    p-6
                    sm:p-8
                ">


                    {/* =================================
                        Error Message
                    ================================== */}

                    {error && (

                        <div className="
                            mb-6
                            p-4
                            rounded-xl
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            text-sm
                        ">

                            {error}

                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >


                        {/* =================================
                            Product URL
                        ================================== */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Product URL
                            </label>


                            <input
                                type="url"
                                name="productUrl"
                                value={
                                    formData.productUrl
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="https://www.amazon.in/..."
                                required
                                className="
                                    w-full
                                    px-4
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    outline-none
                                    focus:border-indigo-500
                                    focus:ring-4
                                    focus:ring-indigo-100
                                "
                            />


                            <p className="
                                mt-2
                                text-xs
                                text-slate-400
                            ">
                                Paste the URL of the product
                                you want to track.
                            </p>

                        </div>


                        {/* =================================
                            Supported Websites
                        ================================== */}

                        {/* =================================
    Supported Websites
================================== */}

<div className="
    bg-slate-50
    border
    border-slate-200
    rounded-xl
    p-4
">

    <p className="
        text-sm
        font-semibold
        text-slate-700
        mb-2
    ">
        Currently supported
    </p>


    <div className="
        flex
        flex-wrap
        gap-2
    ">

        {/* Amazon */}

        <span className="
            px-3
            py-1
            rounded-full
            bg-orange-100
            text-orange-700
            text-xs
            font-semibold
        ">
            Amazon
        </span>


        {/* Flipkart */}

        <span className="
            px-3
            py-1
            rounded-full
            bg-blue-100
            text-blue-700
            text-xs
            font-semibold
        ">
            Flipkart
        </span>


        {/* Myntra */}

        <span className="
            px-3
            py-1
            rounded-full
            bg-pink-100
            text-pink-700
            text-xs
            font-semibold
        ">
            Myntra
        </span>

    </div>

</div>


                        {/* =================================
                            Target Price
                        ================================== */}

                        <div>

                            <label className="
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                                mb-2
                            ">
                                Target Price
                            </label>


                            <div className="relative">

                                <span className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                    font-medium
                                ">
                                    ₹
                                </span>


                                <input
                                    type="number"
                                    name="targetPrice"
                                    value={
                                        formData.targetPrice
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter target price"
                                    required
                                    min="1"
                                    step="0.01"
                                    className="
                                        w-full
                                        pl-9
                                        pr-4
                                        py-3.5
                                        rounded-xl
                                        border
                                        border-slate-200
                                        outline-none
                                        focus:border-indigo-500
                                        focus:ring-4
                                        focus:ring-indigo-100
                                    "
                                />

                            </div>


                            <p className="
                                mt-2
                                text-xs
                                text-slate-400
                            ">
                                We'll notify you when the
                                product reaches this price.
                            </p>

                        </div>


                        {/* =================================
                            Information Box
                        ================================== */}

                        <div className="
                            bg-indigo-50
                            border
                            border-indigo-100
                            rounded-xl
                            p-4
                        ">

                            <p className="
                                text-sm
                                text-indigo-700
                            ">
                                💡 We'll fetch the product
                                title and current price
                                automatically from the
                                product URL.
                            </p>

                        </div>


                        {/* =================================
                            Buttons
                        ================================== */}

                        <div className="
                            flex
                            flex-col-reverse
                            sm:flex-row
                            gap-3
                            pt-2
                        ">


                            <Link
                                to="/dashboard"
                                className="
                                    flex-1
                                    text-center
                                    py-3.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    text-slate-600
                                    font-semibold
                                    hover:bg-slate-50
                                "
                            >
                                Cancel
                            </Link>


                            <button
                                type="submit"
                                disabled={loading}
                                className="
                                    flex-1
                                    py-3.5
                                    rounded-xl
                                    bg-indigo-600
                                    hover:bg-indigo-700
                                    disabled:bg-indigo-300
                                    text-white
                                    font-semibold
                                    shadow-lg
                                    shadow-indigo-100
                                "
                            >

                                {loading
                                    ? "Fetching Product..."
                                    : "Track Product"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            </main>

        </div>

    );

}


export default AddProduct;