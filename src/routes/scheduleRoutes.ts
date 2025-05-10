import express from "express";
import {
  assignTrainer,
  bookSchedule,
  cancelBooking,
  createSchedule,
  deleteSchedule,
  getMyBookings,
  getSchedule,
  getSchedules,
  getSchedulesByDate,
  updateSchedule,
} from "../controllers/classScheduleController";
import { authorize, protect } from "../middleware/auth";
import {
  scheduleValidation,
  updateScheduleValidation,
} from "../middleware/validators";

const router = express.Router();

//get all class schedules
router.get("/", getSchedules);

//get class schedules grouped by date
router.get("/by-date", getSchedulesByDate);

// Protected routes
router.use(protect);

// Trainee all bookings
router.get("/my-bookings", authorize("trainee"), getMyBookings);

// create a new class schedule
router.post("/", authorize("admin"), scheduleValidation, createSchedule);

// assign a trainer to a class schedule
router.put("/:id/assign-trainer", authorize("admin"), assignTrainer);

// update a class schedule
router.put(
  "/:id",
  authorize("admin"),
  updateScheduleValidation,
  updateSchedule
);

// get a class schedule by ID
router.get("/:id", getSchedule);

// book a class schedule
router.post("/:id/book", authorize("trainee"), bookSchedule);

// cancel a booking for a class schedule
router.delete("/:id/cancel-booking", authorize("trainee"), cancelBooking);

// delete a class schedule
router.delete("/delete/:id", authorize("admin"), deleteSchedule);

export default router;
