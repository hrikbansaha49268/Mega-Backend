import dotenv from "dotenv";
import dbConnection from "./db/connection.js";
import { app } from "./app.js";

dotenv.config({ path: './env' });

dbConnection().then(() => {
    app.listen(
        process.env.PORT || 8000,
        () => console.log(`Server is running on http://localhost:${process.env.PORT}/`));
}).catch(
    e => app.on("error", () => new Error(e))
);