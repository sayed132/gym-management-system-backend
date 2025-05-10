"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../middleware/validators");
const router = express_1.default.Router();
// create user route
router.post("/register", validators_1.registerValidation, authController_1.register);
// login user route
router.post("/login", validators_1.loginValidation, authController_1.login);
// get user profile
router.get("/me", auth_1.protect, authController_1.getMe);
// update user profile
router.put("/profile", auth_1.protect, validators_1.updateProfileValidation, authController_1.updateProfile);
exports.default = router;
