import express from "express";
import {
  getMe,
  login,
  register,
  updateProfile,
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import {
  loginValidation,
  registerValidation,
  updateProfileValidation,
} from "../middleware/validators";

const router = express.Router();

// create user route
router.post("/register", registerValidation, register);

// login user route
router.post("/login", loginValidation, login);

// get user profile
router.get("/me", protect, getMe);

// update user profile
router.put("/profile", protect, updateProfileValidation, updateProfile);

export default router;
