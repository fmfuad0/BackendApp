import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

// Fetch comments for a specific video with pagination
const getVideoComments = asyncHandler(async (req, res, next) => {   
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError(400, "Video not found. Missing ID");
    }

    const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
    if (!video) {
        throw new apiError(400, "Video not found.");
    }

    // Pagination logic
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    try {
        // Aggregation to fetch video comments
        const videoComments = await Video.aggregate([
            {
                $match: { "_id": video._id }
            },
            {
                $lookup: {
                    from: "comments", // Reference to the "comments" collection
                    localField: "_id", // Local field in Video model
                    foreignField: "video", // Foreign field in Comment model
                    as: "videoComments"
                }
            },
            {
                $project:{
                    _id:0,
                    videoComments :1,
                }
            },
            { $skip: skip }, // Pagination
            { $limit: limit } // Pagination limit
        ]);
        // Send response with video comments        
        return res.status(200).json(
            new apiResponse(200, videoComments[0], "Video comments fetched successfully")
        );
    } catch (error) {
        throw new apiError(400, "Could not fetch video comments");
    }
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res, next) => {
    const {content} = req.body;
    const {videoId} = req.params;
    console.log("add comment: ", content, videoId, req.user._id);
    
    if (!content || !videoId) {
        throw new apiError(400, "Content or videoId is missing");
    }
    
    try {
        const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
        if (!video) {
            throw new apiError(404, "Video not found");
        }
        const createdComment = await Comment.create({
            content: content,
            video: video._id,
            owner: req.user._id // Assuming `user_id` is added via authentication middleware
        });
        // console.log(createdComment);
        await Video.findByIdAndUpdate(video._id, { $inc: { comments: 1 } }, {new:true});
        console.log(video.comments);
        return res
        .status(200)
        .json(
            new apiResponse(200, createdComment, "Comment created successfully")
        );
    } catch (error) {
        throw new apiError(40, "Failed to create comment");
    }
});

// Update an existing comment
const updateComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const { newContent } = req.body;

    if (!commentId || !newContent) {
        return next(new apiError(400, "Comment ID or new content is missing"));
    }

    try {
        const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId));
        if (!comment) {
            return next(new apiError(404, "Comment not found"));
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            comment._id,
            { $set: { content: newContent } },
            { new: true }
        );

        return res.status(200).json(
            new apiResponse(200, updatedComment, "Comment updated successfully")
        );
    } catch (error) {
        return next(new apiError(400, "Could not update comment"));
    }
});

// Delete an existing comment
const deleteComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;

    if (!commentId) {
        return next(new apiError(400, "Comment ID is missing"));
    }
    const cc = await Comment.findById(new mongoose.Types.ObjectId(commentId));
    console.log(cc.video);
    try {
        const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId));
        if (!comment) {
            return next(new apiError(404, "Comment not found"));
        }

        const deletedComment = await Comment.findByIdAndDelete(comment._id);
        await Video.findByIdAndUpdate(cc.video, { $inc: { comments: -1 } });
        return res.status(200).json(
            new apiResponse(200, deletedComment, "Comment deleted successfully")
        );
    } catch (error) {
        return next(new apiError(400, "Could not delete comment"));
    }
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
