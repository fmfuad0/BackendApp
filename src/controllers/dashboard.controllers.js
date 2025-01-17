import mongoose, { aggregate } from "mongoose"
import { Video } from "../model/video.models.js"
import { Subscription } from "../model/subscription.models.js"
import { Like } from "../model/like.models.js"
import { apiError} from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../model/user.models.js"
import { getUserChannelProfile } from "./user.controllers.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelInfo = getUserChannelProfile(req.user?._id)
    const videoInfo = getChannelVideos(req.user?._id)

    if(!channelInfo || !videoInfo)
        throw new apiError(400, "Could not fetch channel and videos info")

    return res
    .status(200)
    .json(
        new apiResponse(200, channelInfo, videoInfo.select("-allVideos -allLikes"), "Channel states fetched")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user?._id;
    
    if (!channelId) {
        throw new apiError(400, "Channel id not found");
    }

    const channel = await User.findById(new mongoose.Types.ObjectId(channelId));
    if (!channel) {
        throw new apiError(404, "Channel not found");
    }

    const result = await User.aggregate([
        {
            $match: {
                _id: channel._id
            }
        },
        {
            $lookup: {
                from: "videos", // Collection where video documents are stored
                localField: "_id",
                foreignField: "owner", // Assuming "owner" links video to user
                as: "allVideos"
            }
        },
        {
            $lookup: {
                from: "likes", // Collection where likes are stored
                localField: "allVideos._id", // Link likes to individual videos
                foreignField: "video", // Assuming "video" field links likes to a video
                as: "allLikes"
            }
        },
        {
            $unwind: "$allVideos"  // Unwind the allVideos array to process individual video documents
        },
        {
            $addFields: {
                totalViews: "$allVideos.views", // Get the views from each video
                totalLikes: { $size: "$allLikes" } // Count the number of likes per video
            }
        },
        {
            $group: {
                _id: null,  // Group all videos together
                totalViews: { $sum: "$totalViews" },  // Sum all views
                totalLikes: { $sum: "$totalLikes" }   // Sum all likes
            }
        }
    ]);

    if (result.length > 0) {
        return res.status(200).json(new apiResponse(200, result[0], "Videos and likes fetched"));
    } else {
        return res.status(404).json(new apiResponse(404, {}, "No videos found"));
    }
});

export {
    getChannelStats,
    getChannelVideos
}