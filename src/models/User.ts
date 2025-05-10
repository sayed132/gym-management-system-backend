import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "trainer" | "trainee";
  phoneNumber?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  generateAuthToken(): string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "trainer", "trainee"],
        message: "Role must be either admin, trainer, or trainee",
      },
      default: "trainee",
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please provide a valid phone number"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  const options: SignOptions = {
    expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
  };

  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || "your-secret-key",
    options
  );
};

// Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Validate email uniqueness
userSchema.pre("save", async function (next) {
  if (this.isModified("email")) {
    const existingUser = await mongoose.model("User").findOne({
      email: this.email,
      _id: { $ne: this._id },
    });

    if (existingUser) {
      next(new Error("Email already exists"));
    }
  }
  next();
});

export const User = mongoose.model<IUser>("User", userSchema);
