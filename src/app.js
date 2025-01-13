import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import dotenv from 'dotenv';
import userRouter from "./routes/user.routs.js";
import router from "./routes/user.routs.js";
dotenv.config({ path: './.env' });

const app = express();
app.use(cors({ origin: process.env.corsOrigin, credentials: "true" }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
// Import routes 
app.use("/api/v1/users", userRouter).get("/", (req, res)=>{
    console.log(("user entry point"));
});

// Start server
export { app };

added
