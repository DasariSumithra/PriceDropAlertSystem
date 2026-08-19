const axios = require("axios");
const cheerio = require("cheerio");

// ======================================================
// Detect which e-commerce website the URL belongs to
// ======================================================

const detectWebsite = (productUrl) => {
    try {
        const url = new URL(productUrl);

        const hostname = url.hostname.toLowerCase();

        // Amazon
        if (
            hostname.includes("amazon.in") ||
            hostname.includes("amazon.com")
        ) {
            return "amazon";
        }

        // Flipkart
        if (
            hostname.includes("flipkart.com")
        ) {
            return "flipkart";
        }

        // Myntra
        if (
            hostname.includes("myntra.com") ||
            hostname.includes("myntra.in")
        ) {
            return "myntra";
        }

        return "unknown";
    }
    catch (error) {
        return "invalid";
    }
};


// ======================================================
// Create custom service error
// ======================================================

const createServiceError = (
    code,
    message
) => {
    const error = new Error(message);

    error.code = code;

    return error;
};


// ======================================================
// Normalize Amazon URL
// ======================================================

const normalizeAmazonUrl = (productUrl) => {
    try {
        const url = new URL(productUrl);

        const asinMatch =
            url.pathname.match(
                /\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i
            );

        if (!asinMatch) {
            return productUrl;
        }

        const asin = asinMatch[1];

        const hostname =
            url.hostname.toLowerCase();

        let domain = "www.amazon.com";

        if (
            hostname.includes("amazon.in")
        ) {
            domain = "www.amazon.in";
        }

        return `https://${domain}/dp/${asin}`;
    }
    catch (error) {
        return productUrl;
    }
};


// ======================================================
// Detect Amazon currency
// ======================================================

const detectAmazonCurrency = (
    priceText,
    productUrl
) => {

    const text = String(priceText || "")
        .replace(/\u00a0/g, " ")
        .trim();

    console.log("Currency detection text:", text);

    // ==================================================
    // 1. EXPLICIT INR
    // ==================================================

    if (
        text.includes("₹") ||
        /\bINR\b/i.test(text) ||
        /\bRs\.?\b/i.test(text)
    ) {

        console.log("Currency detected from price text: INR");

        return "INR";
    }


    // ==================================================
    // 2. EXPLICIT USD
    // ==================================================

    if (
        text.includes("$") ||
        /\bUSD\b/i.test(text)
    ) {

        console.log("Currency detected from price text: USD");

        return "USD";
    }


    // ==================================================
    // 3. EXPLICIT GBP
    // ==================================================

    if (
        text.includes("£") ||
        /\bGBP\b/i.test(text)
    ) {

        console.log("Currency detected from price text: GBP");

        return "GBP";
    }


    // ==================================================
    // 4. EXPLICIT EUR
    // ==================================================

    if (
        text.includes("€") ||
        /\bEUR\b/i.test(text)
    ) {

        console.log("Currency detected from price text: EUR");

        return "EUR";
    }


    // ==================================================
    // 5. DO NOT GUESS FROM amazon.com
    // ==================================================

    console.log(
        "Currency could not be detected from price text."
    );

    return null;
};

// ======================================================
// Convert Amazon price to INR
// ======================================================

const convertAmazonPriceToINR = (
    price,
    currency
) => {

    if (
        currency === "INR"
    ) {
        return price;
    }

    if (
        currency === "USD"
    ) {

        const usdToInr =
            Number(
                process.env.USD_TO_INR || 87
            );

        if (
            Number.isNaN(usdToInr) ||
            usdToInr <= 0
        ) {

            console.log(
                "Invalid USD_TO_INR value. Using 87."
            );

            return price * 87;
        }

        const convertedPrice =
            price * usdToInr;

        console.log(
            `USD ${price} × ${usdToInr} = INR ₹${convertedPrice.toFixed(2)}`
        );

        return convertedPrice;
    }

    return price;
};


// ======================================================
// Extract numeric price
// Used by Flipkart
// ======================================================

const cleanPrice = (priceText) => {

    if (
        priceText === null ||
        priceText === undefined
    ) {
        return NaN;
    }

    const cleaned =
        String(priceText)
            .replace(/[₹$€£,\s]/g, "")
            .replace(/[^\d.]/g, "");

    return parseFloat(cleaned);
};


// ======================================================
// AMAZON PRODUCT FETCHER
// ======================================================

