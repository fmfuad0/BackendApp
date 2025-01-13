import { Router } from "express";
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
} from "../controllers/user.controllers.js";
import { getUserChannelProfile } from "../models/subscription.models.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// Register route
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), 
    registerUser
);

// Login route
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-access-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/get-current-user").post(getCurrentUser);
router.route("/update-user-details").post(verifyJWT, updateUserDetails);

// Avatar and cover image routes
router.route("/update-user-avatar").post(
    upload.single("avatar"),verifyJWT,
    updateUserAvatar
);

router.route("/update-user-cover-image").post(upload.single("coverImage"), verifyJWT, updateUserCoverImage);
router.route("/subscribe").post(getUserChannelProfile);

export default router;
