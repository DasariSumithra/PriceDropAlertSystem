import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import Navbar from "../components/Navbar";

import {
    getProductById,
    updateProduct
} from "../services/productService";

function EditProduct() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [product, setProduct] = useState(null);

    const [targetPrice, setTargetPrice] = useState("");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    useEffect(() => {

        const loadProduct = async () => {

            try {

                const response =
                    await getProductById(id);

                const data =
                    response.product || response;

                setProduct(data);

                setTargetPrice(data.targetPrice);

            }
            catch (error) {

                setError(
                    error.response?.data?.message ||
                    "Unable to load product."
                );

            }
            finally {

                setLoading(false);

            }

        };


        loadProduct();

    }, [id]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setSaving(true);


        try {

            await updateProduct(
                id,
                {
                    targetPrice: Number(targetPrice)
                }
            );


            navigate("/dashboard");

        }
        catch (error) {

            setError(
                error.response?.data?.message ||
                "Unable to update product."
            );

        }
        finally {

            setSaving(false);

        }

    };


    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50">

                <Navbar />

                <div className="
                    max-w-3xl
                    mx-auto
                    p-8
                ">

                    <div className="
                        h-96
                        bg-white
                        rounded-3xl
                        animate-pulse
                    " />

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-slate-50">

            <Navbar />


            <main className="
                max-w-3xl
                mx-auto
                px-4
                sm:px-6
                py-10
            ">


                <Link
                    to="/dashboard"
                    className="
                        text-sm
                        font-medium
                        text-indigo-600
                    "
                >
                    ← Back to dashboard
                </Link>


                <div className="mt-5 mb-8">

                    <h1 className="
                        text-3xl
                        font-bold
                        text-slate-900
                    ">
                        Edit Product
                    </h1>

                    <p className="
                        text-slate-500
                        mt-2
                    ">
                        Update the price you want to pay.
                    </p>

                </div>


                {error && (

                    <div className="
                        mb-6
                        p-4
                        rounded-xl
                        bg-red-50
                        border
                        border-red-200
                        text-red-700
                    ">
                        {error}
                    </div>

                )}


                {product && (

                    <div className="
                        bg-white
                        border
                        border-slate-200
                        rounded-3xl
                        shadow-sm
                        p-6
                        sm:p-8
                    ">


                        {/* Product information */}

                        <div className="
                            flex
                            items-center
                            gap-4
                            pb-6
                            border-b
                            border-slate-100
                        ">

                            <div className="
                                w-14
                                h-14
                                rounded-xl
                                bg-indigo-50
                                flex
                                items-center
                                justify-center
                                text-2xl
                            ">
                                🛍️
                            </div>


                            <div>

                                <h2 className="
                                    font-bold
                                    text-slate-900
                                ">
                                    {product.title}
                                </h2>

                                <p className="
                                    text-sm
                                    text-slate-500
                                    mt-1
                                ">
                                    Current price: ₹
                                    {product.currentPrice}
                                </p>

                            </div>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                            className="mt-7"
                        >


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
                                ">
                                    ₹
                                </span>


                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) =>
                                        setTargetPrice(e.target.value)
                                    }
                                    min="1"
                                    required
                                    className="
                                        w-full
                                        pl-9
                                        pr-4
                                        py-4
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


                            <div className="
                                flex
                                flex-col-reverse
                                sm:flex-row
                                gap-3
                                mt-7
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
                                    "
                                >
                                    Cancel
                                </Link>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex-1
                                        py-3.5
                                        rounded-xl
                                        bg-indigo-600
                                        hover:bg-indigo-700
                                        disabled:bg-indigo-300
                                        text-white
                                        font-semibold
                                    "
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                )}

            </main>

        </div>

    );
}

export default EditProduct;