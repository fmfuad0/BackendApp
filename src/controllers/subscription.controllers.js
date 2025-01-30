import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { username } = req.params
    // TODO: toggle subscription
    const channel = await User.find({"username": username}).select("-password -refreshToken")
    if(!channel)
        throw new apiError(404, "Channel not found")
    console.log("channel: ", channel[0]);
    const subscription = await Subscription.findOne({
        "subscriber" : req.user._id,
        "channel" : channel[0]._id
    })
    console.log(subscription);
    try {
        if(!subscription){
            console.log("not found");        
            const createdSubscription = await Subscription.create({
                "subscriber" : req.user._id,
                "channel" : channel[0]._id
            })
            console.log(createdSubscription);
            return res
            .status(200)
            .json(
                new apiResponse(200, createdSubscription, "Subscribed")
            )
        }
        else{
            await Subscription.findByIdAndDelete(subscription._id)
            console.log("Unsubscribed");
            
            return res
            .status(200)
            .json(
                new apiResponse(200, {}, "Unsubscribed")
            )
        }   
    } catch (error) {
        throw new apiError(500, "Subscription toggle Operation failed")
    }
        
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
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
            },
            {
                $project:{
                    totalSubscriber:{$size:"$userChannelSubscribers"},
                    userChannelsubscribers:1
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
    try {
        const channels =await Subscription.aggregate([
            {
                $match:{
                    "subscriber" : req.user._id,
                }
            },
            {
                $project:{
                    _id:0,
                    channel: 1
                }
            }
        ])
        console.log(channels);
        
        return res
            .status(200)
            .json(
                new apiResponse(200, channels, "Subscribed channels fetched")
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