import mongoose, { Aggregate } from "mongoose"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"
import fetch from "node-fetch"
import { getChannelVideos } from "./user.controllers.js"
const getChannelStats = asyncHandler(async (req, res) => {
    console.log("Getting Channel Stats");
    const { username } = req.user;

    const result = {}

    try {
        const getProfileResponse = await fetch(`${process.env.server}/users/c/${username}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.cookies.accessToken}`
                }
            }
        )
        const channelProfile = (await getProfileResponse.json()).data
        result.channel = channelProfile
    } catch (error) {
        return res.status(500)
            .json(
                new apiResponse(500, null, "Error fetching channel profile")
            )

    }

    try {
        const channelStats = await User.aggregate([
            { $match: { "username": username } },
            {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner", 
                    as: "allVideos"
                }
            },
            {
                $addFields: {
                    totalVideos: { $size: "$allVideos" },
                    videos : "$allVideos",
                    totalLikes: { $sum: "$allVideos.likes" },
                    totalComments: { $sum: "$allVideos.comments" },
                    totalViews: { $sum: "$allVideos.views" },
                }
            },
            {
                $project: {
                    _id: 0,
                    totalVideos: 1,
                    totalLikes: 1,
                    totalComments: 1,
                    totalViews: 1,
                    videos: 1
                }
            }
        ]);
        if (channelStats.length > 0) {
            result.videos = channelStats[0].videos
            channelStats[0].videos= undefined
            result.stats = channelStats[0];
        } else {
            result.stats = { totalVideos: 0, totalLikes: 0, totalComments: 0, totalViews: 0, allVideos: [] };
        }
    }
    catch (error) {
        throw new apiError(500, null, "Error fetching detailed video info")
    }

    console.log(result);
    
    return res.status(200)
        .json(
            new apiResponse(200, result, "Channel Stats fetched successfully")
        )
})



export {
    getChannelStats,
}