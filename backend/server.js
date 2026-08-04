const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();   // <-- Move here first

const connectDB = require("./config/db");
const { startPriceScheduler } = require("./scheduler/priceScheduler");

const app = express();

connectDB();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
    res.send("Price Drop Alert API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

startPriceScheduler();