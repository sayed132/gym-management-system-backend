"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.updateScheduleValidation = exports.scheduleValidation = exports.loginValidation = exports.registerValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
// Validation middleware
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation error occurred.",
            errorDetails: errors.array(),
        });
    }
    next();
};
exports.validate = validate;
// User registration validation
exports.registerValidation = [
    (0, express_validator_1.body)("name").trim().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "trainer", "trainee"])
        .withMessage("Invalid role specified"),
    exports.validate,
];
// Login validation
exports.loginValidation = [
    (0, express_validator_1.body)("email").isEmail().withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    exports.validate,
];
// Class schedule validation for create
exports.scheduleValidation = [
    (0, express_validator_1.body)("title").trim().notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("description").trim().notEmpty().withMessage("Description is required"),
    (0, express_validator_1.body)("date")
        .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/)
        .withMessage("Date must be in MM-DD-YYYY format"),
    (0, express_validator_1.body)("startTime")
        .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
        .withMessage("Start time must be in HH:MM AM/PM format"),
    (0, express_validator_1.body)("endTime")
        .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
        .withMessage("End time must be in HH:MM AM/PM format"),
    (0, express_validator_1.body)("trainer").isMongoId().withMessage("Valid trainer ID is required"),
    exports.validate,
];
// Class schedule validation for update (all fields optional)
exports.updateScheduleValidation = [
    (0, express_validator_1.body)("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title cannot be empty"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty"),
    (0, express_validator_1.body)("date")
        .optional()
        .matches(/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/)
        .withMessage("Date must be in MM-DD-YYYY format"),
    (0, express_validator_1.body)("startTime")
        .optional()
        .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
        .withMessage("Start time must be in HH:MM AM/PM format"),
    (0, express_validator_1.body)("endTime")
        .optional()
        .matches(/^([1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i)
        .withMessage("End time must be in HH:MM AM/PM format"),
    (0, express_validator_1.body)("trainer")
        .optional()
        .isMongoId()
        .withMessage("Valid trainer ID is required"),
    exports.validate,
];
// User profile update validation
exports.updateProfileValidation = [
    (0, express_validator_1.body)("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    (0, express_validator_1.body)("email")
        .optional()
        .trim()
        .toLowerCase()
        .isEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("phoneNumber")
        .optional()
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"),
    (0, express_validator_1.body)("address")
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage("Address cannot exceed 200 characters"),
    exports.validate,
];
