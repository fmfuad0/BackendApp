import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
const registerUser = asyncHandler( async (req, res)=> {
    //user details
    //validations
    //check if already exists
    //check images and avatar...avatar must
    //upload to cloudinary and check if correctly uploaded
    //creat user object, create entry in database
    const {username, fullName, email, password} = req.body
    console.log((email+"\n"+fullName));

    if([fullName, email, username, password].some((field)=>field?.trim()===""))
        throw new apiError(400, "All fields are required");
    if(User.findOne({$or:[{username}, {email}]}))
        throw new apiError(409, "User with email or username already eists")
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if(!avatarLocalPath)
        throw new apiError(400, "Avatar is required")
    const avatarDbResponse=await uploadOnCloudinary(avatarLocalPath)
    const coverImageDbResponse=await uploadOnCloudinary(coverImageLocalPath)
    if(!avatarDbResponse)
        throw new apiError(400, "Avatar upload failed")
    ////creat new user
    const newUser = await User.create({
        fullName, 
        avatar:avatarDbResponse?.url,coverImage:coverImageDbResponse?.url,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

    if(!createdUser)
        throw new apiError(500, "something went wrong while registering user")

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered succesfully")
    )
})



export {
    registerUser,
}