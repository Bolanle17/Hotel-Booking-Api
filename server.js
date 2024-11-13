const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const hotelRoute = require("./routes/hotelRoute");
const roomRoute = require("./routes/roomRoute");
const userModelRoute = require("./routes/userModelRoute");
const paymentRoute = require("./routes/paymentRoute");
const bookingRoute = require("./routes/bookingRoute");
const profileRoute = require("./routes/profileRoute");
const geocodeRoute = require("./routes/geocodeRoute")

connectDB();
const app = express();

app.use(cors({
  origin: "https://hotel-booking-frontend-livid.vercel.app",
  allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));



app.use(express.json());
app.use(cookieparser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/hotel", hotelRoute);
app.use("/api/room", roomRoute);
app.use("/api/user", userModelRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/profile", profileRoute); 
app.use("/api", geocodeRoute);
app.use(express.static('public'));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.json({ message: 'Something went wrong!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`You are listening on port ${port}`));

if (!process.env.JWT_SECRET_KEY) {
  console.error("JWT_SECRET_KEY is not set in the environment variables!");
  process.exit(1);
}

