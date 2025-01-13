import { User } from "./user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.body || req.params;

    if (!username?.trim()) {
        throw new apiError(400, "Username is missing");
    }

    // Perform aggregation to get the user profile with subscriber and subscribed count
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers" // Correct reference to subscribers field
                },
                subscribedToCount: {
                    $size: "$subscribedTo" // Correct reference to subscribedTo field
                },
                // Check if the current user is subscribed to the channel
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"] // Use `subscriber` from the `subscriptions` collection
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                isSubscribed: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribedToCount: 1
            }
        }
    ]);

    if (!channel || channel.length === 0) {
        throw new apiError(404, "Channel not found");
    }

    return res.status(200).json({
        status: "successfully fetched user channel",
        data: channel[0] // Return the first result as channel
    });
});

export { getUserChannelProfile };
