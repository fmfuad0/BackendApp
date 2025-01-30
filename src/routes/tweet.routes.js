import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";


export const tweetRouter = Router()

tweetRouter.route("/new").post(verifyJWT, createTweet)
tweetRouter.route("/my-tweets").get(verifyJWT, getUserTweets)
tweetRouter.route("/update/c/:tweetId").post(verifyJWT, updateTweet)
tweetRouter.route("/delete/c/:tweetId").post(verifyJWT, deleteTweet)