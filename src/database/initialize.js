import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const connectionString = process.env.databaseURL;
const connectDB = async () => {
    try {
        if (!connectionString) {
            throw new Error("Database connection string (databaseURL) is not defined in the .env file.");
        }
        console.log("Connecting to database...");
        
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);  
    }
};

export default connectDB;
