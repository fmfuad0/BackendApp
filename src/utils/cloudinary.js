import { v2 as cloudinary } from 'cloudinary';
import { FILE } from 'dns';
import { response } from 'express';
import fs from "fs"
import { fileURLToPath } from 'url';

cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName,
    api_key: process.env.cloudinaryApiKey,
    api_secret: process.env.cloudinaryApiSecret
});

// Upload an file
const uploadOnCloudinary = async (FILEPATH) => {
    try {
        const response = await cloudinary.uploader.upload
            (
                FILEPATH,
                {
                    resource_type: "auto",
                }
            )
        console.log(`file uploaded successfuly!!${"\n"}..link: ${response.url}`)
        fs.unlink(FILEPATH, (err) => {
            if (err) {
                console.error(`Error removing file: ${err}`);
            }
            else
            console.log(`File has been successfully removed.`);
        });
        return response
    }
    catch (error) {
        return null
    };

};

export { uploadOnCloudinary }