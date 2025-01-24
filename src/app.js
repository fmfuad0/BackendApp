import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from 'dotenv';

import { dashboardRouter } from "./routes/dashboard.routes.js";
import userRouter from "./routes/user.routs.js";
import commentRouter from "./routes/comment.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";

dotenv.config({ path: './.env' });
const app = express();

// Enable CORS with credentials
app.use(cors({ origin: process.env.corsOrigin, credentials: "true" }));

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true })); // Add extended: true here

// Static files
app.use(express.static("public"));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    console.log("User entry point");
    res.send("Hello, World!");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/health-check", healthCheckRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// app.use("/api/v1/videos", videoRouter);
// app.use("/api/v1/subscription", subscriptionRouter);

export { app };