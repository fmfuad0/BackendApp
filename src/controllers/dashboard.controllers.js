import mongoose, { Aggregate } from "mongoose"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

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
        const channelStats = await User.aggregate(
            [
                {
                    $match: { username: username }
                },
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
                        totalLikes: { $sum: "$allVideos.likes" },
                        totalDislikes: { $sum: "$allVideos.dislikes" },
                        totalViews: { $sum: "$allVideos.views" },
                        totalComments: { $sum: "$allVideos.comments" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalVideos: 1,
                        totalLikes: 1,
                        totalDislikes: 1,
                        totalViews: 1,
                        totalComments: 1,

                    }
                }
            ]
        )
        result.stats = channelStats[0]
    } catch (error) {
        return res.status(500)
            .json(
                new apiResponse(500, null, "Error fetching channel stats")
            )
    }

    try {
        const getVideosResponse = await fetch(`${process.env.server}/dashboard/videos`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.cookies.accessToken}`
                }
            }
        )
        const channelVideos = (await getVideosResponse.json()).data.allVideos
        result.videos = channelVideos
    } catch (error) {
        return res.status(500)
            .json(
                new apiResponse(500, null, "Error fetching channel videos")
            )
    }

    return res.status(200)
        .json(
            new apiResponse(200, result, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {

    console.log("getChannelVideos");
    const { username } = req.user;
    console.log(username);

    const result = await User.aggregate(
        [
            {
                $match: { username: username }
            },
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
                }
            },
            {
                $project: {
                    _id: 0,
                    allVideos: 1,
                    totalVideos: 1
                }
            }
        ]
    )
    return res.status(200)
        .json(
            new apiResponse(200, result[0], "Channel videos info fetched successfully")
        )
});



export {
    getChannelStats,
    getChannelVideos
}