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
///Utility controllers :>
//Comment
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js";


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
router.route("/current-user").post(getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateUserDetails);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory)
router.route("/add-comment").post(verifyJWT, addComment);
router.route("/get-comment/c/:videoId").get(verifyJWT, getVideoComments);
router.route("/update-comment/c/:commentId").post(verifyJWT, updateComment);
router.route("/delete-comment/c/:commentId").get(verifyJWT, deleteComment);


// Avatar and cover image routes
router.route("/update-avatar").post(
    upload.single("avatar"), verifyJWT,
    updateUserAvatar
);

router.route("/update-cover-image").post(upload.single("coverImage"), verifyJWT, updateUserCoverImage);

export default router;
