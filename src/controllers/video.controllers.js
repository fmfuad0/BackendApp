import mongoose from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { Video } from "../models/video.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description)
        throw new apiError(400, "Title and description are required.");

    console.log(req.file);

    const videoLocalPath = req.file?.path;
    const response = await uploadOnCloudinary(videoLocalPath);

    if (!response)
        throw new apiError(402, "Cloudinary upload failed.");

    try {
        const createdVideo = await Video.create({
            videoFile: videoLocalPath,
            // thumbnail: response.thumbnail,
            title: title,
            description: description,
            duration: response?.duration || 0, // Use a fallback if duration is missing
            views: 0, // Initialize views to 0
            isPublished: true,
            owner: req.user?._id
        });

        return res
            .status(200)
            .json(new apiResponse(200, { createdVideo }, "Video published successfully."));
    } catch (error) {
        throw new apiError(403, "Failed to publish video");
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId)
        throw new apiError(400, "videoId is missing")

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))

    if (!video)
        throw new apiError(404, "Video not found")

    return res
        .status(200)
        .json(
            new apiResponse(200, video, "Video fetched..")
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!videoId)
        throw new apiError(400, "videoid is missing")
    const { title, description} = req.body
    try {
        const updatedVideo = await Video.findByIdAndUpdate(new mongoose.Types.ObjectId(videoId), {
            title : title,
            description : description,
            thumbnail : "testThumbnail"
        }, {new : true})
        return res
            .status(200)
            .json(
                new apiResponse(200, updatedVideo, "Successfully updated video")
            )
    } catch (error) {
        throw new apiError(401, "Could not update video")
        
    }

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId)
        throw new apiError(400, "videoid is missing")
    try {
        await Video.findByIdAndDelete(new mongoose.Types.ObjectId(videoId))
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "Successfully deleted video")
            )
    } catch (error) {
        throw new apiError(400, "Could not delete video")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId)
        throw new apiError(400, "videoid is missing")
    const video = await Video.findByIdAndUpdate(new mongoose.Types.ObjectId(videoId), {
        isPublished: ((await Video.findById(new mongoose.Types.ObjectId(videoId))).isPublished) ? false : true
    }, {new: true})
    if (!video)
        throw new apiError(404, "Video not found")
    video.isPublished = !video.isPublished
    return res
        .status(200)
        .json(
            new apiResponse(200, video.isPublished, "Toggled")
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
