import mongoose, { isValidObjectId, aggregate } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content)
        throw new apiError(400, "Tweet content required")

    try {
        const createdTweet = await Tweet.create({
            content: content,
            owner: req.user._id
        })
        return res
        .status(200)
        .json(
            new apiResponse(200, createdTweet, "Tweet created")
        )
    } catch (error) {
        new apiError(400, "Failed to create tweet")
    }

})

const getUserTweets = asyncHandler(async (req, res) => {

    try {
        const userTweets = await User.aggregate([
            {
                $match:{
                    _id: req.user?._id
                }
            },
            {
                $lookup : {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "owner",
                    as:"userTweets"
                }
            }
        ])
        return res
        .status(200)
        .json(
            new apiResponse(200, userTweets[0], "Tweets fetched")
        )
    } catch (error) {
        throw new apiError(400, "Tweet fetch failed")
    }
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {updatedContent} = req.body

    try {
        const updatedTweet = await Tweet.findByIdAndUpdate(
            new mongoose.Types.ObjectId(tweetId),
            {
                content: updatedContent
            },
            {new:true}
        )
        return res
        .status(200)
        .json(
            new apiResponse(200, {updatedTweet}, "Tweet updated...")
        )
    } catch (error) {
        throw new apiError(400,  "Could not update tweet")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    try {
        await Tweet.findByIdAndDelete(new mongoose.Types.ObjectId(tweetId))
        return res
        .status(200)
        .json(
            new apiResponse(200, {}, "Tweet deleted...")
        )
    } catch (error) {
        throw new apiError(400,  "Could not delete tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
