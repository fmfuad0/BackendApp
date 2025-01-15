import mongoose, {aggregate} from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError, ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"
import { lookup } from "dns"
import { pipeline } from "stream"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user?._id
    if(!channelId)
        throw new apiError(400, "Channel id not found")
    
    const channel = await User.findById(new mongoose.Types.ObjectId(channelId))
    if(!channel)
        throw new apiError(400, "Channel not found")

    const channelStats = await Video.aggregate([
        {
            $match:{
                _id: channel._id
            }
        },
        {
            $lookup:{
                from:"videos",
                localField: "_id",
                foreignField: "owner",
                as:"allVideos",
                pipeline:[
                    {
                        
                    }
                ]
            }
        }
    ])
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
})

export {
    getChannelStats, 
    getChannelVideos
    }