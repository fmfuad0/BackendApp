import mongoose, { Aggregate as aggregate } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.models.js"
import { apiError, ApiError } from "../utils/apiError.js"
import { apiResponse, ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    const channelInfo = await getUserChannelProfile(new mongoose.Types.ObjectId(channelId))
    if (!channelInfo)
        throw new apiError(404, "Channel not found")
    if (channelInfo.isSubscribed) {
        try {
            await Subscription.findOneAndDelete(
                {
                    subscriber: req.user?._id,
                    channel: channelInfo._id
                }
            )
            return res
                .status(200)
                .json(
                    new apiResponse(200, {}, "Unsubscribed")
                )
        } catch (error) {
            throw new apiError(400, {}, "Unsubscribe operation failed")
        }
    }
    else {
        const subscription = await Subscription.create({
            subscriber: req.user,
            channel: channelInfo._id
        }
        )
        if (!subscription)
            throw new apiError(400, "Could not subscribe")
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "Subscribed")
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId)
        throw new apiError(400, "Invalid channelId")

    try {
        const userChannelsubscribers = await User.aggregate([
            {
                $match: {
                    _id: req.user._id
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "userChannelSubscribers"
                }
            }
        ])
        return res
            .status(200)
            .json(
                new apiResponse(200, userChannelsubscribers[0], "Subscriber fetched")
            )
    } catch (error) {
        throw new apiError(400, "Could not fetch data")
    }

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId)
        throw new apiError(400, "Invalid subscriberId")

    try {
        const subscribedChannels = await User.aggregate([
            {
                $match: {
                    _id: req.user._id
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedChannel"
                }
            }
        ])
        return res
            .status(200)
            .json(
                new apiResponse(200, subscribedChannels[0], "Subscribed channels fetched")
            )
    } catch (error) {
        throw new apiError(400, "Could not fetch data")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}