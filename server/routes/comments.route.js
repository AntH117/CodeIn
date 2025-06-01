
import express from 'express'
import CommentsCtrl from '../controllers/comments.controller.js';


const router = express.Router();

router.route('/add')
    .post(CommentsCtrl.apiAddComment);
router.route('/post/:postId')
    .get(CommentsCtrl.apiGetCommentsByPost)
    .delete(CommentsCtrl.apiDeleteAllComments)
router.route('/:commentId')
    .delete(CommentsCtrl.apiDeleteComment);
router.route('/user/:userId')
    .get(CommentsCtrl.apiGetCommentsByUser);

export default router;