const fetchAmazonProduct = async (
    productUrl
) => {

    console.log("\n========================================");
    console.log("FETCHING AMAZON PRODUCT");
    console.log("========================================");

    console.log("Original Amazon URL:");
    console.log(productUrl);

    try {

        // ==================================================
        // 1. EXTRACT AMAZON DOMAIN + ASIN
        // ==================================================

        const urlObject =
            new URL(productUrl);

        const hostname =
            urlObject.hostname.toLowerCase();

        if (
            !hostname.includes("amazon.")
        ) {
            throw new Error(
                "Invalid Amazon URL"
            );
        }

        let asin = null;

        const dpMatch =
            urlObject.pathname.match(
                /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})/i
            );

        if (dpMatch) {
            asin = dpMatch[1];
        }

        // Fallback ASIN detection
        if (!asin) {

            const pathParts =
                urlObject.pathname
                    .split("/")
                    .filter(Boolean);

            for (
                let i = 0;
                i < pathParts.length;
                i++
            ) {

                const part =
                    pathParts[i];

                if (
                    /^[A-Z0-9]{10}$/i.test(part)
                ) {

                    asin = part;

                    break;
                }
            }
        }

        if (!asin) {
            throw new Error(
                "Could not extract Amazon ASIN/product ID"
            );
        }

        // IMPORTANT:
        // Preserve amazon.com vs amazon.in
        const amazonBase =
            `${urlObject.protocol}//${urlObject.hostname}`;

        const normalizedUrl =
            `${amazonBase}/dp/${asin}`;

        console.log("\nNormalized Amazon URL:");
        console.log(normalizedUrl);

        console.log("Amazon ASIN:");
        console.log(asin);


        // ==================================================
        // 2. FETCH AMAZON PAGE
        // ==================================================

        const response =
            await axios.get(
                normalizedUrl,
                {
                    timeout: 30000,

                    maxRedirects: 5,

                    headers: {

                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
                            "AppleWebKit/537.36 (KHTML, like Gecko) " +
                            "Chrome/151.0.0.0 Safari/537.36",

                        Accept:
                            "text/html,application/xhtml+xml,application/xml;q=0.9," +
                            "image/avif,image/webp,image/apng,*/*;q=0.8",

                        "Accept-Language":
                            "en-IN,en;q=0.9,en-US;q=0.8",

                        "Cache-Control":
                            "no-cache",

                        Pragma:
                            "no-cache",

                        "Upgrade-Insecure-Requests":
                            "1"
                    }
                }
            );

        const html =
            response.data;

        console.log(
            "\nAmazon response status:",
            response.status
        );

        console.log(
            "Amazon response length:",
            html.length
        );

        if (
            !html ||
            html.length < 1000
        ) {

            throw new Error(
                "Amazon returned an empty or invalid page"
            );
        }

        const $ =
            cheerio.load(html);


        // ==================================================
        // 3. PRODUCT TITLE
        // ==================================================

        const pageTitle =
            $("#productTitle")
                .first()
                .text()
                .trim() ||
            $("title")
                .first()
                .text()
                .trim();

        console.log(
            "Amazon page title:",
            pageTitle
        );

        const productTitle =
            $("#productTitle")
                .first()
                .text()
                .trim() ||

            $('[data-feature-name="title"] #productTitle')
                .first()
                .text()
                .trim() ||

            $("h1")
                .first()
                .text()
                .trim() ||

            pageTitle;

        console.log(
            "Amazon product title:",
            productTitle
        );


        // ==================================================
        // 4. BOT / CAPTCHA CHECK
        // ==================================================

        const lowerHtml =
            html.toLowerCase();

        const captchaDetected =
            lowerHtml.includes(
                "enter the characters you see below"
            ) ||
            lowerHtml.includes("captcha") ||
            lowerHtml.includes("validatecaptcha");

        const robotCheckDetected =
            lowerHtml.includes("robot check") ||
            lowerHtml.includes(
                "sorry, we just need to make sure you're not a robot"
            );

        const automatedAccessDetected =
            lowerHtml.includes("automated access") ||
            lowerHtml.includes(
                "sorry, but we just need to make sure you're not a robot"
            ) ||
            lowerHtml.includes(
                "to discuss automated access to amazon data"
            );

        console.log(
            "Amazon captcha detected:",
            captchaDetected
        );

        console.log(
            "Amazon robot check detected:",
            robotCheckDetected
        );

        console.log(
            "Amazon automated-access message detected:",
            automatedAccessDetected
        );

        if (
            captchaDetected ||
            robotCheckDetected ||
            automatedAccessDetected
        ) {

            throw new Error(
                "Amazon blocked automated access"
            );
        }


        // ==================================================
        // 5. AMAZON PRICE CANDIDATES
        // ==================================================

        const priceCandidates = [];


        // --------------------------------------------------
        // Add candidate helper
        // --------------------------------------------------

        const addCandidate = (
            selector,
            source,
            priority,
            weight
        ) => {

            $(selector).each(
                (index, element) => {

                    const text =
                        $(element)
                            .text()
                            .replace(/\s+/g, " ")
                            .trim();

                    if (!text) {
                        return;
                    }

                    priceCandidates.push({

                        text,

                        source,

                        priority,

                        weight,

                        index
                    });
                }
            );
        };


        // ==================================================
        // IMPORTANT AMAZON LOGIC
        //
        // BUY BOX gets HIGHER priority than
        // corePriceDisplay.
        //
        // This fixes the Bible issue.
        // ==================================================


        // --------------------------------------------------
        // PRIORITY 1
        // ACTIVE BUY BOX
        // --------------------------------------------------

        addCandidate(
            "#buybox .a-price .a-offscreen",
            "buybox",
            1,
            10
        );

        addCandidate(
            "#buyBoxV2 .a-price .a-offscreen",
            "buyBoxV2",
            1,
            10
        );

        addCandidate(
            "#desktop_buybox .a-price .a-offscreen",
            "desktop_buybox",
            1,
            10
        );

        addCandidate(
            "#desktop_qualifiedBuybox .a-price .a-offscreen",
            "desktop_qualifiedBuybox",
            1,
            10
        );

        addCandidate(
            "#apex_desktop .a-price .a-offscreen",
            "apex_desktop",
            1,
            8
        );


        // --------------------------------------------------
        // PRIORITY 2
        // CORE PRICE
        //
        // IMPORTANT:
        // It is NOT the first choice anymore.
        // --------------------------------------------------

        addCandidate(
            "#corePriceDisplay_desktop_feature_div .a-price .a-offscreen",
            "corePriceDisplay_desktop_feature_div",
            2,
            5
        );

        addCandidate(
            "#corePrice_feature_div .a-price .a-offscreen",
            "corePrice_feature_div",
            2,
            5
        );


        // --------------------------------------------------
        // PRIORITY 3
        // OTHER CURRENT PRICE CONTAINERS
        // --------------------------------------------------

        addCandidate(
            "#corePriceDisplay_desktop_feature_div .a-price",
            "corePriceDisplay_desktop_feature_div-price",
            3,
            4
        );

        addCandidate(
            "#corePrice_feature_div .a-price",
            "corePrice_feature_div-price",
            3,
            4
        );

        addCandidate(
            "#apex_desktop .a-price",
            "apex_desktop-price",
            3,
            4
        );

        addCandidate(
            "#buybox .a-price",
            "buybox-price",
            3,
            6
        );

        addCandidate(
            "#buyBoxV2 .a-price",
            "buyBoxV2-price",
            3,
            6
        );


        // --------------------------------------------------
        // PRIORITY 4
        // GENERIC AMAZON PRICE
        // --------------------------------------------------

        addCandidate(
            ".a-price.aok-align-center .a-offscreen",
            "aok-align-center",
            4,
            2
        );

        addCandidate(
            ".a-price .a-offscreen",
            "generic-a-price",
            5,
            1
        );


        // ==================================================
        // 6. CLEAN AMAZON PRICE TEXT
        // ==================================================

        const cleanAmazonPriceText = (
            text
        ) => {

            if (!text) {
                return "";
            }

            let value =
                String(text)
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();


            // Currency + price
            const currencyMatch =
                value.match(
                    /(?:₹|Rs\.?|INR|\$|USD|£|GBP|€|EUR)\s*[\d,]+(?:\.\d{1,2})?/i
                );

            if (currencyMatch) {

                return currencyMatch[0]
                    .trim();
            }


            // Price + currency
            const afterCurrencyMatch =
                value.match(
                    /[\d,]+(?:\.\d{1,2})?\s*(?:INR|USD|GBP|EUR|₹|\$|£|€)/i
                );

            if (
                afterCurrencyMatch
            ) {

                return afterCurrencyMatch[0]
                    .trim();
            }


            // Plain number
            const numberMatch =
                value.match(
                    /\d[\d,]*(?:\.\d{1,2})?/
                );

            if (
                numberMatch
            ) {

                return numberMatch[0];
            }

            return "";
        };


        // ==================================================
        // 7. PARSE AMAZON PRICE
        // ==================================================

        const parseAmazonPrice = (
            text
        ) => {

            if (!text) {
                return null;
            }

            const original =
                String(text)
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();


            // ----------------------------------------------
            // Currency
            // ----------------------------------------------

            let currency = null;

            if (
    /₹/.test(original) ||
    /INR/i.test(original) ||
    /Rs\.?/i.test(original)
) {
    currency = "INR";
}
else if (
    /\$/.test(original) ||
    /USD/i.test(original)
) {
    currency = "USD";
}
else if (
    /£/.test(original) ||
    /GBP/i.test(original)
) {
    currency = "GBP";
}
else if (
    /€/.test(original) ||
    /EUR/i.test(original)
) {
    currency = "EUR";
}

            // ----------------------------------------------
            // Remove currency
            // ----------------------------------------------

            let numericPart =
                original
                    .replace(/INR/gi, "")
                    .replace(/USD/gi, "")
                    .replace(/GBP/gi, "")
                    .replace(/EUR/gi, "")
                    .replace(/Rs\./gi, "")
                    .replace(/₹/g, "")
                    .replace(/\$/g, "")
                    .replace(/£/g, "")
                    .replace(/€/g, "")
                    .trim();


            // ----------------------------------------------
            // Extract first valid amount
            // ----------------------------------------------

            const numberMatch =
                numericPart.match(
                    /\d[\d,]*(?:\.\d{1,2})?/
                );

            if (!numberMatch) {
                return null;
            }

            const number =
                Number(
                    numberMatch[0]
                        .replace(/,/g, "")
                );

            if (
                !Number.isFinite(number) ||
                number <= 0
            ) {

                return null;
            }

            return {

                value: number,

                currency,

                rawText: original
            };
        };


        // ==================================================
        // 8. PRINT ALL CANDIDATES
        // ==================================================

        console.log(
            "\nAmazon price candidates:"
        );

        priceCandidates.forEach(
            (candidate, index) => {

                console.log(
                    `${index + 1}. ` +
                    `[priority ${candidate.priority}] ` +
                    `${candidate.source} => ` +
                    `${candidate.text}`
                );
            }
        );


        // ==================================================
        // 9. PARSE ALL CANDIDATES
        // ==================================================

        const parsedCandidates =
            priceCandidates
                .map(
                    (candidate) => {

                        const cleaned =
                            cleanAmazonPriceText(
                                candidate.text
                            );

                        const parsed =
                            parseAmazonPrice(
                                cleaned
                            );

                        return {

                            ...candidate,

                            cleaned,

                            parsed
                        };
                    }
                )
                .filter(
                    (candidate) =>
                        candidate.parsed &&
                        Number.isFinite(
                            candidate.parsed.value
                        ) &&
                        candidate.parsed.value > 0
                );


        // ==================================================
        // 10. GROUP SAME PRICES
        //
        // THIS IS THE IMPORTANT FIX.
        //
        // Example from your Bible page:
        //
        // 4779.64 -> 3 occurrences
        // 1947.62 -> 4 occurrences
        //
        // 1947.62 wins because it is repeatedly present
        // in the actual Buy Box.
        // ==================================================

        const priceGroups = new Map();


        parsedCandidates.forEach(
            (candidate) => {

                const value =
                    candidate.parsed.value;

                const key =
                    value.toFixed(2);

                if (
                    !priceGroups.has(key)
                ) {

                    priceGroups.set(
                        key,
                        {

                            value,

                            currency:
                                candidate.parsed.currency,

                            occurrences: 0,

                            buyBoxOccurrences: 0,

                            coreOccurrences: 0,

                            totalWeight: 0,

                            bestPriority: 999,

                            sources: [],

                            candidates: []
                        }
                    );
                }

                const group =
                    priceGroups.get(key);

                group.occurrences++;

                group.totalWeight +=
                    candidate.weight || 1;

                group.bestPriority =
                    Math.min(
                        group.bestPriority,
                        candidate.priority
                    );

                group.candidates.push(
                    candidate
                );

                if (
                    candidate.source
                        .toLowerCase()
                        .includes("buybox")
                ) {

                    group.buyBoxOccurrences++;

                }

                if (
                    candidate.source
                        .toLowerCase()
                        .includes("coreprice")
                ) {

                    group.coreOccurrences++;
                }

                if (
                    !group.sources.includes(
                        candidate.source
                    )
                ) {

                    group.sources.push(
                        candidate.source
                    );
                }
            }
        );


        // ==================================================
        // 11. PRINT GROUPED PRICES
        // ==================================================

        console.log(
            "\nAmazon grouped prices:"
        );

        Array.from(
            priceGroups.values()
        )
        .forEach(
            (group) => {

                console.log(
                    `Price ₹/currency value ${group.value.toFixed(2)}`
                );

                console.log(
                    `  Total occurrences: ${group.occurrences}`
                );

                console.log(
                    `  Buy Box occurrences: ${group.buyBoxOccurrences}`
                );

                console.log(
                    `  Core price occurrences: ${group.coreOccurrences}`
                );

                console.log(
                    `  Total weight: ${group.totalWeight}`
                );

                console.log(
                    `  Sources: ${group.sources.join(", ")}`
                );
            }
        );


        // ==================================================
        // 12. SELECT BEST PRICE
        // ==================================================

        let selectedGroup = null;


        if (
            priceGroups.size > 0
        ) {

            const groups =
                Array.from(
                    priceGroups.values()
                );


            /*
             * SCORE:
             *
             * Buy Box occurrence is extremely important.
             *
             * This means:
             *
             * ₹1947.62
             * buybox x 2
             * desktop_buybox x 2
             *
             * beats:
             *
             * ₹4779.64
             * buybox x 1
             * desktop_buybox x 1
             * core x 1
             */

            groups.forEach(
                (group) => {

                    group.score =

                        // Strong preference for Buy Box
                        (group.buyBoxOccurrences * 100)

                        +

                        // Repeated appearance
                        (group.occurrences * 20)

                        +

                        // Overall selector weight
                        group.totalWeight

                        -

                        // Small penalty for core-only prices
                        (group.coreOccurrences * 5);
                }
            );


            groups.sort(
                (a, b) => {

                    // Highest score first
                    if (
                        b.score !== a.score
                    ) {

                        return (
                            b.score -
                            a.score
                        );
                    }


                    // Better priority
                    if (
                        a.bestPriority !==
                        b.bestPriority
                    ) {

                        return (
                            a.bestPriority -
                            b.bestPriority
                        );
                    }


                    // If everything else is equal,
                    // lower price is a final tie-breaker.
                    return (
                        a.value -
                        b.value
                    );
                }
            );


            selectedGroup =
                groups[0];
        }


        // ==================================================
        // 13. SELECT ACTUAL CANDIDATE FROM GROUP
        // ==================================================

        let selectedPrice = null;


        if (
            selectedGroup
        ) {

            /*
             * Pick the strongest candidate inside
             * the winning price group.
             */

            const sortedCandidates =
                selectedGroup.candidates
                    .slice()
                    .sort(
                        (a, b) => {

                            // Buy Box first
                            const aBuyBox =
                                a.source
                                    .toLowerCase()
                                    .includes("buybox");

                            const bBuyBox =
                                b.source
                                    .toLowerCase()
                                    .includes("buybox");

                            if (
                                aBuyBox !==
                                bBuyBox
                            ) {

                                return bBuyBox - aBuyBox;
                            }


                            // Better priority
                            if (
                                a.priority !==
                                b.priority
                            ) {

                                return (
                                    a.priority -
                                    b.priority
                                );
                            }


                            // Higher weight
                            return (
                                (b.weight || 0) -
                                (a.weight || 0)
                            );
                        }
                    );


            selectedPrice =
                sortedCandidates[0];


            console.log(
                "\n========================================"
            );

            console.log(
                "AMAZON PRICE SELECTION"
            );

            console.log(
                "========================================"
            );

            console.log(
                "Selected price:",
                selectedPrice.cleaned
            );

            console.log(
                "Selected numeric value:",
                selectedPrice.parsed.value
            );

            console.log(
                "Selected currency:",
                selectedPrice.parsed.currency
            );

            console.log(
                "Selected selector:",
                selectedPrice.source
            );

            console.log(
                "Price occurrences:",
                selectedGroup.occurrences
            );

            console.log(
                "Buy Box occurrences:",
                selectedGroup.buyBoxOccurrences
            );

            console.log(
                "Selection score:",
                selectedGroup.score
            );

            console.log(
                "========================================"
            );
        }


        // ==================================================
        // 14. NO PRICE FOUND
        // ==================================================

        if (
            !selectedPrice ||
            !selectedPrice.parsed
        ) {

            throw new Error(
                `Unable to fetch Amazon price: ${productTitle}`
            );
        }


        // ==================================================
        // 15. FINAL PRICE
        // ==================================================

        const originalPrice =
            selectedPrice.parsed.value;


        let detectedCurrency =
            selectedPrice.parsed.currency;


        /*
         * IMPORTANT:
         *
         * If Amazon.com HTML explicitly says INR,
         * we MUST use INR.
         *
         * We NEVER do:
         *
         * amazon.com => USD
         *
         * when the actual price says INR.
         */

        if (
            !detectedCurrency
        ) {

            detectedCurrency =
                detectAmazonCurrency(
                    selectedPrice.cleaned,
                    normalizedUrl
                );
        }


        console.log(
            "\nAmazon selected price text:",
            selectedPrice.cleaned
        );

        console.log(
            "Amazon detected currency:",
            detectedCurrency
        );


        // ==================================================
        // 16. CONVERT TO INR
        // ==================================================

        let finalINRPrice;


        if (
            detectedCurrency === "INR"
        ) {

            // EXACTLY what your Bible needs:
            //
            // INR 1,947.62
            //
            // stays:
            //
            // 1947.62

            finalINRPrice =
                originalPrice;

            console.log(
                `Amazon INR price used directly: ₹${finalINRPrice.toFixed(2)}`
            );
        }

        else if (
            detectedCurrency === "USD"
        ) {

            const exchangeRate =
                Number(
                    process.env.USD_TO_INR
                );

            if (
                !Number.isFinite(exchangeRate) ||
                exchangeRate <= 0
            ) {

                throw new Error(
                    `Amazon price is displayed in USD (${originalPrice}), ` +
                    `but USD_TO_INR is not configured.`
                );
            }

            finalINRPrice =
                convertAmazonPriceToINR(
                    originalPrice,
                    "USD"
                );

            console.log(
                `Amazon USD price: $${originalPrice.toFixed(2)}`
            );

            console.log(
                `Amazon converted INR price: ₹${finalINRPrice.toFixed(2)}`
            );
        }

        else {

            throw new Error(
                `Amazon currency could not be safely determined from price: ${selectedPrice.cleaned}`
            );
        }


        // ==================================================
        // 17. ROUND PRICE
        // ==================================================

        finalINRPrice =
            Math.round(
                (
                    finalINRPrice +
                    Number.EPSILON
                ) * 100
            ) / 100;


        // ==================================================
        // 18. FINAL AMAZON LOG
        // ==================================================

        console.log(
            "\n========================================"
        );

        console.log(
            "AMAZON PRODUCT"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Title:",
            productTitle
        );

        console.log(
            "ASIN:",
            asin
        );

        console.log(
            "Selected price text:",
            selectedPrice.cleaned
        );

        console.log(
            "Original price:",
            originalPrice
        );

        console.log(
            "Original currency:",
            detectedCurrency
        );

        console.log(
            "FINAL INR PRICE:",
            finalINRPrice
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // 19. RETURN AMAZON PRODUCT
        // ==================================================

        return {

            title:
                productTitle,

            currentPrice:
                finalINRPrice,

            currency:
                "INR",

            originalPrice:
                originalPrice,

            originalCurrency:
                detectedCurrency,

            productUrl:
                normalizedUrl,

            asin:
                asin
        };
    }

    catch (error) {

        console.error(
            "\nUnable to fetch product details:",
            error.message
        );

        throw error;
    }
};


