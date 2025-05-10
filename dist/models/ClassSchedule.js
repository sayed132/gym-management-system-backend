"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassSchedule = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const classScheduleSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Please provide a class title"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters long"],
        maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Please provide a class description"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters long"],
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
        type: Date,
        required: [true, "Please provide a class date"],
        validate: {
            validator: function (value) {
                return value >= new Date();
            },
            message: "Class date must be in the future",
        },
        set: function (value) {
            if (value instanceof Date) {
                return value;
            }
            // Convert MM-DD-YYYY to Date object with Bangladesh timezone
            const [month, day, year] = value.split("-").map(Number);
            const date = new Date(year, month - 1, day);
            // Set time to noon to avoid timezone issues
            date.setHours(12, 0, 0, 0);
            return date;
        },
        get: function (value) {
            // Convert UTC date to Bangladesh date
            const bangladeshDate = new Date(value);
            bangladeshDate.setHours(bangladeshDate.getHours() + 6);
            return bangladeshDate;
        },
    },
    startTime: {
        type: String,
        required: [true, "Please provide a start time"],
        set: function (value) {
            // Convert 12-hour format to 24-hour format
            const [time, period] = value.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12)
                hours += 12;
            if (period === "AM" && hours === 12)
                hours = 0;
            return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
        },
    },
    endTime: {
        type: String,
        required: [true, "Please provide an end time"],
        set: function (value) {
            // Convert 12-hour format to 24-hour format
            const [time, period] = value.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (period === "PM" && hours !== 12)
                hours += 12;
            if (period === "AM" && hours === 12)
                hours = 0;
            return `${hours.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`;
        },
    },
    trainer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Please provide a trainer"],
    },
    trainees: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    maxTrainees: {
        type: Number,
        default: 10,
        min: [1, "Maximum trainees must be at least 1"],
        max: [10, "Maximum trainees cannot exceed 10"],
    },
}, {
    timestamps: true,
});
// Validate that end time is 2 hours after start time
classScheduleSchema.pre("save", function (next) {
    const start = new Date(`2000-01-01T${this.startTime}`);
    const end = new Date(`2000-01-01T${this.endTime}`);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (diffHours !== 2) {
        next(new Error("Class duration must be exactly 2 hours"));
    }
    next();
});
// Validate that number of trainees doesn't exceed maxTrainees
classScheduleSchema.pre("save", function (next) {
    if (this.trainees.length > this.maxTrainees) {
        next(new Error("Maximum number of trainees exceeded"));
    }
    next();
});
// Validate that trainer is not already assigned to another class at the same time
classScheduleSchema.pre("save", async function (next) {
    const conflictingSchedule = await mongoose_1.default.model("ClassSchedule").findOne({
        date: this.date,
        startTime: this.startTime,
        trainer: this.trainer,
        _id: { $ne: this._id },
    });
    if (conflictingSchedule) {
        next(new Error("Trainer is already assigned to another class at this time"));
    }
    next();
});
exports.ClassSchedule = mongoose_1.default.model("ClassSchedule", classScheduleSchema);
