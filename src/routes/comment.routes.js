import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js";

const commentRouter = Router();

commentRouter.route("/new").post(verifyJWT, addComment)
commentRouter.route("/video/c/:videoId").get(getVideoComments)
commentRouter.route("/update/c/:commentId").post(verifyJWT, updateComment)
commentRouter.route("/delete/c/:commentId").get(verifyJWT, deleteComment)

export default commentRouter
