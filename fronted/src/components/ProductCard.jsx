import { useNavigate } from "react-router-dom";


function ProductCard({
    product,
    onDelete,
    onCheckPrice,
    checkingPrice,
    previousPrice
}) {

    const navigate = useNavigate();


    // ======================================================
    // VIEW PRICE HISTORY
    // ======================================================

    const handleViewHistory = () => {

        navigate(
            `/products/${product._id}/history`
        );

    };


    // ======================================================
    // CHECK PRICE
    // ======================================================

    const handleCheckPrice = () => {

        if (onCheckPrice) {

            onCheckPrice(product._id);

        }

    };


    // ======================================================
    // CURRENT PRICE
    // ======================================================

    const currentPrice =
        Number(product.currentPrice);


    // ======================================================
    // PREVIOUS PRICE
    // ======================================================

    const oldPrice =
        previousPrice !== undefined
            ? Number(previousPrice)
            : null;


    // ======================================================
    // PRICE DIFFERENCE
    // ======================================================

    const priceDifference =
        oldPrice !== null
            ? currentPrice - oldPrice
            : 0;


    // ======================================================
    // PRICE STATUS
    // ======================================================

    const priceDropped =
        oldPrice !== null &&
        priceDifference < 0;


    const priceIncreased =
        oldPrice !== null &&
        priceDifference > 0;


    const priceUnchanged =
        oldPrice !== null &&
        priceDifference === 0;


    // ======================================================
    // TARGET PRICE
    // ======================================================

    const targetPrice =
        Number(product.targetPrice);


    const targetReached =
        currentPrice <= targetPrice;


    // ======================================================
    // EMAIL ALERT STATUS
    // ======================================================

    const alertSent =
        Boolean(product.lastAlertSent);


    return (

        <div
            className="
                bg-white
                rounded-2xl
                shadow-md
                p-6
                border
                border-gray-100
                hover:shadow-xl
                transition
                duration-300
            "
        >

            {/* ======================================================
                PRODUCT TITLE
            ====================================================== */}

            <h2
                className="
                    text-xl
                    font-bold
                    text-gray-800
                    line-clamp-2
                    min-h-[56px]
                "
            >
                {product.title.length > 35
                    ? product.title.substring(0, 35) + "..."
                    : product.title}
            </h2>


            {/* ======================================================
                CURRENT PRICE
            ====================================================== */}

            <p
                className="
                    mt-4
                    text-gray-600
                "
            >
                Current Price:

                <span
                    className="
                        ml-1
                        font-bold
                        text-green-600
                    "
                >
                    ₹{currentPrice.toFixed(2)}
                </span>

            </p>


            {/* ======================================================
                PRICE CHANGE
                Hidden while checking
            ====================================================== */}

            {!checkingPrice && priceDropped && (

                <div
                    className="
                        mt-2
                        rounded-lg
                        bg-green-50
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-green-700
                    "
                >
                    ↓ Price dropped by ₹
                    {Math.abs(priceDifference).toFixed(2)}
                </div>

            )}


            {!checkingPrice && priceIncreased && (

                <div
                    className="
                        mt-2
                        rounded-lg
                        bg-red-50
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-red-700
                    "
                >
                    ↑ Price increased by ₹
                    {priceDifference.toFixed(2)}
                </div>

            )}


            {!checkingPrice && priceUnchanged && (

                <div
                    className="
                        mt-2
                        rounded-lg
                        bg-gray-50
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-gray-600
                    "
                >
                    → Price unchanged
                </div>

            )}


            {/* ======================================================
                LAST CHECKED
            ====================================================== */}

            {product.lastChecked && (

                <p
                    className="
                        mt-2
                        text-xs
                        text-gray-400
                    "
                >
                    Last checked:{" "}
                    {new Date(
                        product.lastChecked
                    ).toLocaleString()}
                </p>

            )}


            {/* ======================================================
                TARGET PRICE
            ====================================================== */}

            <p
                className="
                    mt-3
                    text-gray-600
                "
            >
                Target Price:

                <span
                    className="
                        ml-1
                        font-bold
                        text-indigo-600
                    "
                >
                    ₹{targetPrice.toFixed(2)}
                </span>

            </p>


            {/* ======================================================
                TARGET STATUS
            ====================================================== */}

            <div
                className={`
                    mt-4
                    rounded-xl
                    p-4
                    ${
                        targetReached
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-700"
                    }
                `}
            >

                {targetReached

                    ? "🎉 Great! Target reached"

                    : `Amount to target ₹${(
                        currentPrice -
                        targetPrice
                    ).toFixed(2)}`

                }

            </div>


            {/* ======================================================
                EMAIL ALERT STATUS
            ====================================================== */}

            <div
                className={`
                    mt-4
                    rounded-xl
                    border
                    px-4
                    py-3
                    ${
                        alertSent
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-indigo-50 border-indigo-200 text-indigo-700"
                    }
                `}
            >

                {alertSent ? (

                    <>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                font-semibold
                            "
                        >

                            <span>
                                📧
                            </span>

                            <span>
                                Price alert sent
                            </span>

                        </div>


                        <p
                            className="
                                mt-1
                                text-xs
                                opacity-80
                            "
                        >
                            You have been notified that the
                            target price was reached.
                        </p>


                        {product.lastAlertSent && (

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    opacity-70
                                "
                            >
                                Sent:{" "}
                                {new Date(
                                    product.lastAlertSent
                                ).toLocaleString()}
                            </p>

                        )}

                    </>

                ) : (

                    <>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                font-semibold
                            "
                        >

                            <span>
                                🔔
                            </span>

                            <span>
                                Price alert active
                            </span>

                        </div>


                        <p
                            className="
                                mt-1
                                text-xs
                                opacity-80
                            "
                        >
                            We'll email you when the target
                            price is reached.
                        </p>

                    </>

                )}

            </div>


            {/* ======================================================
                CHECK PRICE NOW
            ====================================================== */}

            <button
                onClick={handleCheckPrice}
                disabled={checkingPrice}
                className="
                    w-full
                    mt-5
                    px-4
                    py-3
                    rounded-xl
                    bg-green-600
                    text-white
                    font-semibold
                    shadow-md
                    hover:bg-green-700
                    hover:shadow-lg
                    transition
                    duration-200
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    justify-center
                    gap-2
                "
            >

                {checkingPrice ? (

                    <>

                        <span
                            className="
                                w-5
                                h-5
                                border-2
                                border-white
                                border-t-transparent
                                rounded-full
                                animate-spin
                            "
                        />

                        Checking Price...

                    </>

                ) : (

                    <>
                        🔄 Check Price Now
                    </>

                )}

            </button>


            {/* ======================================================
                EDIT + DELETE
            ====================================================== */}

            <div
                className="
                    grid
                    grid-cols-2
                    gap-3
                    mt-4
                "
            >

                {/* Edit */}

                <button
                    onClick={() =>
                        navigate(
                            `/edit-product/${product._id}`
                        )
                    }
                    className="
                        px-4
                        py-3
                        rounded-xl
                        border
                        border-indigo-200
                        text-indigo-600
                        font-semibold
                        hover:bg-indigo-50
                        transition
                    "
                >
                    Edit
                </button>


                {/* Delete */}

                <button
                    type="button"
                    onClick={() =>
                        onDelete(product._id)
                    }
                    className="
                        px-4
                        py-3
                        rounded-xl
                        bg-red-50
                        text-red-600
                        font-semibold
                        hover:bg-red-100
                        hover:shadow-sm
                        transition
                        duration-200
                    "
                >
                    🗑️ Delete
                </button>

            </div>


            {/* ======================================================
                PRICE HISTORY
            ====================================================== */}

            <button
                onClick={handleViewHistory}
                className="
                    w-full
                    mt-4
                    px-4
                    py-3
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-purple-600
                    text-white
                    font-semibold
                    shadow-md
                    hover:shadow-lg
                    hover:scale-[1.01]
                    transition
                    duration-200
                "
            >
                📈 View Price History
            </button>


            {/* ======================================================
                ORIGINAL PRODUCT
            ====================================================== */}

            <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                    block
                    text-center
                    mt-4
                    text-sm
                    text-gray-500
                    hover:text-indigo-600
                    transition
                "
            >
                View original product →
            </a>

        </div>

    );

}


export default ProductCard;