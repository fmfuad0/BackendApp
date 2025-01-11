import mongoose from "mongoose";
import  {DB_NAME}  from "../constants.js";
import dotenv from "dotenv"
import { Db } from "mongodb";
dotenv.config({path:"/workspaces/BackendApp/.env"})


const connectDB = async () =>{
    try{
        console.log(process.env.databaseURL);
        const connectionStatus = await mongoose.connect(`${process.env.databaseURL}`)
        console.log(`Connected Succesfully! HOST: ${connectionStatus}`);
    }
    catch(error){
        console.error("MongoDB connection ERRR: " , error);
    }
}

export default connectDB