// ======================================================
// Fetch Myntra product details
// Using ScrapingDog
// ======================================================

// ======================================================
// Fetch Myntra product details
// Using ScrapingDog
// ======================================================

const fetchMyntraProduct = async (productUrl) => {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "FETCHING MYNTRA PRODUCT"
        );

        console.log(
            "URL:",
            productUrl
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // 1. CHECK API KEY
        // ==================================================

        if (!process.env.SCRAPINGDOG_API_KEY) {

            throw createServiceError(
                "MISSING_SCRAPINGDOG_KEY",
                "ScrapingDog API key is missing."
            );

        }


        // ==================================================
        // 2. CALL SCRAPINGDOG
        // ==================================================

        let response;

        try {

            response = await axios.get(
                "https://api.scrapingdog.com/scrape",
                {

                    params: {

                        api_key:
                            process.env.SCRAPINGDOG_API_KEY,

                        url:
                            productUrl,

                        dynamic:
                            "true"

                    },

                    timeout: 30000

                }
            );

        }
        catch (error) {

            console.error(
                "Myntra ScrapingDog request failed:"
            );

            console.error(
                error.response?.data ||
                error.message
            );


            // ==================================================
            // CHECK API RESPONSE ERROR
            // ==================================================

            const apiData =
                error.response?.data;


            const apiMessage =
                apiData?.message ||
                apiData?.error ||
                error.message ||
                "";


            const message =
                String(apiMessage).toLowerCase();


            // ==================================================
            // SCRAPINGDOG LIMIT
            // ==================================================

            if (
                message.includes("limit reached") ||
                message.includes("account limit") ||
                message.includes("credits") ||
                message.includes("credit limit") ||
                message.includes("quota")
            ) {

              throw createServiceError(
    "SCRAPINGDOG_LIMIT",
    "Unable to check the latest Myntra price right now. Please try again later."
);

            }


            // ==================================================
            // TIMEOUT
            // ==================================================

            if (
                error.code === "ECONNABORTED" ||
                message.includes("timeout")
            ) {

                throw createServiceError(
                    "SCRAPINGDOG_TIMEOUT",
                    "Myntra price checking timed out. Please try again."
                );

            }


            // ==================================================
            // OTHER SCRAPINGDOG ERROR
            // ==================================================

            throw createServiceError(
                "MYNTRA_API_ERROR",
                "Unable to fetch the Myntra product price right now."
            );

        }


        console.log(
            "Myntra response status:",
            response.status
        );


        console.log(
            "Myntra response:"
        );

        console.log(
            response.data
        );


        // ==================================================
        // 3. CHECK API-LEVEL ERROR
        // ==================================================

        if (
            response.data &&
            response.data.success === false
        ) {

            const apiMessage =
                response.data.message ||
                response.data.error ||
                "Myntra API request failed.";


            const message =
                String(apiMessage).toLowerCase();


            // ==================================================
            // SCRAPINGDOG LIMIT
            // ==================================================

            if (
                message.includes("limit reached") ||
                message.includes("account limit") ||
                message.includes("credits") ||
                message.includes("credit limit") ||
                message.includes("quota")
            ) {

               throw createServiceError(
    "SCRAPINGDOG_LIMIT",
    "Unable to check the latest Myntra price right now. Please try again later."
);

            }


            throw createServiceError(
                "MYNTRA_API_ERROR",
                apiMessage
            );

        }


        // ==================================================
        // 4. GET HTML
        // ==================================================

        const html =
            response.data?.html ||
            response.data?.body ||
            (
                typeof response.data === "string"
                    ? response.data
                    : null
            );


        if (!html) {

            throw createServiceError(
                "MYNTRA_API_ERROR",
                "Myntra did not return a valid product page."
            );

        }


        console.log(
            "Myntra HTML received."
        );


        // ==================================================
        // 5. PARSE HTML
        // ==================================================

        const $ =
            cheerio.load(html);


        // ==================================================
        // 6. TITLE
        // ==================================================

        let title =
            $("h1")
                .first()
                .text()
                .trim();


        if (!title) {

            title =
                $("title")
                    .first()
                    .text()
                    .trim();

        }


        if (!title) {

            title =
                "Myntra Product";

        }


        // ==================================================
        // 7. FIND PRICE
        // ==================================================

        let price = null;


        // --------------------------------------------------
        // discounted inside price object
        // --------------------------------------------------

        const discountedMatch =
            html.match(
                /"price"\s*:\s*\{[\s\S]*?"mrp"\s*:\s*([\d.]+)[\s\S]*?"discounted"\s*:\s*([\d.]+)/
            );


        if (discountedMatch) {

            price =
                Number(
                    discountedMatch[2]
                );

            console.log(
                "Myntra discounted price found:",
                price
            );

        }


        // --------------------------------------------------
        // discounted fallback
        // --------------------------------------------------

        if (
            price === null ||
            !Number.isFinite(price)
        ) {

            const simplePriceMatch =
                html.match(
                    /"discounted"\s*:\s*([\d.]+)/
                );


            if (simplePriceMatch) {

                price =
                    Number(
                        simplePriceMatch[1]
                    );

                console.log(
                    "Myntra alternative price found:",
                    price
                );

            }

        }


        // --------------------------------------------------
        // discountedPrice fallback
        // --------------------------------------------------

        if (
            price === null ||
            !Number.isFinite(price)
        ) {

            const priceMatch =
                html.match(
                    /"discountedPrice"\s*:\s*([\d.]+)/
                );


            if (priceMatch) {

                price =
                    Number(
                        priceMatch[1]
                    );

                console.log(
                    "Myntra discountedPrice found:",
                    price
                );

            }

        }


        // ==================================================
        // 8. VALIDATE PRICE
        // ==================================================

        if (
            price === null ||
            !Number.isFinite(price) ||
            price <= 0
        ) {

            throw createServiceError(
                "MYNTRA_API_ERROR",
                "Unable to find a valid price for this Myntra product."
            );

        }


        // ==================================================
        // 9. SUCCESS
        // ==================================================

        console.log(
            "\n========================================"
        );

        console.log(
            "MYNTRA PRODUCT FETCHED"
        );

        console.log(
            "Title:",
            title
        );

        console.log(
            "Price:",
            price
        );

        console.log(
            "========================================"
        );


        return {

            title,

            price,

            productUrl,

            website:
                "myntra"

        };

    }
    catch (error) {

        console.error(
            "\n========================================"
        );

        console.error(
            "MYNTRA PRODUCT ERROR"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "========================================"
        );


        // ==================================================
        // DO NOT HIDE OUR CUSTOM ERRORS
        // ==================================================

        if (
            error.code ===
                "SCRAPINGDOG_LIMIT" ||

            error.code ===
                "MISSING_SCRAPINGDOG_KEY" ||

            error.code ===
                "SCRAPINGDOG_TIMEOUT" ||

            error.code ===
                "MYNTRA_API_ERROR"
        ) {

            throw error;

        }


        // ==================================================
        // UNKNOWN ERROR
        // ==================================================

        throw createServiceError(
            "MYNTRA_API_ERROR",
            "Unable to fetch the Myntra product price right now."
        );

    }

};


