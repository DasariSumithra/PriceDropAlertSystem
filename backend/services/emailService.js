//tola vznb xktr rmmh
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    }

});

const sendPriceAlert = async (
    email,
    productTitle,
    currentPrice,
    targetPrice,
    productUrl
) => {

    const mailOptions = {

        from: process.env.EMAIL_USER,

        to: email,

        subject: "🎉 Price Drop Alert!",

        html: `
            <h2>🎉 Price Dropped!</h2>

            <h3>${productTitle}</h3>

            <p><strong>Current Price:</strong> ₹${currentPrice}</p>

            <p><strong>Your Target Price:</strong> ₹${targetPrice}</p>

            <p>Your desired price has been reached.</p>

            <a href="${productUrl}">
                View Product
            </a>

            <br><br>

            <p>Thank you for using Price Drop Alert System.</p>
        `

    };

    await transporter.sendMail(mailOptions);

};

module.exports = {
    sendPriceAlert
};
