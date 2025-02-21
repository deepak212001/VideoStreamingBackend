import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { userId } = req.params;

    // Validate channel ID
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const videos = await Video.find({ owner: userId });

    // Calculate total views and likes using JavaScript reduce()
    let totalViews = 0;
    let totalLikes = 0;
    videos.forEach(video => {
        totalViews += video.views;
        totalLikes += video.likes;
    });

    // Get total videos count
    const totalVideos = videos.length;

    // Get total subscribers count
    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    // Prepare response
    return res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalViews,
        totalLikes,
        totalSubscribers
    }, "Channel stats retrieved successfully"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    try {
        let { userId } = req.params;
        console.log(userId)
        console.log(req.params)
        const video = await Video.find({ owner: userId });
        res.status(201).json({ sucess: "true", "video": video });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
})

export {
    getChannelStats,
    getChannelVideos
}