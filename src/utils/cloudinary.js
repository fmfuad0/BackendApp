import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.cloudinaryCloudName, 
  api_key: process.env.cloudinaryApiKey, 
  api_secret: process.env.cloudinaryApiSecret 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("Local: ");
        
        if (!localFilePath) return null
        console.log(`upload the file on cloudinary`)
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}