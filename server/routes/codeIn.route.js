import express from 'express'
import CodeInCtrl from '../controllers/codeIn.controller.js'
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

//storage for files
const tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/temp');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        const uniqueName = `${uuidv4()}-${base}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: tempStorage });

//Get Posts based on multiple Id's
router.route('/posts/batch')
    .post(CodeInCtrl.apiGetMultiplePosts)
router.route('/posts/tailored')
    .post(CodeInCtrl.apiGetTailoredPosts)
//See and Edit Posts
router.route('/posts/:id')
    .get(CodeInCtrl.apiGetPost)
    .put(CodeInCtrl.apiUpdatePost)
    .delete(CodeInCtrl.apiDeletePost)
//Create new Post
router.route('/create')
    .post(CodeInCtrl.apiCreatePost)
router.route('/temp-upload')
    .post(upload.single('file'), CodeInCtrl.handleUpload)
    .delete(CodeInCtrl.handleFileDelete);
//for profile edits rather than post edits
router.route('/final-upload')
    .post(CodeInCtrl.handleFinalUpload)
//Get User Posts
router.route('/user/:name')
    .get(CodeInCtrl.apiGetUserPosts)
//Get all public posts
router.route('/posts')
    .get(CodeInCtrl.apiGetPublicPosts)
//Liking a post
router.route('/socials/like/:postId')
    .put(CodeInCtrl.apiLikePost)
//unliking a post
//Liking a post
router.route('/socials/unlike/:postId')
    .put(CodeInCtrl.apiUnlikePost)

export default router