import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { apiError } from "./apiError.js";
import { apiResponse } from "./apiResponse.js";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.cloudinaryCloudName,
  api_key: process.env.cloudinaryApiKey,
  api_secret: process.env.cloudinaryApiSecret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log("Local file path:", localFilePath);

    if (!localFilePath) return null;

    console.log("Uploading file to Cloudinary...");
    const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });

    console.log("File uploaded successfully to Cloudinary:", response.url);

    // Delete the local file after uploading
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    // Return response for success (You can modify the way you return this based on the controller setup)
    return response;

  } catch (error) {
    // Handle file deletion if the upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Error uploading file to Cloudinary:", error);
    throw new apiError(401, "Failed to upload file to Cloudinary.");
  }
}

export { uploadOnCloudinary };
