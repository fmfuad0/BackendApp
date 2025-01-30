import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


const likeRouter = Router()

likeRouter.route("/videos/c/:videoId").get(verifyJWT, toggleVideoLike)
likeRouter.route("/comments/c/:commentId").get(verifyJWT, toggleCommentLike)
likeRouter.route("/tweets/c/:tweetId").get(verifyJWT, toggleTweetLike)
likeRouter.route("/liked-videos/").get(verifyJWT, getLikedVideos)

export { likeRouter };