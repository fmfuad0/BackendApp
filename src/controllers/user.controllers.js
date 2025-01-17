import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import fs from "fs"

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        user.accessToken = accessToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {

        throw new apiError("something went wrong")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;

    // Validate fields
    if (!fullName || !email || !username || !password) {
        throw new apiError("Provide all information correctly");
    }
    console.log(req.body);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(avatarLocalPath);

    // Check if user with email or username already exists
    if (await User.findOne({ $or: [{ username }, { email }] })) {
        fs.unlink(avatarLocalPath, (err) => {
            if (err) {
                console.error(`Error removing file: ${err}`);
            }
            else
                console.log(`File has been successfully removed.`);
        });
        fs.unlink(coverImageLocalPath, (err) => {
            if (err) {
                console.error(`Error removing file: ${err}`);
            }
            else
                console.log(`File has been successfully removed.`);
        });

        throw new apiError(409, `User already exists`)
    }
    // Handle avatar and cover image files
    console.log(req.files);


    if (!coverImageLocalPath) throw new apiError(402, "Cover image is required");
    if (!avatarLocalPath) throw new apiError(401, "Avatar is required");

    // Upload to Cloudinary
    const avatarDbResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageDbResponse = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatarDbResponse);
    // Ensure Cloudinary upload success
    if (!avatarDbResponse?.url) throw new apiError(403, "Avatar upload failed");
    if (!coverImageDbResponse?.url) throw new apiError(404, "Cover image upload failed");

    // Hash password
    const salt = bcrypt.genSaltSync(parseInt(process.env.bcryptSaltRounds));
    const hash = bcrypt.hashSync(password, salt);
    let newUser;
    // Create new user in database
    try {
        newUser = await User.create({
            fullName,
            avatar: avatarDbResponse?.url,
            coverImage: coverImageDbResponse?.url,
            email,
            password: hash,
            username: username.toLowerCase(),
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            const duplicateField = error.keyValue?.username ? "username" : "email";
            throw new apiError(409, `User with this ${duplicateField} already exists`);
        }
        throw error; // Re-throw other errors
    }

    // Fetch created user without password or refreshToken
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering user");
    }
    // Return success response
    else {
        console.log("User registered successfully");
        return res.json(new apiResponse(200, createdUser, "User registered successfully"));
    }
})

const loginUser = asyncHandler(async (req, res) => {
    ///req->body ->data
    ///username or email
    ///find the user
    ///validate user
    ///access and refresh token
    ///send cookies

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 * 1000
    };

    const { email, username, password } = req.body;
    
    if (!email && !username) {
        throw new apiError("Username or email is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new apiError("User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new apiError("Password incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    // console.log(`${accessToken}\n\n${refreshToken}`);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(
            200,
            {
                user: loggedInUser,
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            "User logged in successfully"
        ));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }
    },
        {
            new: true
        })
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(200, "Logged Out", "User logged out successfully.")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken)
        throw new apiError(401, "Unauthorized request")

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.refreshTokenSecret)

        const user = await User.findById(decodedToken?._id)
        if (!user)
            throw new apiError(401, "Invalid refresh token")
        if (incomingRefreshToken !== user?.refreshToken)
            throw new apiError(401, "Refresh token is expired or used")

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user?._id)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body
    // console.log("log: ", oldPassword, newPassword, confirmPassword);
    
    if (!oldPassword || !newPassword || !confirmPassword)
        throw new apiError(400, "All fields are required")
    if (newPassword !== confirmPassword)
        throw new apiError(400, "Passwords do not match")
    console.log(req.user);

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    console.log(isPasswordCorrect);
    if (!isPasswordCorrect)
        throw new apiError(400, "Wrong password")
    const salt = bcrypt.genSaltSync(parseInt(process.env.bcryptSaltRounds));
    const hash = bcrypt.hashSync(newPassword, salt);
    user.password = hash
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(
        new apiResponse(
            200,
            {},
            "Password changed successufully."
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetched successfully")
})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { newFullName, newEmail } = req.body
    console.log(req.body);
    console.log(newEmail);

    if (!newFullName || !newEmail)
        throw new apiError(40, "All fields are required.")

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: newFullName,
                email: newEmail
            }
        },
        { new: true }
    ).select("-password")
    console.log("Updated");
    return res
        .status(200)
        .json(
            await User.findById(req.user?._id).select("-password")
        )
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const newAvatarLocalPath = req.file?.path
    console.log(newAvatarLocalPath);
    if (!newAvatarLocalPath)
        throw new apiError(40, "Avatar file is required")

    const newAvatar = await uploadOnCloudinary(newAvatarLocalPath)

    if (!newAvatar.url)
        throw new apiError(400, "Error while uploading avatar")
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            avatar: newAvatar.url
        },
        { new: true }
    )
    if (!user)
        throw new apiError(400, "Error changing avatar url")
    return res
        .status(200)
        .json(
            new apiResponse(200, user, "User avatar updated successfully")
        )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const newCoverImageLocalPath = req.file?.path
    if (!newCoverImageLocalPath)
        throw new apiError(400, "Cover image file is required")
    const newCoverImage = await uploadOnCloudinary(newCoverImageLocalPath)

    if (!newCoverImage.url)
        throw new apiError(400, "Error while uploading cover image")
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            coverImage: newCoverImage.url
        },
        { new: true }
    )
    if (!user)
        throw new apiError(400, "Error changing cover image url")
    return res
        .status(200)
        .json(
            new apiResponse(200, user, "User cover image updated successfully")
        )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
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

    if (!channel || channel?.length === 0) {
        throw new apiError(404, "Channel not found");
    }

    return res.status(200).json({
        status: "successfully fetched user channel",
        data: channel[0] // Return the first result as channel
    });
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
                
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            },
                        }
                    }
                ]
            }
        }
    ])
    return res
    .status(200)
    .json(
        new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
