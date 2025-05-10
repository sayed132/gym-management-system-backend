import { Request, Response } from "express";
import { ClassSchedule } from "../models/ClassSchedule";

// Create a new class schedule
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const { title, description, date, startTime, endTime, trainer } = req.body;

    // Convert date to Bangladesh timezone for validation
    const bangladeshDate = getBangladeshDate(new Date(date));
    const dateKey = bangladeshDate.toISOString().split("T")[0];

    // Create start and end of day in Bangladesh timezone
    const startOfDay = new Date(dateKey);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateKey);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if date already has 5 schedules
    const schedulesOnDate = await ClassSchedule.countDocuments({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (schedulesOnDate >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 schedules allowed per day",
      });
    }

    // Check if trainer already has a class at this time
    const conflictingSchedule = await ClassSchedule.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      startTime,
      trainer,
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: "Trainer already has a class scheduled at this time",
      });
    }

    const schedule = await ClassSchedule.create({
      title,
      description,
      date,
      startTime,
      endTime,
      trainer,
    });

    res.status(201).json({
      success: true,
      message: "Class schedule created successfully",
      data: schedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to create class schedule",
      errorDetails: error.message,
    });
  }
};

// Get all class schedules
export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await ClassSchedule.find()
      .populate("trainer", "name email")
      .populate("trainees", "name email");

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to get class schedules",
      errorDetails: error.message,
    });
  }
};

// Get single class schedule
export const getSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id)
      .populate("trainer", "name email")
      .populate("trainees", "name email");

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to get class schedule",
      errorDetails: error.message,
    });
  }
};

// Update class schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    // If date or time is being updated, check for conflicts
    if (req.body.date || req.body.startTime || req.body.trainer) {
      const date = req.body.date ? new Date(req.body.date) : schedule.date;
      const startTime = req.body.startTime || schedule.startTime;
      const trainer = req.body.trainer || schedule.trainer;

      // Convert date to Bangladesh timezone for validation
      const bangladeshDate = getBangladeshDate(date);
      const dateKey = bangladeshDate.toISOString().split("T")[0];

      // Create start and end of day in Bangladesh timezone
      const startOfDay = new Date(dateKey);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateKey);
      endOfDay.setHours(23, 59, 59, 999);

      // Check if date already has 5 schedules
      const schedulesOnDate = await ClassSchedule.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        _id: { $ne: schedule._id },
      });

      if (schedulesOnDate >= 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 schedules allowed per day",
        });
      }

      // Check if trainer already has a class at this time
      const conflictingSchedule = await ClassSchedule.findOne({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        startTime,
        trainer,
        _id: { $ne: schedule._id },
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          success: false,
          message: "Trainer already has a class scheduled at this time",
        });
      }
    }

    // Update only the fields that are provided
    const updatedSchedule = await ClassSchedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Class schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to update class schedule",
      errorDetails: error.message,
    });
  }
};

// Delete class schedule
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ClassSchedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class schedule deleted successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to delete class schedule",
      errorDetails: error.message,
    });
  }
};

// Book a class schedule
export const bookSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    // Check if class is full
    if (schedule.trainees.length >= schedule.maxTrainees) {
      return res.status(400).json({
        success: false,
        message:
          "Class schedule is full. Maximum 10 trainees allowed per schedule.",
      });
    }

    // Check if trainee is already booked
    if (schedule.trainees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this class",
      });
    }

    // Convert date to Bangladesh timezone for validation
    const bangladeshDate = getBangladeshDate(schedule.date);
    const dateKey = bangladeshDate.toISOString().split("T")[0];

    // Create start and end of day in Bangladesh timezone
    const startOfDay = new Date(dateKey);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateKey);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if trainee has another class at the same time
    const conflictingSchedule = await ClassSchedule.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      startTime: schedule.startTime,
      trainees: req.user._id,
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: "You already have a class booked at this time",
      });
    }

    schedule.trainees.push(req.user._id);
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Class booked successfully",
      data: schedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to book class",
      errorDetails: error.message,
    });
  }
};

// Cancel a class booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const schedule = await ClassSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    // Check if trainee is booked
    if (!schedule.trainees.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You have not booked this class",
      });
    }

    schedule.trainees = schedule.trainees.filter(
      (trainee) => trainee.toString() !== req.user._id.toString()
    );
    await schedule.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: schedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to cancel booking",
      errorDetails: error.message,
    });
  }
};

// Helper function to get Bangladesh date from UTC date
const getBangladeshDate = (date: Date) => {
  const bangladeshDate = new Date(date);
  bangladeshDate.setHours(bangladeshDate.getHours() + 6);
  return bangladeshDate;
};

// Get all class schedules grouped by date
export const getSchedulesByDate = async (req: Request, res: Response) => {
  try {
    const schedules = await ClassSchedule.find()
      .populate("trainer", "name email")
      .populate("trainees", "name email")
      .sort({ date: 1, startTime: 1 });

    // Group schedules by date
    const groupedSchedules = schedules.reduce((acc: any, schedule) => {
      // Convert UTC date to Bangladesh date
      const bangladeshDate = getBangladeshDate(schedule.date);
      const dateKey = bangladeshDate.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      // Create a new object with the correct date
      const scheduleWithBangladeshDate = {
        ...schedule.toObject(),
        date: bangladeshDate.toISOString(),
      };

      acc[dateKey].push(scheduleWithBangladeshDate);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedSchedules,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to get class schedules",
      errorDetails: error.message,
    });
  }
};

// Get trainee's booked classes grouped by date
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const traineeId = req.user._id;

    const bookedSchedules = await ClassSchedule.find({
      trainees: { $in: [traineeId] },
    })
      .populate("trainer", "name email")
      .populate("trainees", "name email")
      .sort({ date: 1, startTime: 1 });

    // Group schedules by date
    const groupedBookings = bookedSchedules.reduce((acc: any, schedule) => {
      // Convert UTC date to Bangladesh date
      const bangladeshDate = getBangladeshDate(schedule.date);
      const dateKey = bangladeshDate.toISOString().split("T")[0];

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      // Create a new object with the correct date
      const scheduleWithBangladeshDate = {
        ...schedule.toObject(),
        date: bangladeshDate.toISOString(),
      };

      acc[dateKey].push(scheduleWithBangladeshDate);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedBookings,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to get booked classes",
      errorDetails: error.message,
    });
  }
};

// Assign trainer to class schedule
export const assignTrainer = async (req: Request, res: Response) => {
  try {
    const { trainer } = req.body;

    const schedule = await ClassSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Class schedule not found",
      });
    }

    // Check if trainer already has a class at this time
    const bangladeshDate = getBangladeshDate(schedule.date);
    const dateKey = bangladeshDate.toISOString().split("T")[0];
    const startOfDay = new Date(dateKey);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateKey);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingSchedule = await ClassSchedule.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      startTime: schedule.startTime,
      trainer,
      _id: { $ne: schedule._id },
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: "Trainer already has a class scheduled at this time",
      });
    }

    const updatedSchedule = await ClassSchedule.findByIdAndUpdate(
      req.params.id,
      { trainer },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Trainer assigned successfully",
      data: updatedSchedule,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Failed to assign trainer",
      errorDetails: error.message,
    });
  }
};
