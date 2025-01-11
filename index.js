import dotenv from "dotenv";
import connectDB from './src/database/initialize.js';
dotenv.config({path:"/.env"})
import express from "express";
const app=express()

connectDB()
.then(()=>{
        app.listen(process.env.port || 6000, () =>{
        console.log(`Server is listening on port: ${process.env.port}`);
        
    })
})
.catch((err)=>{
    console.error("Mongodb connection error!", err);
});
process.exit(0);
