import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description } = req.body
    if ([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title & Description are required fields")
    }

    const videoFilePath = req.files?.videoFile[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path
    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video file & Thumbnail are required fields")
    }
    console.log('The video file path :', videoFilePath)

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    console.log('The video cloudinary data :', videoFile)
    console.log('The thumbnail cloudinary data :', thumbnail)
    
    /*
    The video cloudinary data : {
    asset_id: 'acd8f561904d225ebd00eb3398907f7e',
    public_id: 'rxy7tf3xm236j9lofmrr',
    version: 1737527902,
    version_id: 'f1bafa0689402ca175223f94cbde0296',
    signature: '0fd5c1d0a74198ab93ffe0627bcc87385352e380',
    width: 1080,
    height: 1920,
    format: 'mp4',
    resource_type: 'video',
    created_at: '2025-01-22T06:38:22Z',
    tags: [],
    pages: 0,
    bytes: 19012749,
    type: 'upload',
    etag: '4fbe29e901b5c0d1c7ea876e54fb8954',
    placeholder: false,
    url: 'http://res.cloudinary.com/deepak2199/video/upload/v1737527902/rxy7tf3xm236j9lofmrr.mp4',
    secure_url: 'https://res.cloudinary.com/deepak2199/video/upload/v1737527902/rxy7tf3xm236j9lofmrr.mp4',
    playback_url: 'https://res.cloudinary.com/deepak2199/video/upload/sp_auto/v1737527902/rxy7tf3xm236j9lofmrr.m3u8',
    asset_folder: '',
    display_name: 'rxy7tf3xm236j9lofmrr',
    audio: {
        codec: 'aac',
        bit_rate: '128052',
        frequency: 44100,
        channels: 2,
        channel_layout: 'stereo'
    },
    video: {
        pix_format: 'yuv420p',
        codec: 'h264',
        level: 30,
        profile: 'High',
        bit_rate: '5494043',
        time_base: '1/16000'
    },
    is_audio: false,
    frame_rate: 30,
    bit_rate: 5603504,
    duration: 27.144082,
    rotation: 0,
    original_filename: 'VID_500450902_125228_965',
    nb_frames: 813,
    api_key: '631457431334755'
    }



    The thumbnail cloudinary data : {
    asset_id: 'cfeba6581308097249b76b50ee751a35',
    public_id: 'oo3nrzpn2q8k1bmmqnwh',
    version: 1737527904,
    version_id: '098c48dfc38981f1abd44e1fd6f7a1fa',
    signature: '5908168ee8bc8fc7c5cc79ee932927e5571b4ad8',
    width: 1080,
    height: 1920,
    format: 'webp',
    resource_type: 'image',
    created_at: '2025-01-22T06:38:24Z',
    tags: [],
    pages: 1,
    bytes: 135762,
    type: 'upload',
    etag: 'f23a3917cef5524b85c22ec973a0b9ce',
    placeholder: false,
    url: 'http://res.cloudinary.com/deepak2199/image/upload/v1737527904/oo3nrzpn2q8k1bmmqnwh.webp',
    secure_url: 'https://res.cloudinary.com/deepak2199/image/upload/v1737527904/oo3nrzpn2q8k1bmmqnwh.webp',
    asset_folder: '',
    display_name: 'oo3nrzpn2q8k1bmmqnwh',
    original_filename: 'IMG_20240401_175207_164',
    original_extension: 'jpg',
    api_key: '631457431334755'
}

    */
    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile?.duration, // directly available from cloudinary
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        owner: req.user?._id,
        isPublished: false
    })

    const uploadedVideo = await Video.findById(video._id) // just verifying to see if the document is actually registered in DB

    if (!uploadedVideo) {
        throw new ApiError(500, "Video document creation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadedVideo, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}