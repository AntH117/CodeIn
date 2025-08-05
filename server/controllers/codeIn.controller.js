import CodeInDAO from '../dao/CodeInDao.js'
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promises as fsPromises } from 'fs';
import cloudinary from '../utils/cloudinary.js'

export default class CodeInController {

    static async apiCreatePost(req, res, next) {
        try {
            //Body of the request contains these pieces of info
            const postContent = req.body.postContent
            const user = req.body.user

            //file upload - changed to cloundinary
            if (postContent?.files.length > 0) {
                const uploadedURLs = [];
            
                for (const tempPath of postContent.files) {
                    try {
                        // Make sure the path is absolute
                        const absolutePath = path.resolve(tempPath);
            
                        // Upload to Cloudinary
                        const result = await cloudinary.uploader.upload(absolutePath, {
                            folder: 'codein',
                        });
                        // Delete the temp file after upload
                        fs.unlinkSync(absolutePath);
        
                        // Save the Cloudinary
                        uploadedURLs.push({
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    } catch (err) {
                        console.error('Cloudinary upload failed for', tempPath, err);
                    }
                }
            
                postContent.files = uploadedURLs;
            }

            const postResponse = await CodeInDAO.createPost(
                postContent,
                user
            )
        if (postResponse?.insertedId) {
            res.status(200).json({
                status: 'success',
                insertedId: postResponse.insertedId,
            });
        } else {
            res.status(500).json({
                status: 'error',
                error: postResponse.error || 'Unknown error creating post',
            });
        }
        } catch (e) {
            res.status(500).json({error: e.message})
        }
    }
    //handle uploading files for creating/`edit`ing posts
    static handleUpload(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            res.json({
                status: 'success',
                filePath: `uploads/temp/${req.file.filename}`
            });
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }

    static handleFileDelete(req, res) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            const filename  = req.body.fileName;
            const filePath = path.join(__dirname, '../uploads/temp', filename);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file', err)
                } else {
                    console.log('Temp file deleted', filename)
                }                res.json({
                    status: 'success'
                });
            })
        } 
        catch (e) {
            res.status(500).json({'error': e.message})
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
            const deletedFiles = req.body?.deletedFiles;
            //file upload
            if (postContent.files.length > 0) {
                const finalArray = postContent.files.filter((file) => typeof file === 'object');
                const newArray = postContent.files.filter((file) => typeof file !== 'object');
                const uploadedURLs = [...finalArray];
                if (newArray.length > 0) {
                    for (const tempPath of newArray) {
                        try {
                            // Make sure the path is absolute
                            const absolutePath = path.resolve(tempPath);
                
                            // Upload to Cloudinary
                            const result = await cloudinary.uploader.upload(absolutePath, {
                                folder: 'codein',
                            });
                
                            // Delete the temp file after upload
                            fs.unlinkSync(absolutePath);
                
                            // Save the Cloudinary URL and public_id for deletion
                            uploadedURLs.push({
                                url: result.secure_url,
                                public_id: result.public_id
                            });

                        } catch (err) {
                            console.error('Cloudinary upload failed for', tempPath, err);
                        }
                    }
                }
                postContent.files = uploadedURLs;
            }
            //delete final files
            if (deletedFiles?.length > 0) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
    
                for (const file of deletedFiles) {
                    try {
                      await cloudinary.uploader.destroy(file.public_id);
                      console.log(`Deleted ${file.public_id}`);
                    } catch (err) {
                      console.error(`Failed to delete ${file.public_id}`, err);
                    }
                  }
            }

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
            //deleting attachments
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const attachments = req.body
            if (attachments) {
                attachments.forEach((x) => {
                    const filename = x.split('\\').at(-1)
                    console.log(filename)
                    const filePath = path.join(__dirname, '../uploads/final', filename);
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting file', err)
                        } else {
                            console.log('final file deleted', filename)
                        }
                    })
                }) 
                
            }
            // deleting post
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
    //get all public posts
    static async apiGetPublicPosts (req, res, next) {
        try {
            let posts = await CodeInDAO.getPublicPosts()
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

    static async handleFinalUpload (req, res, next) {
        try {
            const { filePath } = req.body;  
            const absolutePath = path.resolve(`.${filePath}`);
    
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(absolutePath, {
                folder: 'codein/profile',  // Keep profile pics separate
            });
    
            // Delete the temp file
            fs.unlinkSync(absolutePath);
    
            return res.json({
                secure_url: result.secure_url,
                public_id: result.public_id
            });
        } catch (error) {
            console.error('Error finalizing upload:', error);
            return res.status(500).json({ error: 'Failed to finalize image upload.' });
        }
      };

    static async apiLikePost (req, res) {
        try {
            const postId = req.params.postId
            const userId = req.body.userId
            const postResponse = await CodeInDAO.likePost({postId, userId})
            res.json({ status: 'success', operation: postResponse.operation})
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }
    // static async apiUnlikePost (req, res) {
    //     try {
    //         const postId = req.params.postId
    //         const postResponse = await CodeInDAO.unlikePost(postId)
    //         res.json({ status: 'success'})
    //     } catch (e) {
    //         console.log(`api, ${e}`)
    //         res.status(500).json({error: e})
    //     }
    // }

    static async apiGetMultiplePosts (req, res) {
        try {
            const { postIds } = req.body;
            let posts = await CodeInDAO.getMultiplePosts(postIds)
            if (!posts) {
                res.status(404).json({error: "Not Found"})
                return
            }
            res.json(posts)
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    }

    static async apiGetTailoredPosts (req, res) {
        try {
            const followIds = req.body;
            let posts = await CodeInDAO.getTailoredPosts(followIds)
            if (!posts) {
                res.status(404).json({error: "Not Found"})
                return
            }
            res.json(posts)
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch posts' });
        }
    }
}