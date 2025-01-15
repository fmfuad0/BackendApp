import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new apiError("Video not found. Missing ID");
    }

    // Convert videoId to ObjectId
    const vvid = new mongoose.Types.ObjectId(videoId);

    // Fetch the video by its ID
    const video = await Video.findById(vvid);
    if (!video) {
        throw new apiError("Video not found.");
    }

    // Optional pagination
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Aggregation to get comments for the video
    const videoComments = await Video.aggregate([
        {
            $match: {
                _id: vvid
            }
        },
        {
            $lookup: {
                from: "comments", // Collection name
                localField: "_id", // Field in Video model
                foreignField: "video", // Field in Comment model (assumed)
                as: "videoComments"
            }
        },
        // {
        //     $unwind: "$videoComments" // Optional, to flatten comments if needed
        // },
        {
            $skip: skip // For pagination
        },
        {
            $limit: limit // For pagination
        }
    ]);

    return res.status(200).json(
        new apiResponse(200, videoComments, "Video comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content, videoId } = req.body
    console.log(content + videoId);

    if (!content)
        throw new apiError(400, "Content is missing")

    const createdComment = await Comment.create({
        content: content,
        video: await Video.findById(new mongoose.Types.ObjectId(videoId)),
        owener: req.user
    })

    if (!createdComment)
        throw new apiError(400, "Something went wrong while creating comment")
    findComment(createdComment._id)
    return res
        .status(200)
        .json(
            new apiResponse(200, createdComment, "Comment created successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment    
    const {commentId} = req.params
    const {newContent} = req.body
    if (!commentId)
        throw new apiError(400, "Comment id is missing")

    const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId))

    if (!comment)
        throw new apiError(404, "Comment not found")
    const updatedComment = await Comment.findByIdAndUpdate(
        comment?._id,
        {
            $set: {
                content: newContent
            }
        },
        { new: true }
    )    
    return res
    .status(200)
    .json(
        new apiResponse(200, updatedComment, "Comment Updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!commentId)
        throw new apiError(400, "Comment id is missing")
    const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId))
    if (!comment)
        throw new apiError(404, "Comment not found")
    const updatedComment = await Comment.findByIdAndDelete(
        comment?._id,
    )
    console.log(updatedComment);
    console.log("Comment deleted");
    
    return res
    .status(200)
    .json(
        new apiResponse(200, updatedComment, "Comment deleted successfully")
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
