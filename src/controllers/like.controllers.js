import mongoose from "mongoose"
import { Like } from "../models/like.models.js"
import { Video } from "../models/video.models.js"
import { Tweet } from "../models/tweet.models.js"
import { Comment } from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId)
        throw new apiError(400, "Video id is missing")
    const video = await Video.findById(new mongoose.Types.ObjectId(videoId))
    if (!video)
        throw new apiError(404, "Video not found")
    const like = await Like.aggregate([
        {
            $match: {
                "likedBy": req.user._id,
                "video": video._id
            }
        },

    ])
    if (like.length === 0) {
        // If the user hasn't liked the video or no likes found
        try {
            const createdLike = await Like.create({
                video: videoId,
                likedBy: req.user._id
            });
            console.log(`Liked....Created Like: \n${createdLike}`);

            // Increment like count in the video
            const updateVideo = await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } }, { new: true });
            console.log(updateVideo.likes);
            return res.status(200).json(new apiResponse(200, createdLike, "Toggled like on video"));
        } catch (error) {
            throw new apiError(402, "Failed creating like");
        }
    } else {
        // If the user has already liked the video, we remove the like
        try {
            const result = await Like.findOneAndDelete({
                video: videoId,
                likedBy: req.user._id
            });
            if (!result) {
                throw new apiError(404, "Like not found for this user");
            }

            // Decrement like count in the video
            const updateVideo = await Video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } }, { new: true });
            console.log("Unliked");
            console.log(updateVideo.likes);
            return res.status(200).json(new apiResponse(200, null, "Toggled like off video"));
        } catch (error) {
            throw new apiError(401, "Failed deleting like");
        }
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId)
        throw new apiError(400, "Comment id is missing")
    const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId))
    if (!comment)
        throw new apiError(404, "Comment not found")
    const like = await Like.aggregate([
        {
            $match: { "comment": comment._id, "likedBy": req.user._id }
        }
    ])
    console.log(like);
    if (like.length === 0) {
        try {
            const createdLike = await Like.create({
                "comment": comment._id,
                "likedBy": req.user._id
            });
            console.log(`Liked....Created Like: \n${createdLike}`);
            const updateComment = await Comment.findByIdAndUpdate(comment._id, { $inc: { likes: 1 } }, { new: true });
            console.log(updateComment.likes);
            return res.status(200).json(new apiResponse(200, createdLike, "Toggled like on video"));
        } catch (error) {
            throw new apiError(402, "Failed creating like");
        }
    } else {
        try {
            const result = await Like.findOneAndDelete({
                "comment": comment._id,
                "likedBy": req.user._id
            });
            if (!result) {
                throw new apiError(404, "Like not found for this user");
            }

            // Decrement like count in the video
            const updateComment = await Comment.findByIdAndUpdate(comment._id, { $inc: { likes: -1 } }, { new: true });
            console.log("Unliked");
            console.log(updateComment.likes);
            return res.status(200).json(new apiResponse(200, {}, "Toggled like off comment"));
        } catch (error) {
            throw new apiError(401, "Failed deleting like");
        }
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId)
        throw new apiError(400, "Tweet id is missing")
    const tweet = await Tweet.findById(new mongoose.Types.ObjectId(tweetId))
    if (!tweet)
        throw new apiError(404, "Tweet not found")
    const like = await Like.aggregate([
        {
            $match: {
                "tweet": tweet?._id,
                "likedBy": req.user._id
            }
        }
    ])
    console.log(like);

    if (like.length === 0) {
        try {
            const createdLike = await Like.create({
                tweet: tweet._id,
                likedBy: req.user._id
            })
            console.log(`Liked....Created Like: \n${createdLike}`);
            const updateTweet = await Tweet.findByIdAndUpdate(tweet._id, { $inc: { likes: 1 } }, { new: true });
            console.log(updateTweet.likes);
            return res.status(200).json(new apiResponse(200, createdLike, "Toggled like on tweet"))
        } catch (error) {
            throw new apiError(402, "Failed creating like")
        }
    }
    else {
        try {
            const result = await Like.findByIdAndDelete(like[0]._id)
            console.log("Unliked");
            const updateTweet = await Tweet.findByIdAndUpdate(tweet._id, { $inc: { likes: -1 } }, { new: true });
            console.log(updateTweet.likes);
            return res.status(200).json(new apiResponse(200, {}, "Toggled like off tweet"))
        } catch (error) {
            throw new apiResponse(401, "Failed deleting like", error.message)
        }
    }
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const username = req.user.username
    console.log(username);
    try {
        const videoLikes = await Like.find({
            "likedBy": req.user._id,
            "video": { $exists: true }
        }).populate('video'); 
        const likedVideos = videoLikes.map(like => like.video);
        console.log(likedVideos);
        return res.status(200).json(
            new apiResponse(200, likedVideos, "Liked videos fetched successfully")
        );
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