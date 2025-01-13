import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from 'dotenv';
import userRouter from "./routes/user.routs.js";
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
app.use("/api/v1/users", userRouter);
app.get("/", (req, res) => {
    console.log("User entry point");
    res.send("Hello, World!");
});

// Start server
export { app };
