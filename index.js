import dotenv from "dotenv";
import connectDB from './src/database/initialize.js';
dotenv.config({path:"/.env"})
import express from "express";
connectDB()

const app=express()

process.exit(0);
