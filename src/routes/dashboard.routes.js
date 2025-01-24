import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";


export const dashboardRouter = Router()

dashboardRouter.route("/").get(verifyJWT, getChannelStats)
dashboardRouter.route("/videos").get(verifyJWT, getChannelVideos)