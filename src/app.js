import express from "express";
import cors from "cors";
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




export { app };