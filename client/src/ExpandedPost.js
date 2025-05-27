import './ExpandedPost.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ExpandedPost () {
    const { user } = useAuth();
    const [post, setPost] = React.useState(null)
    const [imageFiles, setImageFiles] = React.useState(null)
    const [otherFiles, setOtherFiles] = React.useState(null)
    const [authorInfo, setAuthorInfo] = React.useState()

    function setFiles () {
        if (post?.postContent.files.length > 0) {
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
            const images = post.postContent.files.filter(file => {
                const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
                return imageExtensions.includes(ext);
              });
            setImageFiles(images)
            const other = post.postContent.files.filter(file => {
                const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
                return !imageExtensions.includes(ext);
              });
            setOtherFiles(other)
        }
    }
    const location  = useLocation()
    const id = location.pathname.split('/').at(-1)
    const navigate = useNavigate();
    const APILINK = `http://localhost:5000/api/v1/codeIn/posts/${id}`

    const getPost = async () => {
        try {
            const response = await fetch (APILINK, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json();
            setPost(data)
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }
    //icons
    React.useEffect(() => {
        getPost()
    }, [])
    
    React.useEffect(() => {
        setFiles()
        getAuthorInfo()
    }, [post])
    //Get Author details
    async function getUserInfo(uid) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
        return docSnap.data(); // { displayName, photoURL, email }
        } else {
        return null;
        }
    }
    async function getAuthorInfo() {
        if (post) {
            const authorInfo = await getUserInfo(post?.user)
            setAuthorInfo(authorInfo)
        }
    }
    //Delete post
    function handleDeletePost() {
        if (window.confirm("Are you sure you want to delete this post?")) {
            // Perform deletion
            deletePost();
          }
    }
    const deletePost = async () => {
        try {
            const response = await fetch (APILINK, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: post?.postContent.files.length > 0 ? JSON.stringify(post?.postContent.files) : null
            })
            if (response.ok) {
                alert('Post deleted successfully.');
                navigate('/');
            } else {
                const errorText = await response.text();
                alert('Failed to delete post.');
                console.error(`Delete failed: ${response.status} - ${errorText}`);
            }
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }

    function convertTime(time) {
        const date = new Date(time);
        const options = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          };
          const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
          return formatted
    }

    //Edit && Delete
    function DropDownMenu() {
        const [open, setOpen] = React.useState(false)

        return <>
        <div className='EP-delete' onClick={() => setOpen((preVal) => !preVal)}>
            <div className='dot'></div>
            <div className='dot'></div>
            <div className='dot'></div>
        </div>
        {open && <div className='EP-dropdown'>
                <div className='EP-dropdown-option' onClick={() => navigate('edit')}> <Icons.Edit /> Edit</div>
                <div className='EP-dropdown-option' onClick={() => handleDeletePost()}>
                        <Icons.Trash />
                        Delete
                </div>
            </div>}
        </>
    }

    function Socials() {
        return (
        <div className='IP-socials'>
                <div className='IP-socials-individual'>
                    <Icons.Heart />
                    {post.postContent.socials.likes}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Comment />
                    {post.postContent.socials.comments.length}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Share />
                    {post.postContent.socials.shares}
                </div>
                </div>
        )
    }
    
    //create comment
    const saveComment = async (currentComment) => {
        const savedComment = {
            comment: currentComment,
            user: 'Anthony',
            time: new Date().toISOString(),
            commentId: uuidv4(),
        }
        const updatedPost = {
            ...post,
            postContent: {
                ...post.postContent,
                socials: {
                    ...post.postContent.socials,
                    comments: [...post.postContent.socials.comments, savedComment],
                },
            },
        }
        console.log(updatedPost)
        try {
            const response = await fetch(APILINK, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Comment Saved')
                window.location.reload()
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            console.error('failed to save comment:', e)
        }
      };
      
      //delete comment
      function handleDeleteComment(commentId) {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteComment(commentId)
        }
      }

      const deleteComment = async (commentId) => {
        const updatedComments = post.postContent.socials.comments.filter(
            (comment) => comment.commentId !== commentId
        )
        const updatedPost = {
            ...post,
            postContent: {
                ...post.postContent,
                socials: {
                    ...post.postContent.socials,
                    comments: updatedComments,
                },
            },
        }
        try {
            const response = await fetch(APILINK, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedPost)
            });
            
            const result = await response.json();
            if (result.status === 'success') {
                alert('Comment deleted')
                window.location.reload()
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            console.error('failed to delete comment:', e)
        }
      };
      

    function Comments() {
        const [commentLimit, setCommentLimit] = React.useState(5)
        const [currentComment, setCurrentComment] = React.useState('')
        function IndividualComment({data}) {
            //If user, allow delete post
            return (
                <div className='IC-body'>
                    <div className='IC-delete' onClick={() => handleDeleteComment(data.commentId)}>
                        <Icons.Trash />
                    </div>
                    <div className='IC-user-info'>
                        <div className='IC-user-image'>
                            <img src={testImage}></img>
                        </div>
                        <div className='IC-user-name-date'>
                         <h4><span style={{cursor: 'pointer'}}>{data.user}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.time)}</span></h4>
                        </div>
                    </div>
                    <div className='IC-comment'>
                        <p>{data.comment}</p>
                    </div>
                </div>
            )
        }
        const postComments = post.postContent.socials.comments;

        return (
            <div className='EP-comments-body'>
                <div className='EP-add-comment'>
                    <input type='text' className='EP-comment-input' placeholder='Add a comment...' id='comment-input'  onChange={(e) => setCurrentComment(e.target.value)} value={currentComment}></input>
                    <button className='EP-comment-post' onClick={() => currentComment.length > 0 ? saveComment(currentComment) : console.error('Comment invalid')}>Post</button>
                </div>
                <div className='EP-comments'>
                    {postComments.length > 0 && postComments.slice().reverse().slice(0, commentLimit).map((x) => {
                        return <IndividualComment data = {x}/>
                    })}
                    {post.postContent.socials.comments.length == 0 && <p>No comments yet!</p>}
                    {postComments.length > commentLimit && <button className='load-comments-button' onClick={() => setCommentLimit((preval) => preval += 5)}>Load more</button>}
                </div>
            </div>
        )
    }
    
    function ImageGrid({ imageFiles }) {
        
        const columns = Math.min(imageFiles.length, 4);
        const gridStyle = {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '10px',
        };
        return (
          <div style={gridStyle} className='IP-image-container'>
            {imageFiles.map((src, idx) => (
              <img
                onClick={() => navigate(`image/${src.split('\\').at(-1)}`)}
                className='IP-image'
                key={idx}
                src={`http://localhost:5000/${src}`}
                alt={`Image ${idx + 1}`}
              />
            ))}
          </div>
        );
      }
    
    function FileAttachment({file}) {
        const originalName = file.slice(51)

        return <div className='file-attachment-body'>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-file-earmark" viewBox="0 0 16 16">
             <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
            </svg>
            <p>
                {originalName}
            </p>
        </div>
    }
    return (<div className='EP-outer-body'>
            <Outlet />
    {post && <div className='EP-inner-body'>
                    <DropDownMenu />
                    <div className='IP-title'>
                            <h2>{post?.postContent.title}</h2>
                        </div>
                        <div className='IP-author-date'>
                            <div className='IP-author-image' onClick={() => navigate(`/users/${post?.user}`)}>
                                <img src={authorInfo?.photoURL || testImage}></img>
                            </div>
                            <h4><span style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${post?.user}`)}>{authorInfo?.displayName || `@${authorInfo?.displayTag}`}</span> 
                            <span style={{fontWeight: '200'}}> &#9679; {convertTime(post.postContent.time)}</span>
                            <span style={{fontWeight: '400'}}>{post.postContent?.edited ? ' (Edited)' : ''}</span>
                            </h4>
                        </div>
                       {post.postContent.paragraph && <div className='IP-paragraph'>
                            <p>{post.postContent.paragraph}</p>
                        </div>}
                        {imageFiles && <ImageGrid imageFiles={imageFiles}/>}
                        {otherFiles && <div className='IP-attachments'>
                            {otherFiles.map((x) => {
                                return <FileAttachment file={x}/>
                            })}
                        </div>}
                        <Socials />
                        <div className='IP-interact' style={{marginBottom: '1rem'}}>
                            <h5>Like</h5>
                            <h5>Share</h5>
                        </div>
                        <Comments />
                </div>}
            </div>)
}