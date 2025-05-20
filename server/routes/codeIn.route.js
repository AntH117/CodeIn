import express from 'express'
import CodeInCtrl from './codeIn.controller.js'
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

//See and Edit Posts
router.route('/posts/:id')
    .get(CodeInCtrl.apiGetPost)
    .put(CodeInCtrl.apiUpdatePost)
    .delete(CodeInCtrl.apiDeletePost)
//Create new Post
router.route('/posts')
    .post(CodeInCtrl.apiCreatePost)
router.route('/temp-upload')
    .post(upload.single('file'), CodeInCtrl.handleUpload)
    .delete(CodeInCtrl.handleFileDelete);
//Get User Posts
router.route('/user/:name')
    .get(CodeInCtrl.apiGetUserPosts)
    
export default router