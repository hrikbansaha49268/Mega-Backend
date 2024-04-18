import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";

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

// Secured Routes

appRouter.route("/logout").post(verifyJWT, logoutUser);

appRouter.route("/refresh-token").post(refreshAccessToken);

appRouter.route("/change-pass").post(verifyJWT, changeCurrentPassword);

appRouter.route("/current-user").get(verifyJWT, getCurrentUser);

appRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);

appRouter.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

appRouter.route("/cover-image-update").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

appRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile);

appRouter.route("/watch-history").get(verifyJWT, getWatchHistory);

// Secured Routes


export default appRouter;