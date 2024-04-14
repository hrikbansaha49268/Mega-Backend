import { connect } from "mongoose";

export default async function () {
    try {
        const connectionInstance = await connect(process.env.MONGODB_URI);
        return connectionInstance.ConnectionStates.connected;
    } catch (error) {
        console.log({ status: "error", msg: error });
        process.exit(1);
    };
};