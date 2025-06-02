import mongodb from 'mongodb'
const ObjectId = mongodb.ObjectId

let posts;

export default class CodeInDAO {
    static async injectDB(conn) {
        if (posts) {
            return
        }
        try {
            posts = await conn.db('posts').collection('postsCollection')
        } catch (e) {
            console.error(`Unable to esablish collection handles: ${e}`)
        }
    }

    static async createPost(postContent, user) {
        try {
            const postDoc = {
                postContent: postContent,
                user: user,
                commentCount: 0,
                likeCount: 0,
                shareCount: 0,
            }
            return await posts.insertOne(postDoc)
        } catch (e) {
            console.error(`Unable to create post: ${e}`)
            return {error: e}
        }
    }

    static async getPost(postId) {
        try {
            return await posts.findOne({_id: new ObjectId(postId)})
        } catch (e) {
            console.error(`Unable to get post: ${e}`)
        }
    }

    static async updatePost(postId, postContent, user) {
        try {
            const updateResponse = await posts.updateOne(
                {_id: new ObjectId(postId)},
                {$set: {postContent: postContent, user: user}}
            )
            return updateResponse
        } catch (e) {
            console.error(`Unable to update post: ${e}`)
            return {error: e}
        }
    }

    static async deletePost(postId) {
        try {
            const deleteResponse = await posts.deleteOne({
                _id: new ObjectId(postId)
            })
            return deleteResponse
        } catch (e) {
            console.error(`Unable to delete Post: ${e}`)
            return {error: e}
        }
    }

    static async getPostsByUserId(user) {
        try {
            const cursor = await posts.find({ user: (user)})
            return cursor.toArray()
        } catch (e) {
            console.error(`Unable to get posts: ${e}`)
            return {error: e}
        }
    }

    static async getPublicPosts() {
        try {
            const cursor = await posts.find({"postContent.visibility": "Public"})
            return cursor.toArray()
        } catch (e) {
            console.error(`Unable to get posts: ${e}`)
            return {error: e}
        }
    }

    static async likePost(postId) {
        try {
            const postResponse = await posts.updateOne(
                { _id: new ObjectId(postId) },
                { $inc: { likeCount: 1 } }
            );

            return postResponse
        } catch (e) {
            console.error(`Unable to like post: ${e}`)
            return {error: e}
        }
    }
    static async unlikePost(postId) {
        try {
            const postResponse = await posts.updateOne(
                { _id: new ObjectId(postId) },
                { $inc: { likeCount: -1 } }
            );          
            return postResponse
        } catch (e) {
            console.error(`Unable to like post: ${e}`)
            return {error: e}
        }
    }
}