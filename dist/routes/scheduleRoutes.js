"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const classScheduleController_1 = require("../controllers/classScheduleController");
const auth_1 = require("../middleware/auth");
const validators_1 = require("../middleware/validators");
const router = express_1.default.Router();
//get all class schedules
router.get("/", classScheduleController_1.getSchedules);
//get class schedules grouped by date
router.get("/by-date", classScheduleController_1.getSchedulesByDate);
// Protected routes
router.use(auth_1.protect);
// Trainee all bookings
router.get("/my-bookings", (0, auth_1.authorize)("trainee"), classScheduleController_1.getMyBookings);
// create a new class schedule
router.post("/", (0, auth_1.authorize)("admin"), validators_1.scheduleValidation, classScheduleController_1.createSchedule);
// assign a trainer to a class schedule
router.put("/:id/assign-trainer", (0, auth_1.authorize)("admin"), classScheduleController_1.assignTrainer);
// update a class schedule
router.put("/:id", (0, auth_1.authorize)("admin"), validators_1.updateScheduleValidation, classScheduleController_1.updateSchedule);
// get a class schedule by ID
router.get("/:id", classScheduleController_1.getSchedule);
// book a class schedule
router.post("/:id/book", (0, auth_1.authorize)("trainee"), classScheduleController_1.bookSchedule);
// cancel a booking for a class schedule
router.delete("/:id/cancel-booking", (0, auth_1.authorize)("trainee"), classScheduleController_1.cancelBooking);
// delete a class schedule
router.delete("/delete/:id", (0, auth_1.authorize)("admin"), classScheduleController_1.deleteSchedule);
exports.default = router;
