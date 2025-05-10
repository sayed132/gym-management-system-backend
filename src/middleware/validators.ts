import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

// Validation middleware
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error occurred.",
      errorDetails: errors.array(),
    });
  }
  next();
};

// User registration validation
export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["admin", "trainer", "trainee"])
    .withMessage("Invalid role specified"),
  validate,
];

// Login validation
export const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Class schedule validation for create
export const scheduleValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("date")
    .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/)
    .withMessage("Date must be in MM-DD-YYYY format"),
  body("startTime")
    .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
    .withMessage("Start time must be in HH:MM AM/PM format"),
  body("endTime")
    .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
    .withMessage("End time must be in HH:MM AM/PM format"),
  body("trainer").isMongoId().withMessage("Valid trainer ID is required"),
  validate,
];

// Class schedule validation for update (all fields optional)
export const updateScheduleValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("date")
    .optional()
    .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/)
    .withMessage("Date must be in MM-DD-YYYY format"),
  body("startTime")
    .optional()
    .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
    .withMessage("Start time must be in HH:MM AM/PM format"),
  body("endTime")
    .optional()
    .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
    .withMessage("End time must be in HH:MM AM/PM format"),
  body("trainer")
    .optional()
    .isMongoId()
    .withMessage("Valid trainer ID is required"),
  validate,
];

// User profile update validation
export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage("Please provide a valid email"),
  body("phoneNumber")
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"),
  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),
  validate,
];
