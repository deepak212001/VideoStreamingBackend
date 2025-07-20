import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
// fs means file system helps to read write move
// fs is a core module of node.js that allows you to work with the file system on your computer


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// it's helps to upload files



const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploded successfull
        // console.log("File is upload on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally saved temporary file as the upload opertion got failed
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}


const deleteOnCloudinary = async (publicId) => {
    try {
        if (!publicId) return null

        //delete the file on cloudinary

        const response = await cloudinary.uploader.destroy(publicId)
        //file has been uploded successfull
        // console.log("File is upload on cloudinary", response.url)
        return response;
    } catch (error) {
        return null;
    }
}

export { uploadOnCloudinary, deleteOnCloudinary }




// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); }
// )
