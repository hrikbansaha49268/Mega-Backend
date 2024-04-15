import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const appRouter = Router();

appRouter.route("/register").post(registerUser);

export default appRouter;