import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
const app=express();
app.use(cors({origin:process.env.corsOrigin, credentials:"true"}))
app.use(express.json({limit:"16kb",}))
app.use(express.urlencoded({extended:"true"}))
app.use(express.static("public"))
app.use(cookieParser())



export {app}