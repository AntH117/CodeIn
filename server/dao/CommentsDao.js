import mongodb from 'mongodb'
const ObjectId = mongodb.ObjectId

let comments;
let posts;

export default class CommentsDao {
    static async injectDB(conn) {
        if (comments) {
            return
        }
        try {
            comments = await conn.db('posts').collection('commentsCollection')
            posts = await conn.db('posts').collection('postsCollection');
        } catch (e) {
            console.error(`Unable to esablish collection handles: ${e}`)
        }
    }

    static async addComment(comment, postId, userId) {
        const commentDoc = {
            comment: comment,
            postId: postId,
            userId: userId,
        }
        const insertResult = await comments.insertOne(commentDoc)

        await posts.updateOne(
            { _id: new ObjectId(postId) },
            { $inc: { commentCount: 1 } }
        );

        return insertResult
    }

    static async getComments(postId) {
        return await comments.find({ postId }).sort({ timestamp: -1 }).toArray();
    }

    static async deleteComment(commentId, postId) {
        const deleteResult = await comments.deleteOne({ _id: new ObjectId(commentId) })
        await posts.updateOne(
            { _id: new ObjectId(postId) },
            { $inc: { commentCount: -1 } }
          )
        console.log("Delete Result:", deleteResult);
        return deleteResult;
      }

    static async getUserComments(userId) {
        return await comments.find({ userId }).sort({ timestamp: -1 }).toArray();
    }

    static async deleteAllComments(postId) {
        const deleteResult = await comments.deleteMany({ postId: postId })
        return deleteResult;
    }
}