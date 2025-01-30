import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers.js";

const subscriptionRouter = Router();

subscriptionRouter.route("/new/c/:username").get(verifyJWT, toggleSubscription)
subscriptionRouter.route("/subscribers").get(verifyJWT, getUserChannelSubscribers)
subscriptionRouter.route("/subscribed-channels").get(verifyJWT, getSubscribedChannels)


export {subscriptionRouter}