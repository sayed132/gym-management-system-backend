"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
                errorDetails: "Please login to access this resource.",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key");
        const user = await User_1.User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access.",
                errorDetails: "User not found.",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access.",
            errorDetails: "Invalid token.",
        });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access.",
                errorDetails: `User role ${req.user.role} is not authorized to access this route.`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
