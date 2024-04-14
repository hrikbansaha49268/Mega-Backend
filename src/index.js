import dotenv from "dotenv";
import dbConnection from "./db/connection.js";

dotenv.config({ path: './env' });

console.log(await dbConnection());