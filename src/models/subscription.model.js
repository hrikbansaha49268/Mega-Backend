import { Schema, model } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: { // One who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: { // One who has been subscribed
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Subscription = model("Subscription", subscriptionSchema);