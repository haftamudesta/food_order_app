// configure express and middleware
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

// import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const restaurantRoutes = require("./routes/restaurantRoute");
const orderRoutes = require("./routes/orderRoute");
const menuRoutes = require("./routes/menuRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoute");
const paymentRoutes = require("./routes/paymentRoute");


app.use(cors());


app.use("/api/v1/payment", paymentRoutes);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/food", foodRoutes);
app.use("/api/v1/cart", cartRoutes);

module.exports = app;