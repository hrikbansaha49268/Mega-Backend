import cors from "cors";
import express from "express";
import cookiePaser from "cookie-parser";

const app = express();

app.use(cookiePaser());
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

//Routes import

/* This routes are for Users */
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);
/* This routes are for Users */

/* This route is for Healthcheck */
import healthcheckRouter from "./routes/healthcheck.routes.js"
app.use("/api/v1/healthcheck", healthcheckRouter);
/* This route is for Healthcheck */

/* This routes are for Tweets */
import tweetRouter from "./routes/tweet.routes.js"
app.use("/api/v1/tweets", tweetRouter);
/* This routes are for Tweets */

/* This routes are for Subscribing */
import subscriptionRouter from "./routes/subscription.routes.js"
app.use("/api/v1/subscriptions", subscriptionRouter);
/* This routes are for Subscribing */

/* This routes are for Video */
import videoRouter from "./routes/video.routes.js"
app.use("/api/v1/videos", videoRouter);
/* This routes are for Video */

/* This routes are for Comments */
import commentRouter from "./routes/comment.routes.js"
app.use("/api/v1/comments", commentRouter);
/* This routes are for Comments */

/* This routes are for Likes */
import likeRouter from "./routes/like.routes.js"
app.use("/api/v1/likes", likeRouter);
/* This routes are for Likes */

/* This routes are for Playlist */
import playlistRouter from "./routes/playlist.routes.js"
app.use("/api/v1/playlist", playlistRouter);
/* This routes are for Playlist */

/* This routes are for dashboard */
import dashboardRouter from "./routes/dashboard.routes.js"
app.use("/api/v1/dashboard", dashboardRouter);
/* This routes are for dashboard */


export { app };