// ======================================================
// Fetch Flipkart product details
// Using ScrapingDog Flipkart Product API
// ======================================================

// ======================================================
// Fetch Flipkart product details
// Using ScrapingDog Flipkart Product API
// ======================================================

const fetchFlipkartProduct = async (productUrl) => {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "FETCHING FLIPKART PRODUCT"
        );

        console.log(
            "URL:",
            productUrl
        );

        console.log(
            "========================================"
        );


        // ==================================================
        // 1. CHECK API KEY
        // ==================================================

        if (!process.env.SCRAPINGDOG_API_KEY) {

            throw createServiceError(
                "MISSING_SCRAPINGDOG_KEY",
                "ScrapingDog API key is missing."
            );

        }


        // ==================================================
        // 2. CALL SCRAPINGDOG FLIPKART API
        // ==================================================

        let response;

        try {

            response =
                await axios.get(
                    "https://api.scrapingdog.com/flipkart/product",
                    {

                        params: {

                            api_key:
                                process.env.SCRAPINGDOG_API_KEY,

                            url:
                                productUrl

                        },

                        timeout: 60000

                    }
                );

        }
        catch (error) {

            console.error(
                "Flipkart ScrapingDog request failed:"
            );

            console.error(
                error.response?.data ||
                error.message
            );


            const apiData =
                error.response?.data;


            const apiMessage =
                apiData?.message ||
                apiData?.error ||
                error.message ||
                "";


            const message =
                String(apiMessage).toLowerCase();


            // ==================================================
            // SCRAPINGDOG LIMIT
            // ==================================================

            if (
                message.includes("limit reached") ||
                message.includes("account limit") ||
                message.includes("credits") ||
                message.includes("credit limit") ||
                message.includes("quota")
            ) {

               throw createServiceError(
    "SCRAPINGDOG_LIMIT",
    "Flipkart product fetching is temporarily unavailable because the ScrapingDog API limit has been reached."
);

            }


            // ==================================================
            // TIMEOUT
            // ==================================================

            if (
                error.code === "ECONNABORTED" ||
                message.includes("timeout")
            ) {

                throw createServiceError(
                    "SCRAPINGDOG_TIMEOUT",
                    "Flipkart price checking timed out. Please try again."
                );

            }


            // ==================================================
            // OTHER API ERROR
            // ==================================================

            throw createServiceError(
                "FLIPKART_API_ERROR",
                "Unable to fetch the Flipkart product price right now."
            );

        }


        console.log(
            "Flipkart response status:",
            response.status
        );


        console.log(
            "Flipkart API response:"
        );

        console.log(
            response.data
        );


        // ==================================================
        // 3. API-LEVEL ERROR
        // ==================================================

        if (
            response.data &&
            response.data.success === false
        ) {

            const apiMessage =
                response.data.message ||
                response.data.error ||
                "Flipkart API request failed.";


            const message =
                String(apiMessage).toLowerCase();


            // ==================================================
            // SCRAPINGDOG LIMIT
            // ==================================================

            if (
                message.includes("limit reached") ||
                message.includes("account limit") ||
                message.includes("credits") ||
                message.includes("credit limit") ||
                message.includes("quota")
            ) {

              throw createServiceError(
    "SCRAPINGDOG_LIMIT",
    "Flipkart product fetching is temporarily unavailable because the ScrapingDog API limit has been reached."
);

            }


            throw createServiceError(
                "FLIPKART_API_ERROR",
                apiMessage
            );

        }


        // ==================================================
        // 4. GET PRODUCT RESULT
        // ==================================================

        const productResults =
            response.data?.product_results;


        if (!productResults) {

            console.error(
                "Flipkart product data not found."
            );

            console.error(
                "Response:",
                response.data
            );


            throw createServiceError(
                "FLIPKART_API_ERROR",
                "Flipkart did not return valid product information."
            );

        }


        // ==================================================
        // 5. TITLE
        // ==================================================

        let title =
            productResults.title;


        if (
            !title ||
            typeof title !== "string"
        ) {

            title =
                "Flipkart Product";

        }


        title =
            title.trim();


        // ==================================================
        // 6. PRICE
        // ==================================================

        const priceText =
            productResults.price;


        console.log(
            "Flipkart title:",
            title
        );

        console.log(
            "Flipkart price text:",
            priceText
        );


        if (!priceText) {

            throw createServiceError(
                "FLIPKART_API_ERROR",
                "Unable to find the current Flipkart product price."
            );

        }


        // ==================================================
        // 7. CLEAN PRICE
        // ==================================================

        const price =
            cleanPrice(
                priceText
            );


        // ==================================================
        // 8. VALIDATE PRICE
        // ==================================================

        if (
            !Number.isFinite(price) ||
            price <= 0
        ) {

            console.error(
                "Invalid Flipkart price:",
                priceText
            );


            throw createServiceError(
                "FLIPKART_API_ERROR",
                "Flipkart returned an invalid product price."
            );

        }


        // ==================================================
        // 9. SUCCESS
        // ==================================================

        console.log(
            "\n========================================"
        );

        console.log(
            "FLIPKART PRODUCT FETCHED"
        );

        console.log(
            "Title:",
            title
        );

        console.log(
            "Price:",
            price
        );

        console.log(
            "========================================"
        );


        return {

            title,

            price,

            productUrl,

            website:
                "flipkart"

        };

    }
    catch (error) {

        console.error(
            "\n========================================"
        );

        console.error(
            "FLIPKART PRODUCT ERROR"
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "========================================"
        );


        // ==================================================
        // DO NOT HIDE CUSTOM ERRORS
        // ==================================================

        if (
            error.code ===
                "SCRAPINGDOG_LIMIT" ||

            error.code ===
                "MISSING_SCRAPINGDOG_KEY" ||

            error.code ===
                "SCRAPINGDOG_TIMEOUT" ||

            error.code ===
                "FLIPKART_API_ERROR"
        ) {

            throw error;

        }


        // ==================================================
        // UNKNOWN ERROR
        // ==================================================

        throw createServiceError(
            "FLIPKART_API_ERROR",
            "Unable to fetch the Flipkart product price right now."
        );

    }

};


