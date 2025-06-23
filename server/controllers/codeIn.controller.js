import CodeInDAO from '../dao/CodeInDao.js'
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
import { promises as fsPromises } from 'fs';

export default class CodeInController {

    static async apiCreatePost(req, res, next) {
        try {
            //Body of the request contains these pieces of info
            const postContent = req.body.postContent
            const user = req.body.user

            //file upload
            if (postContent?.files.length > 0) {
                const movedFiles = postContent.files.map(tempPath => {
                    const fileName = path.basename(tempPath);
                    const finalPath = path.join('uploads', 'final', fileName);
                    fs.renameSync(tempPath, finalPath);
                    return finalPath;
                });
                postContent.files = movedFiles;
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
    //handle uploading files for creating/editing posts
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
                }
                res.json({
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
                const finalArray = postContent.files.filter((x) => {
                    const folderName = x.includes('\\') ? x.split('\\')[1] : x.split('/')[1];
                    return folderName === 'final';
                });
            
                const newArray = postContent.files.filter((x) => {
                    const folderName = x.includes('\\') ? x.split('\\')[1] : x.split('/')[1];
                    return folderName === 'temp';
                });
            
                if (newArray.length > 0) {
                    const movedFiles = newArray.map(tempPath => {
                        const fileName = path.basename(tempPath);
                        const finalPath = path.join('uploads', 'final', fileName);
                        fs.renameSync(tempPath, finalPath);
                        return finalPath;
                    });
                
                    postContent.files = [...finalArray, ...movedFiles];
                    console.log('files moved successfully')
                }
            }
            //delete final files
            if (deletedFiles?.length > 0) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
    
                for (const filePaths of deletedFiles) {
                    const normalizedPath = path.normalize(filePaths);
                    const filePath = path.join(__dirname, '..', normalizedPath);
    
                    try {
                        await fsPromises.unlink(filePath);
                        console.log('Deleted file:', normalizedPath);
                    } catch (err) {
                        console.error('Error deleting file', normalizedPath, err);
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

    static handleFinalUpload (req, res, next) {
        const { filePath } = req.body; // e.g., "uploads/temp/image123.png"
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const fileName = path.basename(filePath);
        const oldPath = path.join(__dirname, '..', filePath);
        const newPath = path.join(__dirname, '..', 'uploads/final', fileName);
      
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error('Error moving file:', err);
            return res.status(500).json({ error: 'Failed to move file' });
          }
      
          return res.json({ newPath: `uploads/final/${fileName}` });
        });
      };

    static async apiLikePost (res, req) {
        try {
            const postId = res.params.postId
            const postResponse = await CodeInDAO.likePost(postId)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }
    static async apiUnlikePost (res, req) {
        try {
            const postId = res.params.postId
            const postResponse = await CodeInDAO.unlikePost(postId)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }

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