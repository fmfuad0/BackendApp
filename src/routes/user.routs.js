import { Router } from "express";
import { 
    registerUser,
    loginUser, 
    ///secured
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middlewares.js"
const router = Router()
import { verifyJWT } from "../middlewares/auth.middlewares.js";

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), registerUser)
router.route("/login").post(loginUser)

///secured routes
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/get-current-user").post(getCurrentUser)
router.route("/update-user-details").post(updateUserDetails)
router.route("/update-user-avatar").post(updateUserAvatar)
router.route("/update-user-cover-image").post(updateUserCoverImage)


export default router