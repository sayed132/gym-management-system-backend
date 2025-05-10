import { Request, Response } from "express";
import { User } from "../models/User";
import { sendResponse } from "../utils/responseFormat";

// register new user
export const register = async (req: Request, res: Response) => {
  try {
    const userData = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return sendResponse(res, {
        success: false,
        message: "User already exists",
        statusCode: 400,
      });
    }

    // Create new user
    const user = await User.create(userData);

    // Generate token
    const token = user.generateAuthToken();

    sendResponse(res, {
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
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      message: error.message,
      statusCode: 500,
    });
  }
};

// login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendResponse(res, {
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, {
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    // Generate token
    const token = user.generateAuthToken();

    sendResponse(res, {
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
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      message: error.message,
      statusCode: 500,
    });
  }
};

// get me or refetch user
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, {
        success: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    sendResponse(res, {
      success: true,
      message: "User retrieved successfully",
      data: user

    });
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      message: error.message,
      statusCode: 500,
    });
  }
};

// update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, address } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendResponse(res, {
        success: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendResponse(res, {
          success: false,
          message: "Email already exists",
          statusCode: 400,
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          ...(name && { name }),
          ...(email && { email }),
          ...(phoneNumber && { phoneNumber }),
          ...(address && { address }),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return sendResponse(res, {
        success: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    sendResponse(res, {
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
  } catch (error: any) {
    sendResponse(res, {
      success: false,
      message: error.message,
      statusCode: 500,
    });
  }
};
