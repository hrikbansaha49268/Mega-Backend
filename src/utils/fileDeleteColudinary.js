import { User } from "../models/user.model.js";
import { ApiError } from "./errorHandler.js";
import { deleteImageOnCloudinary } from "./fileUpload.js";

const avatarFileDeleteColudinary = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(400, "User not found");
    } else {
        const deleteResponse = await deleteImageOnCloudinary(user.avatar);
        return deleteResponse;
    };
};

export default avatarFileDeleteColudinary;