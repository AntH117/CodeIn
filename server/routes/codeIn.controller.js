import CodeInDAO from '../dao/CodeInDao.js'

export default class CodeInController {

    static async apiCreatePost(req, res, next) {
        try {
            //Body of the request contains these pieces of info
            const postContent = req.body.postContent
            const user = req.body.user

            const postResponse = await CodeInDAO.createPost(
                postContent,
                user
            )
            res.json({ status: "success" })
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetPost(req, res, next) {
        try {
            let id = req.params.id || {}
            let post = await CodeInDAO.getPost(id)
            if (!post) {
                res.status(404).json({error: "Not Found"})
                return
            }
            res.json(post)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }

    static async apiUpdatePost (req, res, next) {
        try {
            const postContent = req.body.postContent
            const user = req.body.user
            const postId = req.params.id       

            const postResponse = await CodeInDAO.updatePost (
                postId,
                postContent,
                user
            )

            var { error } = postResponse
            if (error) {
                res.status(400).json({error})
            }
            if (postResponse.modifiedCount === 0) {
                throw new Error (
                    "unable to update post"
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
            const postResponse = await CodeInDAO.deletePost(postId)
            res.json({ status: 'success'})
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    static async apiGetUserPosts (req, res, next) {
        try {
            let user = req.params.name || {}
            let posts = await CodeInDAO.getPostsByUserId(user)
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