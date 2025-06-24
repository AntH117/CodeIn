import './ExpandedPost.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import NotFound from './NotFound';


export default function ExpandedPost () {
    const { user } = useAuth();
    const [post, setPost] = React.useState(null)
    const [imageFiles, setImageFiles] = React.useState(null)
    const [otherFiles, setOtherFiles] = React.useState(null)
    const [authorInfo, setAuthorInfo] = React.useState(null)
    const [comments, setComments] = React.useState([])
    const [loadingError, setLoadingError] = React.useState(false)

    //handle loading
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
        if (post && authorInfo) {
            setLoading(false)
        }
    }, [authorInfo])
 
    //Get user data --> user liked post
    const [tempLikeCount, setTempLikeCount] = React.useState(0)
    const [loggedUserData, setLoggedUserData] = React.useState(null)
    const [likeCooldown, setLikeCooldown] = React.useState(false)
    async function awaitUserData() {
        const response = await getUserInfo(user?.uid)
        setLoggedUserData(response)
    }
    React.useEffect(() => {
        if (user) {
            awaitUserData()
        }
    },[user])
    //set temp like count
    React.useEffect(() => {
    if (!post) {
        return
    } else {
        setTempLikeCount(post?.likeCount)
    }
    }, [post])

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
    const postId = location.pathname.split('/').at(-1)
    const navigate = useNavigate();
    const APILINK = `http://localhost:5000/api/v1/codeIn/posts/${postId}`

    const getPost = async () => {
        try {
            const response = await fetch (APILINK, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await response.json();
            if (data?.postContent) {
                setPost(data)
                console.log('Post found')
            } else {
                console.log('Post not found')
                setLoadingError(true)
            }
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }
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
            try{
                const authorInfo = await getUserInfo(post?.user)
                setAuthorInfo(authorInfo)
            } catch (e) {
                console.error('Error loading author')
            }
        }
    }
    //Delete post
    function handleDeletePost() {
        if (window.confirm("Are you sure you want to delete this post?")) {
            // Perform deletion
            handleDeleteAllComments(post._id)
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
                    {user ? loggedUserData?.likes?.includes(post._id) ? <Icons.HeartFilled /> : <Icons.Heart /> : <Icons.Heart />}
                    {tempLikeCount}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Comment />
                    {post.commentCount}
                </div>
                <div className='IP-socials-individual'>
                    <Icons.Share />
                    {post.shareCount}
                </div>
        </div>
        )
    }
    //create comment
    const CommentAPILINK = `http://localhost:5000/api/v1/comments`
    const saveComment = async (currentComment) => {
        const savedComment = {
            postId: post._id,
            text: currentComment,
            userId: user.uid
        }
        try {
            const response = await fetch(`${CommentAPILINK}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(savedComment)
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
      function handleDeleteComment(commentId, postId) {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteComment(commentId, postId)
        }
      }
      const deleteComment = async (commentId, postId) => {
        try {
            const response = await fetch(`${CommentAPILINK}/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({postId})
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

      const handleDeleteAllComments = async (postId) => {
        try {
            const response = await fetch(`${CommentAPILINK}/post/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
        } catch (e) {
            console.error('failed to delete all comments:', e)
        }
      }
      
      //get comments by post
      const getComments = async () => {
        try {
            const response = await fetch(`${CommentAPILINK}/post/${post._id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const result = await response.json();
            if (result) {
                setComments(result)
            } else {
                console.error('failed to receive comments')
            }
        } catch (e) {
            console.error('failed to receive comments:', e)
        }
      }

      React.useEffect(() => {
        if (post) {
            getComments()
        }
      }, [post])

      //display individual comment
    function IndividualComment({data}) {
        const [userInfo, setUserInfo] = React.useState()
        //get User Info
        async function getUserInfo(uid) {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return docSnap.data(); // { displayName, photoURL, email }
            } else {
                return null;
            }
        }
        async function getuserInfo() {
            const userInfo = await getUserInfo(data.userId)
            setUserInfo(userInfo)
        }

        //get comment posters info
        React.useEffect(() => {
            getuserInfo()
        }, [])
        //If user, allow delete post
        return (

            <div className='IC-body'>
                {user?.uid === userInfo?.uid &&<div className='IC-delete' onClick={() => handleDeleteComment(data._id, post._id)}>
                    <Icons.Trash />
                </div>}
                <div className='IC-user-info'>
                    <div className='IC-user-image'>
                        <img src={userInfo?.photoURL || null}></img>
                    </div>
                    <div className='IC-user-name-date'>
                     <h4><span style={{cursor: 'pointer'}}>{userInfo?.displayName || userInfo?.displayTag}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.comment.timestamp)}</span></h4>
                    </div>
                </div>
                <div className='IC-comment'>
                    <p>{data.comment.text}</p>
                </div>
            </div>
        )
    }

    function Comments() {
        const [commentLimit, setCommentLimit] = React.useState(5)
        const [currentComment, setCurrentComment] = React.useState('')
        
        //must be signed in to comment
        return (
            <div className='EP-comments-body'>
                {user && <div className='EP-add-comment'>
                    <input type='text' className='EP-comment-input' placeholder='Add a comment...' id='comment-input'  onChange={(e) => setCurrentComment(e.target.value)} value={currentComment}></input>
                    <button className='EP-comment-post' onClick={() => currentComment.length > 0 ? saveComment(currentComment) : console.error('Comment invalid')}>Post</button>
                </div>}
                <div className='EP-comments'>
                    {comments.length > 0 && comments.map((x) => {
                        return <IndividualComment data = {x}/>
                    })}
                    {comments.length == 0 && <p>No comments yet!</p>}
                    {comments.length > commentLimit && <button className='load-comments-button' onClick={() => setCommentLimit((preval) => preval += 5)}>Load more</button>}
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
          <div style={imageFiles.length === 1 ? {} : gridStyle} className={`IP-image-container ${imageFiles.length === 1 ? 'single' : ''}`}>
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

    //liking a post logic
        async function addUserLikes(postId) {
            const userRef = doc(db, "users", user.uid);
            
            await updateDoc(userRef, {
                likes: arrayUnion(postId)
              });
        }
    
        async function removeUserLikes(postId) {
            const userRef = doc(db, "users", user.uid);
            
            await updateDoc(userRef, {
                likes: arrayRemove(postId)
              });
        }
        async function handleUserLikes(postId) {
            const containsPostId = loggedUserData?.likes?.includes(postId)
            if (containsPostId) {
                removeUserLikes(postId)
                setTempLikeCount((preVal) => preVal - 1)
                unlikePost(postId)
            } else if (!containsPostId) {
                addUserLikes(postId)
                setTempLikeCount((preVal) => preVal + 1)
                likePost(postId)
            }
            awaitUserData()
        }
    
        const likePost = async(postId) => {
            const likesAPILINK = `http://localhost:5000/api/v1/codeIn/socials/like/${postId}`
            try {
                const response = await fetch(likesAPILINK, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const result = await response.json();
            } catch (e) {
                console.error('Unable to like post:', e)
            }
        }
    
        const unlikePost = async(postId) => {
            const likesAPILINK = `http://localhost:5000/api/v1/codeIn/socials/unlike/${postId}`
            try {
                const response = await fetch(likesAPILINK, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const result = await response.json();
            } catch (e) {
                console.error('Unable to like post:', e)
            }
        }
        //Prevent spamming
        async function handleLike(postId) {
        if (likeCooldown) return;
        setLikeCooldown(true);
        try {
        await handleUserLikes(postId);
        } finally {
        setTimeout(() => setLikeCooldown(false), 1500);
        }
    }

    function CodeBlock({ code, language}) {

        return (
            <SyntaxHighlighter language={language} style={vscDarkPlus}>
              {code}
            </SyntaxHighlighter>
          );
    }

    function IndividualTag({tagName}) {

        return <div className='IP-individual-tag'>
            {tagName}
        </div>
    }

    function visibilityIcon(visibility) {
        switch(visibility) {
            case 'Public': 
                return <Icons.Globe />
            case 'Followers':
                return <Icons.Follower />
            case 'Private':
                return <Icons.Private />
        }
    }


    const imageChecker = location.pathname.split('/').includes('image')
    return (<div className='EP-outer-body' style={imageChecker ? {overflowY: 'hidden'} : {}}>
    {(loading && !loadingError) && <div className='loading-body'>
        <span class="loader"></span>
    </div>}
    {loadingError && <NotFound />}
    <Outlet />
    {!loading && <div className='EP-inner-body'>
                    {user?.uid == post.user && <DropDownMenu />}
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
                            <div className='IP-visibility-icon'>
                                {visibilityIcon(post.postContent.visibility)}
                            </div>
                        </div>
                       {post.postContent.paragraph && <div className='IP-paragraph'>
                            <p>{post.postContent.paragraph}</p>
                        </div>}
                        {post?.postContent?.codeSnippet && <div className='IP-code-display'>
                              <CodeBlock language={post.postContent.codeLanguage} code={post.postContent.codeSnippet}/>
                        </div>}
                        {imageFiles && <ImageGrid imageFiles={imageFiles}/>}
                        {otherFiles && <div className='IP-attachments'>
                            {otherFiles.map((x) => {
                                return <FileAttachment file={x}/>
                            })}
                        </div>}
                        {post?.postContent?.tags.length > 0 && <div className='IP-tags'>
                            {post?.postContent.tags.map((tag) => {
                                return <IndividualTag tagName={tag}/>
                            })}
                        </div>}
                        <Socials />
                        <div className='IP-interact' style={{marginBottom: '1rem'}}>
                            {user && <h5 onClick={() => handleLike(post._id)}>{loggedUserData?.likes.includes(post._id) ? 'Unlike' : 'Like'}</h5>}
                            <h5>Share</h5>
                        </div>
                        <Comments />
                </div>}
            </div>)
}