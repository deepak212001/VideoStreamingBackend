import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { Tweet } from "../models/tweet.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const isLiked = await Like.findOne(
        {
            likedBy: req.user?._id,
            video: videoId
        }
    )

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked?._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { Liked: false }, "Video like removed successfully"))
    }

    const likeVideo = await Like.create(
        {
            likedBy: req.user?._id,
            video: videoId
        }
    )

    if (!likeVideo) {
        throw new ApiError(400, "Like document creation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Liked: true }, "Video Like successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id;
    console.log(req.params)
    // console.log(tweetId)
    console.log(userId)
    // Validate tweet ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Tweet.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "comment not found");
    }

    const isLiked = await Like.findOne(
        {
            likedBy: userId,
            comment: commentId
        }
    )

    if (isLiked) {
        await Like.findByIdAndUpdate(isLiked?._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { Liked: false }, "comment Like removed successfully"))
    }

    const likeDocument = await Like.create(
        {
            likedBy: userId,
            comment: commentId
        }
    )

    if (!likeDocument) {
        throw new ApiError(400, "Like document creation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Liked: true }, "comment liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    const userId = req.user?._id;
    console.log(req.params)
    console.log(tweetId)
    console.log(userId)
    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Find the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if user already liked the tweet
    const isLiked = await Like.findOne(
        {
            likedBy: userId,
            tweet: tweetId
        }
    )

    if (isLiked) {
        await Like.findByIdAndUpdate(isLiked?._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { Liked: false }, "Tweet Like removed successfully"))
    }

    const likeDocument = await Like.create(
        {
            likedBy: req.userId,
            tweet: tweetId
        }
    )

    if (!likeDocument) {
        throw new ApiError(400, "Like document creation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { Liked: true }, "Tweet liked successfully"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Find the user and get liked videos
    const user = await User.findById(userId).select("likedVideos");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Fetch all liked videos from Video collection
    const likedVideos = await Video.find({ _id: { $in: user.likedVideos } });

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos retrieved successfully"));

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}