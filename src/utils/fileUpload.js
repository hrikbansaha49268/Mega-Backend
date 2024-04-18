import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        } else {
            const uploadResponse = await cloudinary.uploader.upload(
                localFilePath,
                { resource_type: "auto" }
            );
            fs.unlinkSync(localFilePath);
            return uploadResponse.url;
        };
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("File was not Uploaded");
        return null;
    };
};

const deleteImageOnCloudinary = async imageUrlinDb => {
    try {
        if (!localFilePath) {
            return null;
        } else {
            const deleteResponse = await cloudinary.uploader.destroy(
                imageUrlinDb,
                { resource_type: "image", invalidate: true }
            );
            return deleteResponse;
        }
    } catch (error) {
        console.log("File was not Uploaded");
        return null;
    };
};

export { uploadOnCloudinary, deleteImageOnCloudinary };