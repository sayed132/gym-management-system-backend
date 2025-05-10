"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const responseFormat_1 = require("../utils/responseFormat");
// register new user
const register = async (req, res) => {
    try {
        const userData = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email: userData.email });
        if (existingUser) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "User already exists",
                statusCode: 400,
            });
        }
        // Create new user
        const user = await User_1.User.create(userData);
        // Generate token
        const token = user.generateAuthToken();
        (0, responseFormat_1.sendResponse)(res, {
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        (0, responseFormat_1.sendResponse)(res, {
            success: false,
            message: error.message,
            statusCode: 500,
        });
    }
};
exports.register = register;
// login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await User_1.User.findOne({ email }).select("+password");
        if (!user) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "Invalid credentials",
                statusCode: 401,
            });
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "Invalid credentials",
                statusCode: 401,
            });
        }
        // Generate token
        const token = user.generateAuthToken();
        (0, responseFormat_1.sendResponse)(res, {
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    }
    catch (error) {
        (0, responseFormat_1.sendResponse)(res, {
            success: false,
            message: error.message,
            statusCode: 500,
        });
    }
};
exports.login = login;
// get me or refetch user
const getMe = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "User not found",
                statusCode: 404,
            });
        }
        (0, responseFormat_1.sendResponse)(res, {
            success: true,
            message: "User retrieved successfully",
            data: user
        });
    }
    catch (error) {
        (0, responseFormat_1.sendResponse)(res, {
            success: false,
            message: error.message,
            statusCode: 500,
        });
    }
};
exports.getMe = getMe;
// update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, email, phoneNumber, address } = req.body;
        // Find user
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "User not found",
                statusCode: 404,
            });
        }
        // Check if email is being updated and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                return (0, responseFormat_1.sendResponse)(res, {
                    success: false,
                    message: "Email already exists",
                    statusCode: 400,
                });
            }
        }
        // Update user
        const updatedUser = await User_1.User.findByIdAndUpdate(req.user.id, {
            $set: {
                ...(name && { name }),
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
                ...(address && { address }),
            },
        }, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            return (0, responseFormat_1.sendResponse)(res, {
                success: false,
                message: "User not found",
                statusCode: 404,
            });
        }
        (0, responseFormat_1.sendResponse)(res, {
            success: true,
            message: "Profile updated successfully",
            data: {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    phoneNumber: updatedUser.phoneNumber,
                    address: updatedUser.address,
                },
            },
        });
    }
    catch (error) {
        (0, responseFormat_1.sendResponse)(res, {
            success: false,
            message: error.message,
            statusCode: 500,
        });
    }
};
exports.updateProfile = updateProfile;
