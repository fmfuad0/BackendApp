import { Router } from "express";
import { logoutUser, registerUser} from "../controllers/user.controllers.js"
import {upload} from "../middlewares/multer.middlewares.js"
const router = Router()
import { loginUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]), registerUser)
router.route("/login").post(loginUser)


//secured routes

router.route("/logout").get(verifyJWT, logoutUser)

export default router