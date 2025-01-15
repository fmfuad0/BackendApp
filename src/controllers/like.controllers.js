import {Like}  from "../models/like.model.js"
import {Video} from "../models/video.models.js"
import {Tweet} from "../models/tweet.models.js"
import {Comment} from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId)
        throw new apiError(400, "Video id is missing")
    const video = await Video.findById(videoId)
    if (!video)
        throw new apiError(404, "Video not found")
    const like = await Like.aggregate([
        {
            $match: {
                _id: video?._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoAllLikes",
            }
        },
        {
            $addField: {
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$videoAllLikes.likedBy"]
                        },
                        then: false,
                        else: true
                    }
                }
            }
        }
    ])
    console.log(like);
    if (!like[0].isLiked) {
        try {
            const result = await Like.findByIdAndDelete(like[0]._id)
            console.log("Unliked");
        } catch (error) {
            throw new apiResponse(401, "Failed deleting like", error.message)
        }
    }
    else {
        try {
            const createdLike = await Like.create({
                video: video,
                likedBy: req.user._id
            })
            console.log(`Liked....Created Like: \n${createdLike}`);
            return res
            .status(200)
            .json(
                new apiResponse(200,like[0], "Toggled")
            )
        } catch (error) {
            throw new apiError(402, "Failed creating like")
        }
    }
    //TODO: toggle like on video
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId)
        throw new apiError(400, "Comment id is missing")
    const comment = await Comment.findById(commentId)
    if (!comment)
        throw new apiError(404, "Comment not found")
    const like = await Like.aggregate([
        {
            $match: {
                _id: comment?._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentAllLikes",
            }
        },
        {
            $addField: {
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$commentAllLikes.likedBy"]
                        },
                        then: false,
                        else: true
                    }
                }
            }
        }
    ])
    console.log(like);

    if (!like[0].isLiked) {
        try {
            const result = await Like.findByIdAndDelete(like[0]._id)
            console.log("Unliked");
        } catch (error) {
            throw new apiResponse(401, "Failed deleting like", error.message)
        }
    }
    else {
        try {
            const createdLike = await Like.create({
                comment: comment,
                likedBy: req.user._id
            })
            console.log(`Liked....Created Like: \n${createdLike}`);
        } catch (error) {
            throw new apiError(402, "Failed creating like")
        }
    }
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId)
        throw new apiError(400, "Tweet id is missing")
    const tweet = await Tweet.findById(tweetId)
    if (!tweet)
        throw new apiError(404, "Tweet not found")
    const like = await Like.aggregate([
        {
            $match: {
                _id: tweet?._id
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "tweetAllLikes",
            }
        },
        {
            $addField: {
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$tweetAllLikes.likedBy"]
                        },
                        then: false,
                        else: true
                    }
                }
            }
        }
    ])
    console.log(like);

    if (!like[0].isLiked) {
        try {
            const result = await Like.findByIdAndDelete(like[0]._id)
            console.log("Unliked");
        } catch (error) {
            throw new apiResponse(401, "Failed deleting like", error.message)
        }
    }
    else {
        try {
            const createdLike = await Like.create({
                tweet: tweet,
                likedBy: req.user._id
            })
            console.log(`Liked....Created Like: \n${createdLike}`);
        } catch (error) {
            throw new apiError(402, "Failed creating like")
        }
    }
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const username = req.params

    try {
        await User.aggregate([
            {
                $match: {
                    username: username
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "likedBy",
                    as: "likesOfUser",
                    pipeline: [
                        {
                            $lookup: {
                                from: "videos",
                                localField: "video",
                                foreignField: "_id",
                                as: "likedVideos"
                            },
                            $addField: {
                                likedVideos: {
                                    $first: "$likedVideos"
                                }
                            }
                        }
                    ]
                }
            }
    
        ])
    } catch (error) {
        throw new apiError(400, "Error while getting liked videos")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}