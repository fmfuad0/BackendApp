import dotenv from "dotenv";
import connectDB from './src/database/initialize.js';
import { app } from "./src/app.js";
dotenv.config({ path: "./.env" })
connectDB()
    .then(() => {
        app.listen(process.env.port, () => {
            console.log(`Server is listening on port ${process.env.port}`);
        });
    }) 
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);

    })
    ////ADDEDDDDDDD
