import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const userId = req.user._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }
    if (channelId === userId) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }
    const isSubscribed = await Subscription.exists({
        subscriber: userId,
        channel: channelId
    })
    if (isSubscribed) {
        // Unsubscribe
        const removeSubcriber = await Subscription.deleteOne({ subscriber: userId, channel: channelId })
        if (removeSubcriber.deletedCount === 0) {
            throw new ApiError(404, "Subscription not found")
        }
        return res.status(200).json(new ApiResponse("Unsubscribed successfully"))
    } else {
        // Subscribe
        const subscription = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })
        await subscription.save()
        return res.status(201).json(new ApiResponse(201, subscription, "Subscribed successfully"))
    }

    throw new ApiError(500, "Internal server error")
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(404, "channel does not exist");
    }

    const channel = await User.findById(channelId);
    console.log("Channel found:", channel); // Debug log

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.find({ channel: channelId }).populate(
        "subscriber",
        "name email"
    );

    if (!subscribers.length) {
        throw new ApiError(404, "No subscribers found for this channel");
    }

    // Return the list of subscribers
    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(404, "subscriber does not exist");
    }
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId,
    }).populate("channel", "name email");

    if (!subscribedChannels.length) {
        throw new ApiError(404, "No subscribed channels found for this user");
    }

    // Return the list of subscribed channels
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels fetched successfully"
            )
        );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}