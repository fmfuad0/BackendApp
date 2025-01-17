import { Router } from "express";
import  {health}  from "../controllers/healthcheck.controllers.js";
const healthCheckRouter = Router();

healthCheckRouter.route("/").get(health)

export default healthCheckRouter
