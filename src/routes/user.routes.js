import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";

const appRouter = Router();

appRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

appRouter.route("/login").post(loginUser);

appRouter.route("/logout").post(verifyJWT, logoutUser);

appRouter.route("/refresh-token").post(refreshAccessToken);

export default appRouter;