const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const auth = async (req, res, next) => {
    const token = req.header("auth-token");
    console.log("Received token:", token);
    console.log("All headers:", req.headers);

    if (!token) {
        console.log("No token provided");
        return res.json({ success: false, message: "Unauthorized Access" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded token:", decoded);

        const user = await User.findById(decoded._id).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.json({ success: false, message: "Invalid Token" });
    }
};

const admin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.json({ success: false, message: "Access Denied" });
    }
    next();
};

const optional = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded._id).select("-password");
    } catch (error) {
        console.error("Error in optional auth middleware:", error);
    } finally {
        next();
    }
};

module.exports = { auth, admin, optional };