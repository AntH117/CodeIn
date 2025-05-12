import CodeInDAO from '../dao/CodeInDao.js'

export default class CodeInController {

    static async apiCreatePost(req, res, next) {
        try {
            //Body of the request contains these pieces of info
            const postId = req.body.postId
            const post = req.body.post
            const user = req.body.user

            const postResponse = await CodeInDao.addPost(
                postId,
                post,
                user
            )
            res.json({status: success})
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetPost(req, res, next) {
        try {
            let id = req.params.id || {}
            let post = await CodeInDao.getPost(id)
            if (!post) {
                res.status(404).json({error: "Not Found"})
                return
            }
            res.json(review)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }

    static async apiUpdatePost (req, res, next) {
        try {
            const postId = req.params.id
            const post = req.body.post
            const user = req.body.user

            const postResponse = await CodeInDao.updatePost (
                postId,
                post,
                user
            )

            var { error } = postResponse
            if (error) {
                res.status(400).json({error})
            }
            if (postResponse.modifiedCount === 0) {
                throw new Error (
                    "unable to update review"
                )   
            }

            res.json({status: 'success'})
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    static async apiDeletePost (req, res, next) {
        try {
            const postId = req.params.id
            const postResponse = await CodeInDao.deletePost(postId)
            res.json({ status: 'success'})
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetUserPosts (req, res, next) {
        try {
            let id = req.params.id || {}
            let posts = await CodeInDao.getPostsByUserId(id)
            if (!posts) {
                res.status(404).json({error: 'Not Found'})
                return
            }
            res.json(posts)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }
}