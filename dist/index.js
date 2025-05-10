"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./database/db"));
const errorHandler_1 = require("./middleware/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
// Routes
// app.use("/api", routes);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/schedules", scheduleRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Connect to database and start server
const startServer = async () => {
    try {
        await (0, db_1.default)();
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};
app.get("/", (req, res) => {
    res.send("Hey Welcome to Gym Management System");
});
startServer();
