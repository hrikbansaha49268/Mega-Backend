import { upload } from "./middlewares/multer.middleware";

export const UniformResourceLocator = "api/v1";

export const uploadOptions = upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },

]);