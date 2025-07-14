import CommentsDao from '../dao/CommentsDao.js'
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promises as fsPromises } from 'fs';

class CommentsCtrl {
    static async apiAddComment(req, res) {
        try {
            const {postId, userId, text} = req.body
            //Comment includes commment and timestamp
            const comment = {
                text,
                timestamp: new Date(),
            }
            //response includes total comment, postId and userId
            const commentResponse = await CommentsDao.addComment(
                comment,
                postId,
                userId
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }

    static async apiGetCommentsByPost(req, res) {
        try {
            const postId = req.params.postId
            const commentResponse = await CommentsDao.getComments(
                postId
            )
            res.json(commentResponse)
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }

    static async apiDeleteComment (req, res) {
        try {
            const commentId = req.params.commentId
            const {postId} = req.body
            const commentResponse = await CommentsDao.deleteComment(
                commentId,
                postId
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }

    static async apiGetCommentsByUser (req, res) {
        try {
            const userId = req.params.userId
            const commentResponse = await CommentsDao.getUserComments(
                userId
            )
            res.json(commentResponse)
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }

    static async apiDeleteAllComments (req, res) {
        try {
            const postId = req.params.postId
            const commentResponse = await CommentsDao.deleteAllComments(
                postId
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
}

export default CommentsCtrl