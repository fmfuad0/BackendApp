import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

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
    console.log(password);

    // Validate fields
    if (!fullName || !email || !username || !password) {
        throw new apiError("Provide all information correctly");
    }
    console.log(req.body);
    // Check if user with email or username already exists
    if (await User.findOne({ $or: [{ username }, { email }] })) {
        throw new apiError(409, `User already existsz`)
    }
    // Handle avatar and cover image files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) throw new apiError(400, "Avatar is required");
    if (!coverImageLocalPath) throw new apiError(400, "Cover image is required");

    // Upload to Cloudinary
    const avatarDbResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageDbResponse = await uploadOnCloudinary(coverImageLocalPath);

    // Ensure Cloudinary upload success
    if (!avatarDbResponse?.url) throw new apiError(400, "Avatar upload failed");
    if (!coverImageDbResponse?.url) throw new apiError(400, "Cover image upload failed");

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
});

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
        $set: { refreshToken: undefined }
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
            new apiResponse(200, {}, "User logged out successfully.")
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

export { registerUser, loginUser, logoutUser, refreshAccessToken }
