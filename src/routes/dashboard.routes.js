import { Router } from "express";
import { getChannelStats } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getChannelVideos } from "../controllers/user.controllers.js";


export const dashboardRouter = Router()

dashboardRouter.route("/").get(verifyJWT, getChannelStats)
dashboardRouter.route("/videos").get(verifyJWT, getChannelVideos)