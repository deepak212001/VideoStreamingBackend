import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    console.log("req.body is ", req.body)
    console.log("content is ", content)
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    // const { userId } = req.user?._id
    // if (!isValidObjectId(userId)) {
    //     throw new ApiError(400, "Invalid user ID")
    // }

    // const user = await User.findById(userId)
    // if (!user) {
    //     throw new ApiError(404, "User not found")
    // }
    console.log("req.user is ", req.user)
    console.log("req.user._id is ", req.user._id)
    const tweet = await Tweet.create({
        content,
        owner: req.user._id

    })

    if (!tweet) {
        throw new ApiError(500, "Tweet not created")
    }

    const tweetUpload = await Tweet.findById(tweet._id)

    if (!tweetUpload) {
        throw new ApiError(500, "Tweet not created")
    }
    console.log("tweet is ", tweet)
    console.log("tweetUpload is ", tweetUpload)
    res.status(201).json(new ApiResponse(201, { tweet }))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const user
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    console.log("req.params is ", req.params)
    console.log("tweetId is ", tweetId)
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }


    const userId = req.user._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    console.log("req.user is ", req.user)
    console.log("req.user._id is ", req.user._id)
    console.log("userId is ", userId)
    console.log("userId is to string ", userId.toString())
    // console.log("tweet owner is ", Tweet.owner)
    // console.log("tweet owner is to string ", Tweet.owner.toString())

    const tweetowner = await Tweet.findById(tweetId)
    console.log("tweet owner is ", tweetowner)
    console.log("tweet owner is ", tweetowner.owner)
    console.log("tweet owner is ", tweetowner.owner.toString)

    if (tweetowner.owner.toString() != userId.toString()) {
        throw new ApiError(401, "You are not the owner of this tweet")
    }
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    res.status(200).json(new ApiResponse(200, { tweet }))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    console.log("req.params is ", req.params)
    console.log("tweetId is ", tweetId)
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }


    const userId = req.user._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    const tweetowner = await Tweet.findById(tweetId)
    if (tweetowner.owner.toString() != userId.toString()) {
        throw new ApiError(401, "You are not the owner of this tweet")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    res.status(200).json(new ApiResponse(200, { tweet }))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}