// ======================================================
// Fetch product details based on URL
// ======================================================

const fetchProductDetails = async (
    productUrl
) => {

    if (
        !productUrl
    ) {

        console.log(
            "Product URL is required"
        );

        return null;
    }


    const website =
        detectWebsite(
            productUrl
        );


    console.log(
        `Detected website: ${website}`
    );


    if (
        website === "invalid"
    ) {

        console.log(
            "Invalid product URL"
        );

        return null;
    }


    // ------------------------------------------
    // Amazon
    // ------------------------------------------

    if (
        website === "amazon"
    ) {

        return await fetchAmazonProduct(
            productUrl
        );
    }


    // ------------------------------------------
    // Flipkart
    // ------------------------------------------

    if (
        website === "flipkart"
    ) {

        return await fetchFlipkartProduct(
            productUrl
        );
    }


    // ------------------------------------------
    // Myntra
    // ------------------------------------------

    if (
        website === "myntra"
    ) {

        return await fetchMyntraProduct(
            productUrl
        );
    }


    // ------------------------------------------
    // Unsupported
    // ------------------------------------------

    console.log(
        "Unsupported e-commerce website."
    );

    return null;
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    fetchProductDetails,

    detectWebsite,

    fetchAmazonProduct,

    fetchMyntraProduct,

    fetchFlipkartProduct
};