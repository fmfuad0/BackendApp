import mongoose from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import Video from "../models/video.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
import fs from "fs"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description)
        throw new apiError(400, "Provide all fields")

    const videoLocalPath = req.file?.video?.[0]?.path
    const response = await uploadOnCloudinary(videoLocalPath)
    if(!response)
        throw new apiError(400, "Cloudinary Upload failed")
    try {
        const createdVideo = await Video.create({
            videoFile: videoLocalPath,
            thumbnail: response.thumbnail,
            title: title,
            description: description,
            duration: response.duration,
            views,
            isPublished: true,
            owner: req.user
        })
        try {
            fs.unlink(videoLocalPath)
        } catch (error) {
            throw new apiError(400, "Failed unlinking local file")
        }
        return res
        .status(200)
        .json(
            new apiResponse(200, {createdVideo}, "Video published")
        )
    } catch (error) {
        
    }

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId)
        throw new apiError(400, "videoId is missing")

    const video =await Video.findById(new mongoose.Types.ObjectId(videoId))

    if(!video)
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

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId)
        throw new apiError(400, "videoid is missing")
    if(!video)
        throw new apiError(404, "Video not found")
    try {
        await Video.findByIdAndDelete(new mongoose.Types.ObjectId(videoId))
        return res
        .status(200)
        .json(
            new apiResponse(200, {} ,"Successfully deleted video")
        )
    } catch (error) {
        throw new apiError(400, "Could not delete video")
    }
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId)
        throw new apiError(400, "videoid is missing")
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))
    if(!video)
        throw new apiError(404, "Video not found")
    video.isPublished = ( true || video.isPublished ) && !( true && video.isPublished ) //logical xor operation
    return res
    .status(200)
    .json(
        new apiResponse(200, video.isPublished ,"Toggled")
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
