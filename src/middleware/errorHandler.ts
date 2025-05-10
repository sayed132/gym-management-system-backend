import { NextFunction, Request, Response } from "express";

interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error occurred.",
      errorDetails: err.errors,
    });
  }

  // Handle unauthorized access
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access.",
      errorDetails: "You must be authenticated to perform this action.",
    });
  }

  // Handle booking limit exceeded
  if (err.message.includes("booking limit")) {
    return res.status(400).json({
      success: false,
      message:
        "Class schedule is full. Maximum 10 trainees allowed per schedule.",
    });
  }

  // Handle schedule limit exceeded
  if (err.message.includes("schedule limit")) {
    return res.status(400).json({
      success: false,
      message: "Maximum 5 schedules allowed per day.",
    });
  }

  // Default error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
