import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { Like } from "../models/like.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(404, "give valid video id");
    }

    const existVideo = await Video.findById(videoId);

    if (!existVideo) {
        throw new ApiError(404, "video not avelable in database");
    }

    const pageNumber = +page;
    const limitNumber = +limit;

    if (!(pageNumber > 0 && limitNumber > 0)) {
        throw new ApiError(404, "give postive pagenumber or limitNumber");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const comment = await Comment.find({ video: videoId })
        .skip(skip)
        .limit(limitNumber);

    if (!comment) {
        throw new ApiError(500, "no comments avelable ");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, comment, "find comment successfully"));

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body
    console.log(content)
    console.log("Full Request Body:", req.body);
    console.log("Extracted Content:", content);

    console.log(videoId)
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const videos = await Video.findById(videoId)
    if (!videos) {
        throw new ApiError(400, "Video not found")
    }

    if (!content.trim()) {
        throw new ApiError(400, "No comment added")
    }

    const comment = await Comment.create(
        {
            content,
            owner: req.user?._id,
            video: videoId
        }
    )

    console.log(comment)

    if (!comment) {
        throw new ApiError(400, "error while commenting")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Commented successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const { commentId } = req.params
    const { content } = req.body

    console.log(content)
    console.log("Full Request Body:", req.body);
    console.log("Extracted Content:", content);

    console.log(commentId)


    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid CommentId")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if (!content.trim()) {
        throw new ApiError(400, "Empty comment")
    }

    if (comment?.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(400, "Only the owner of this comment can edit the comment")
    }

    let updateField = {}

    if (content.trim() && content.trim() !== comment.content.trim()) {
        updateField.content = content
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: updateField
        },
        { new: true }
    )

    if (!updatedComment) {
        throw new ApiError(400, "Comment not found and thus updation failed")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    }

    if (comment?.owner?.toString() !== req.user?._id?.toString()) {
        throw new ApiError(400, "Only the owner of this comment can delete the comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(400, "comment wasn't found and thus deletion failed")
    }

    const commentLikeDocuments = await Like.deleteMany(
        {
            comment: commentId
        }
    )
    // console.log(commentLikeDocuments)

    if (!commentLikeDocuments) {
        throw new ApiError(400, "Failed to delete like documents corresponding to the comment")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedComment: deletedComment }, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}