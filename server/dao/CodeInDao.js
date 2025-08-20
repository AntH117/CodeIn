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
            const result = await posts.insertOne(postDoc);
            return { insertedId: result.insertedId };
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

    static async likePost({postId, userId}) {
        try {
            const post = await posts.findOne({ _id: new ObjectId(postId) });
            if (!post) return { error: "Post not found" };

            if (!post.likedBy) {
                post.likedBy = [];
            }

            const alreadyLiked = post.likedBy.includes(userId);

            let update;
            let operation;

            if (alreadyLiked) {
                update  = await posts.updateOne(
                    { _id: new ObjectId(postId) },
                    { 
                    $inc: { likeCount: -1 },
                    $pull: { likedBy: userId }
                    }
                );
                operation = 'unliked'
            } else {
                update  = await posts.updateOne(
                    { _id: new ObjectId(postId) },
                    { 
                    $inc: { likeCount: 1 },
                    $addToSet: { likedBy: userId }
                    }
                );
                operation = 'liked'
            }

            return {update, operation}
        } catch (e) {
            console.error(`Unable to like/unlike post: ${e}`)
            return {error: e}
        }
    }
    // static async unlikePost(postId) {
    //     try {
    //         const postResponse = await posts.updateOne(
    //             { _id: new ObjectId(postId) },
    //             { $inc: { likeCount: -1 } }
    //         );          
    //         return postResponse
    //     } catch (e) {
    //         console.error(`Unable to like post: ${e}`)
    //         return {error: e}
    //     }
    // }

    static async getMultiplePosts(postIds) {
            const objectIds = postIds.map(id => new ObjectId(id));
            const postResponse = await posts.find({ _id: { $in: objectIds } }).toArray();
            return postResponse;
    }

    static async getTailoredPosts(followIds) {
       //Get posts from followed users
        const followedPosts = await posts.find({
            user: { $in: followIds }
        }).sort({ createdAt: -1 }).toArray();
    
        //Get public posts not from followed users
        const publicPosts = await posts.find({
            "postContent.visibility": "Public",
            user: { $nin: followIds } // Avoid duplicates
        }).sort({ createdAt: -1 }).toArray();
    
        //Merge followed posts first, then public
        const combinedPosts = [...followedPosts, ...publicPosts];
    
        return combinedPosts;
    }   
    static async getTags(tagName) {
        try {
          const pipeline = [
            { $unwind: "$postContent.tags" }, // flatten tags arrays
            { $match: { "postContent.tags": { $regex: tagName, $options: "i" } } },
            {
              $group: {
                _id: "$postContent.tags", // group by tag
                count: { $sum: 1 }  
              }
            },
            { $sort: { count: -1 } }, // sort by count (desc)
            { $limit: 2 }             // top 2 results
          ];
      
          const results = await posts.aggregate(pipeline).toArray();
      
          // format nicely
          return results.map(r => ({ tag: r._id, count: r.count }));
        } catch (error) {
          console.error(`Unable to get tags: ${error}`);
          return { error: error.message };
        }
      }
}