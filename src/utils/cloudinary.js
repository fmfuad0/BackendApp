import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret
});

// Upload an file
const uploadOnCloudinary = async (FILEPATH) => {
    try {
        const uploadResult = await cloudinary.uploader.upload
            (
                FILEPATH,
                {
                    public_id: 'shoes',
                }
            )
            console.log("File uploaded successfuly!!", response.url)
    }
    catch(error) {
            fs.unlink(FILEPATH)//file removed
            return null
        };
    console.log(uploadResult);

};

export {uploadOnCloudinary}