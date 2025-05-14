import express from 'express'
import CodeInCtrl from './codeIn.controller.js'

const router = express.Router();

//See and Edit Posts
router.route('/posts/:id')
    .get(CodeInCtrl.apiGetPost)
    .put(CodeInCtrl.apiUpdatePost)
    .delete(CodeInCtrl.apiDeletePost)
//Create new Post
router.route('/posts').post(CodeInCtrl.apiCreatePost)
//Get User Posts
router.route('/user/:name')
    .get(CodeInCtrl.apiGetUserPosts)
export default router