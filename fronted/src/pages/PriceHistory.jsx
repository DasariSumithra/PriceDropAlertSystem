import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";

import { getPriceHistory } from "../services/productService";


function PriceHistory() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==========================================
    // LOAD PRICE HISTORY
    // ==========================================

    useEffect(() => {

        const loadPriceHistory = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await getPriceHistory(id);


                setData(response);

            }
            catch (error) {

                console.error(
                    "Price history error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Unable to load price history"
                );

            }
            finally {

                setLoading(false);

            }

        };


        loadPriceHistory();

    }, [id]);


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-gradient-to-br
                    from-indigo-50
                    via-white
                    to-purple-50
                    flex
                    items-center
                    justify-center
                "
            >

                <div className="text-center">

                    <div
                        className="
                            w-14
                            h-14
                            border-4
                            border-indigo-200
                            border-t-indigo-600
                            rounded-full
                            animate-spin
                            mx-auto
                        "
                    />

                    <p
                        className="
                            mt-5
                            text-gray-600
                            font-medium
                        "
                    >

                        Loading price history...

                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR SCREEN
    // ==========================================

    if (error) {

        return (

            <div
                className="
                    min-h-screen
                    bg-gradient-to-br
                    from-indigo-50
                    via-white
                    to-purple-50
                    flex
                    items-center
                    justify-center
                    px-6
                "
            >

                <div
                    className="
                        max-w-md
                        w-full
                        bg-white
                        rounded-3xl
                        shadow-xl
                        p-8
                        text-center
                        border
                        border-gray-100
                    "
                >

                    <div className="text-5xl">
                        ⚠️
                    </div>


                    <h2
                        className="
                            mt-5
                            text-2xl
                            font-bold
                            text-gray-900
                        "
                    >

                        Unable to load history

                    </h2>


                    <p
                        className="
                            mt-3
                            text-gray-500
                        "
                    >

                        {error}

                    </p>


                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="
                            mt-6
                            w-full
                            px-6
                            py-3
                            rounded-xl
                            bg-indigo-600
                            text-white
                            font-semibold
                            hover:bg-indigo-700
                            transition
                        "
                    >

                        ← Back to Dashboard

                    </button>

                </div>

            </div>

        );

    }


    // ==========================================
    // GET DATA
    // ==========================================

    const product = data?.product;

    const history = data?.history || [];


    // ==========================================
    // PRICE VALUES
    // ==========================================

    const prices = history
        .map(item => Number(item.price))
        .filter(price => !Number.isNaN(price));


    const currentPrice =
        Number(product?.currentPrice || 0);


    const targetPrice =
        Number(product?.targetPrice || 0);


    const lowestPrice =
        prices.length > 0
            ? Math.min(...prices)
            : currentPrice;


    const highestPrice =
        prices.length > 0
            ? Math.max(...prices)
            : currentPrice;


    const averagePrice =
        prices.length > 0
            ? prices.reduce(
                (sum, price) => sum + price,
                0
            ) / prices.length
            : currentPrice;


    // ==========================================
    // PRICE FORMATTER
    // ==========================================

    const formatPrice = (price) => {

        return `₹${Number(price).toFixed(2)}`;

    };


    // ==========================================
    // DATE FORMATTER
    // ==========================================

    const formatDate = (date) => {

        if (!date) {
            return "Unknown date";
        }


        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ==========================================
    // CHART DATA
    // ==========================================

    const chartData = history.map(
        (item, index) => {

            const date = new Date(
                item.checkedAt
            );


            return {

                check: index + 1,

               date: date.toLocaleTimeString(
    "en-IN",
    {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }
),

                fullDate: formatDate(
                    item.checkedAt
                ),

                price: Number(item.price)

            };

        }
    );


    // ==========================================
    // CUSTOM TOOLTIP
    // ==========================================

    const CustomTooltip = ({
        active,
        payload
    }) => {

        if (
            !active ||
            !payload ||
            !payload.length
        ) {

            return null;

        }


        const item = payload[0].payload;


        return (

            <div
                className="
                    bg-white
                    border
                    border-gray-200
                    rounded-xl
                    shadow-xl
                    px-4
                    py-3
                "
            >

                <p
                    className="
                        text-xs
                        text-gray-500
                        mb-1
                    "
                >

                    {item.fullDate}

                </p>


                <p
                    className="
                        text-lg
                        font-bold
                        text-indigo-600
                    "
                >

                    {formatPrice(item.price)}

                </p>

            </div>

        );

    };


    return (

        <div
            className="
                min-h-screen
                bg-gradient-to-br
                from-indigo-50
                via-white
                to-purple-50
                pb-12
            "
        >

            {/* ======================================
                TOP BAR
            ====================================== */}

            <div
                className="
                    bg-white
                    border-b
                    border-gray-100
                    shadow-sm
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-6
                        py-5
                        flex
                        items-center
                        justify-between
                    "
                >

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="
                            flex
                            items-center
                            gap-2
                            text-gray-600
                            font-semibold
                            hover:text-indigo-600
                            transition
                        "
                    >

                        ← Dashboard

                    </button>


                    <div
                        className="
                            bg-indigo-50
                            text-indigo-600
                            px-4
                            py-2
                            rounded-full
                            text-sm
                            font-semibold
                        "
                    >

                        📈 Price Monitor

                    </div>

                </div>

            </div>


            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-6
                    pt-8
                "
            >

                {/* ======================================
                    PRODUCT HEADER
                ====================================== */}

                <section
                    className="
                        bg-white
                        rounded-3xl
                        shadow-lg
                        border
                        border-gray-100
                        p-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-6
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-bold
                                    text-indigo-600
                                    uppercase
                                    tracking-wider
                                "
                            >

                                Monitoring Product

                            </p>


                            <h1
                                className="
                                    mt-2
                                    text-3xl
                                    md:text-4xl
                                    font-bold
                                    text-gray-900
                                "
                            >

                                {product?.title}

                            </h1>


                            <p
                                className="
                                    mt-2
                                    text-gray-500
                                "
                            >

                                Track price changes
                                automatically.

                            </p>

                        </div>


                        {/* Current Price */}

                        <div
                            className="
                                min-w-[180px]
                                bg-green-50
                                border
                                border-green-100
                                rounded-2xl
                                px-7
                                py-5
                            "
                        >

                            <p
                                className="
                                    text-sm
                                    text-green-600
                                    font-semibold
                                "
                            >

                                Current Price

                            </p>


                            <p
                                className="
                                    mt-1
                                    text-3xl
                                    font-bold
                                    text-green-700
                                "
                            >

                                {formatPrice(
                                    currentPrice
                                )}

                            </p>

                        </div>

                    </div>

                </section>


                {/* ======================================
                    STATISTICS
                ====================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-5
                        mt-6
                    "
                >

                    {/* Target */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-6
                            shadow-md
                            border
                            border-gray-100
                            hover:shadow-lg
                            transition
                        "
                    >

                        <p className="text-sm text-gray-500">
                            🎯 Target Price
                        </p>


                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                text-indigo-600
                            "
                        >

                            {formatPrice(
                                targetPrice
                            )}

                        </p>

                    </div>


                    {/* Lowest */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-6
                            shadow-md
                            border
                            border-gray-100
                            hover:shadow-lg
                            transition
                        "
                    >

                        <p className="text-sm text-gray-500">
                            📉 Lowest Price
                        </p>


                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                text-green-600
                            "
                        >

                            {formatPrice(
                                lowestPrice
                            )}

                        </p>

                    </div>


                    {/* Highest */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-6
                            shadow-md
                            border
                            border-gray-100
                            hover:shadow-lg
                            transition
                        "
                    >

                        <p className="text-sm text-gray-500">
                            📈 Highest Price
                        </p>


                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                text-red-500
                            "
                        >

                            {formatPrice(
                                highestPrice
                            )}

                        </p>

                    </div>


                    {/* Average */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            p-6
                            shadow-md
                            border
                            border-gray-100
                            hover:shadow-lg
                            transition
                        "
                    >

                        <p className="text-sm text-gray-500">
                            📊 Average Price
                        </p>


                        <p
                            className="
                                mt-2
                                text-2xl
                                font-bold
                                text-purple-600
                            "
                        >

                            {formatPrice(
                                averagePrice
                            )}

                        </p>

                    </div>

                </section>


                {/* ======================================
                    PRICE TREND
                ====================================== */}

                <section
                    className="
                        mt-8
                        bg-white
                        rounded-3xl
                        shadow-lg
                        border
                        border-gray-100
                        p-6
                        md:p-8
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            md:justify-between
                            gap-4
                            mb-8
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                "
                            >

                                Price Trend

                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-gray-500
                                "
                            >

                                Product price over time

                            </p>

                        </div>


                        <div
                            className="
                                bg-indigo-50
                                text-indigo-600
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                                font-semibold
                            "
                        >

                            {history.length} price checks

                        </div>

                    </div>


                    {chartData.length > 0 ? (

                        <div
                            className="
                                w-full
                                h-[400px]
                            "
                        >

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 10,
                                        bottom: 10
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />


                                    <XAxis
                                        dataKey="date"
                                        tick={{
                                            fontSize: 12
                                        }}
                                        interval="preserveStartEnd"
                                    />


                                    <YAxis
                                        tick={{
                                            fontSize: 12
                                        }}
                                        tickFormatter={
                                            (value) =>
                                                `₹${value}`
                                        }
                                    />


                                    <Tooltip
                                        content={
                                            <CustomTooltip />
                                        }
                                    />


                                    {/* Target price */}

                                    <ReferenceLine
                                        y={targetPrice}
                                        strokeDasharray="6 6"
                                        label={{
                                            value: "Target",
                                            position: "insideTopRight"
                                        }}
                                    />


                                    {/* Price line */}

                                    <Line
                                        type="monotone"
                                        dataKey="price"

                                        strokeWidth={3}

                                        dot={{
                                            r: 6,
                                            strokeWidth: 2
                                        }}

                                        activeDot={{
                                            r: 9,
                                            strokeWidth: 3
                                        }}

                                        isAnimationActive={true}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        </div>

                    ) : (

                        <div
                            className="
                                h-[350px]
                                flex
                                items-center
                                justify-center
                                text-center
                            "
                        >

                            <div>

                                <div className="text-6xl">
                                    📊
                                </div>


                                <h3
                                    className="
                                        mt-5
                                        text-xl
                                        font-bold
                                        text-gray-800
                                    "
                                >

                                    Waiting for price data

                                </h3>


                                <p
                                    className="
                                        mt-2
                                        text-gray-500
                                        max-w-md
                                    "
                                >

                                    The price chart will
                                    appear after the
                                    scheduler records
                                    product prices.

                                </p>

                            </div>

                        </div>

                    )}

                </section>


                {/* ======================================
                    PRICE HISTORY
                ====================================== */}

                <section
                    className="
                        mt-8
                        bg-white
                        rounded-3xl
                        shadow-lg
                        border
                        border-gray-100
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            p-6
                            md:p-8
                            border-b
                            border-gray-100
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                        text-gray-900
                                    "
                                >

                                    Price Checks

                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-gray-500
                                    "
                                >

                                    Complete price
                                    monitoring history

                                </p>

                            </div>


                            <div
                                className="
                                    hidden
                                    sm:block
                                    bg-gray-100
                                    text-gray-600
                                    px-4
                                    py-2
                                    rounded-xl
                                    text-sm
                                    font-semibold
                                "
                            >

                                {history.length} records

                            </div>

                        </div>

                    </div>


                    {history.length === 0 ? (

                        <div
                            className="
                                p-12
                                text-center
                            "
                        >

                            <div className="text-5xl">
                                📊
                            </div>


                            <p
                                className="
                                    mt-4
                                    text-gray-500
                                "
                            >

                                No price history
                                available yet.

                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                divide-y
                                divide-gray-100
                            "
                        >

                            {history
                                .slice()
                                .reverse()
                                .map(
                                    (item, index) => (

                                    <div
                                        key={
                                            item._id ||
                                            index
                                        }
                                        className="
                                            px-6
                                            md:px-8
                                            py-5
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            hover:bg-gray-50
                                            transition
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-4
                                            "
                                        >

                                            <div
                                                className="
                                                    w-10
                                                    h-10
                                                    rounded-full
                                                    bg-indigo-50
                                                    text-indigo-600
                                                    flex
                                                    items-center
                                                    justify-center
                                                    font-bold
                                                "
                                            >

                                                {history.length - index}

                                            </div>


                                            <div>

                                                <p
                                                    className="
                                                        font-semibold
                                                        text-gray-800
                                                    "
                                                >

                                                    Price Check

                                                </p>


                                                <p
                                                    className="
                                                        text-sm
                                                        text-gray-500
                                                        mt-1
                                                    "
                                                >

                                                    {formatDate(
                                                        item.checkedAt
                                                    )}

                                                </p>

                                            </div>

                                        </div>


                                        <p
                                            className="
                                                text-lg
                                                md:text-xl
                                                font-bold
                                                text-gray-900
                                            "
                                        >

                                            {formatPrice(
                                                item.price
                                            )}

                                        </p>

                                    </div>

                                ))}

                        </div>

                    )}

                </section>


                {/* ======================================
                    BOTTOM ACTIONS
                ====================================== */}

                <div
                    className="
                        mt-8
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        gap-4
                    "
                >

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="
                            px-6
                            py-4
                            rounded-xl
                            bg-gray-900
                            text-white
                            font-semibold
                            hover:bg-gray-800
                            transition
                        "
                    >

                        ← Back to Dashboard

                    </button>


                    {product?.productUrl && (

                        <a
                            href={product.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                px-6
                                py-4
                                rounded-xl
                                border
                                border-indigo-200
                                text-indigo-600
                                text-center
                                font-semibold
                                hover:bg-indigo-50
                                transition
                            "
                        >

                            🛍️ View Original Product

                        </a>

                    )}

                </div>

            </main>

        </div>

    );

}


export default PriceHistory;