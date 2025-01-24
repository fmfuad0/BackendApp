import { Router } from "express";
import  {healthCheck}  from "../controllers/healthcheck.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
const healthCheckRouter = Router();



healthCheckRouter.route("").get(verifyJWT, healthCheck)



export default healthCheckRouter
