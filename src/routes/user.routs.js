import { Router } from "express";
///Middlewares
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
///User controlers
import {
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
} from "../controllers/user.controllers.js";

const userRouter = Router();
// Register route
userRouter.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
// Login route
userRouter.route("/login").post(loginUser);

/// SECURED ROUTES

//USER ROUTES
userRouter.route("/logout").get(verifyJWT, logoutUser);
userRouter.route("/refresh-access-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changePassword);
userRouter.route("/current-user").post(getCurrentUser);
userRouter.route("/update-account").patch(verifyJWT, updateUserDetails);
userRouter.route("/update-avatar").post(
    upload.single("avatar"), verifyJWT,
    updateUserAvatar
);
userRouter.route("/update-cover-image").post(upload.single("coverImage"), verifyJWT, updateUserCoverImage);
userRouter.route("/c/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/history").get(verifyJWT, getWatchHistory)

export default userRouter;
