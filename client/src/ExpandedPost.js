import './ExpandedPost.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';
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
import ShowAlert from './ShowAlert';
import notify from './Toast';
import Skeleton from './skeleton/Skeleton';
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "./ThemeContext";


function LikeWrapper({user, isLiked}) {
    const location  = useLocation()
    const { isDarkMode } = useTheme()
    const postId = location.pathname.split('/').at(-1)
    return (
        <div className={`like-icon ${isLiked && 'liked'}`}>
            {user ? (isLiked ? <Icons.HeartFilled color={isDarkMode ? '#F87171': "rgb(252, 100, 100)"}/> 
            : 
            <Icons.Heart color={isDarkMode ? '#B0B0B0': "black"}/>) : <Icons.Heart color={isDarkMode ? '#B0B0B0': "black"}/>}
        </div>
    )
}
function Socials({post, tempLikeCount, user, isLiked}) {
    const { isDarkMode } = useTheme()
    return (
    <div className='IP-socials'>
            <div className='IP-socials-individual'>
                <LikeWrapper user={user} isLiked={isLiked}/>
                {tempLikeCount}
            </div>
            <div className='IP-socials-individual'>
                <Icons.Comment color={isDarkMode ? '#B0B0B0' : 'black'}/>
                {post.commentCount}
            </div>
            <div className='IP-socials-individual'>
                <Icons.Share color={isDarkMode ? '#B0B0B0' : 'black'}/>
                {post.shareCount}
            </div>
    </div>
    )
}

export default function ExpandedPost () {
    const { isDarkMode } = useTheme()
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const { user } = useAuth();
    const [post, setPost] = React.useState(null)
    const [imageFiles, setImageFiles] = React.useState(null)
    const [otherFiles, setOtherFiles] = React.useState(null)
    const [authorInfo, setAuthorInfo] = React.useState(null)
    const [comments, setComments] = React.useState(null)
    const [loadingError, setLoadingError] = React.useState(false)
    //handle loading
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
        if (post && authorInfo) {
            setLoading(false);
        }
    }, [post, authorInfo]);
    const location  = useLocation()
    //Get user data --> user liked post
    const [tempLikeCount, setTempLikeCount] = React.useState(0)
    const [loggedUserData, setLoggedUserData] = React.useState(null)
    const [likeCooldown, setLikeCooldown] = React.useState(false)
    const [isLiked, setIsLiked] = React.useState(false)
    async function awaitUserData() {
        const response = await getUserInfo(user?.uid)
        setLoggedUserData(response)
    }
    React.useEffect(() => {
        if (user) {
            awaitUserData()
        }
    },[user])
    //Intial setups
    React.useEffect(() => {
        getPost()
    }, [])

    React.useEffect(() => {
        if (!post) {
            return
        } else {
            getComments()
            setTempLikeCount(post?.likeCount)
            setFiles()
            getAuthorInfo()
            setIsLiked(loggedUserData?.likes.includes(post?._id))
        }
    }, [post])

    function setFiles () {
        if (post?.postContent.files.length > 0) {
            const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
            const images = post.postContent.files.filter(file => {
                const ext = file.url.slice(file.url.lastIndexOf('.')).toLowerCase();
                return imageExtensions.includes(ext);
              });
            setImageFiles(images)
            const other = post.postContent.files.filter(file => {
                const ext = file.url.slice(file.url.lastIndexOf('.')).toLowerCase();
                return !imageExtensions.includes(ext);
              });
            setOtherFiles(other)
        }
    }
    //takes postId straight from params
    const { postId } = useParams();
    const navigate = useNavigate();
    const APILINK = `${backendURL}/api/v1/codeIn/posts/${postId}`

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
            } else {
                setLoadingError(true)
            }
        } catch (e) {
            console.error(`Unable to load post:`, e)
        }
    }

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

    const [confirmDeletePost, setConfirmDeletePost] = React.useState(null)
    //Delete post
    function handleDeletePost() {
        setConfirmDeletePost(false)
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
                notify.success('Post deleted!', '🗑️')
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
            <div className={`dot ${isDarkMode && 'dark'}`}></div>
            <div className={`dot ${isDarkMode && 'dark'}`}></div>
            <div className={`dot ${isDarkMode && 'dark'}`}></div>
        </div>
        {open && <div className='EP-dropdown'>
                <div className={`EP-dropdown-option ${isDarkMode && 'dark'}`} onClick={() => navigate('edit')}> <Icons.Edit /> Edit</div>
                <div className={`EP-dropdown-option ${isDarkMode && 'dark'}`} onClick={() => handleDeletePost()}>
                        <Icons.Trash />
                        Delete
                </div>
            </div>}
        </>
    }
    //create comment
    console.log(post)
    const [commentCD, setCommentCD] = React.useState(false)
    const CommentAPILINK = `${backendURL}/api/v1/comments`
    const saveComment = async (currentComment) => {
        setCommentCD(true)
        notify.progress('Posting comment...')
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
                notify.success('Comment posted!')
                getComments()
            } else {
                console.error('Backend Error', result.error)
            }
        } catch (e) {
            notify.error('Error posting comment')
            console.error('failed to save comment:', e)
            setCommentCD(false)
        } finally {
            setCommentCD(false)
        }
      };
      
      const [confirmDeleteComment, setConfirmDeleteComment] = React.useState(null)
      //delete comment
      function handleDeleteComment(commentId, postId) {
        setSelectedComment(commentId)
        setConfirmDeleteComment(false)
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
                notify.success('Comment deleted!', '🗑️')
                getComments()
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
      const [loadComments, setLoadComments] = React.useState(false)
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
        } finally {
            setLoadComments(true)
        }
      }


      //display individual comment
    function IndividualComment({data}) {
        const [userInfo, setUserInfo] = React.useState()
        const [loaded, setLoaded] = React.useState(false)
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
            try {
                const userInfo = await getUserInfo(data.userId)
                setUserInfo(userInfo)
            } catch (e) {
                console.error('error loading comment')
            } finally {
                setLoaded(true)
            }
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
                {loaded && <>
                <div className='IC-user-info'>
                    <div className='IC-user-image' onClick={() => navigate(`/users/${userInfo?.uid}`)}>
                        <img src={userInfo?.photoURL || null}></img>
                    </div>
                    <div className='IC-user-name-date'>
                     <h4><span style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${userInfo?.uid}`)} >{userInfo?.displayName || userInfo?.displayTag}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.comment.timestamp)}</span></h4>
                    </div>
                </div>
                <div className='IC-comment'>
                    <p>{data.comment.text}</p>
                </div>
                </>}
            </div>
        )
    }

    const [selectedComment, setSelectedComment] = React.useState(null)
    function Comments() {
        const [commentLimit, setCommentLimit] = React.useState(5)
        const [currentComment, setCurrentComment] = React.useState('')

        let sortedComments;
        if (user) {
            const userComments = comments.filter((comment) => comment.userId == user?.uid)
            sortedComments = [...userComments ,...comments.filter((comment) => comment.userId !== user?.uid)]
        } else {
            sortedComments = comments
        }
        //must be signed in to comment
        return (
            <div className='EP-comments-body'>
                {user && <div className='EP-add-comment'>
                    <input type='text' className='EP-comment-input' placeholder='Add a comment...' id='comment-input'  
                        onChange={(e) => setCurrentComment(e.target.value)} value={currentComment} autocomplete="off"
                        style={isDarkMode ? {color: 'white'} : {color: 'black'}}
                    ></input>
                    <button className={`EP-comment-post ${commentCD && 'disabled'}`} onClick={() => currentComment.length > 0 ? saveComment(currentComment) : console.error('Comment invalid')}>Post</button>
                </div>}
                <div className='EP-comments'>
                    {comments?.length > 0 && sortedComments.slice(0, commentLimit).map((x) => {
                        return <IndividualComment data = {x}/>
                    })}
                    {comments?.length == 0 && <p>No comments yet!</p>}
                    {comments?.length > commentLimit && <button className='load-comments-button' onClick={() => setCommentLimit((preval) => preval += 5)}>Load more</button>}
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
            {imageFiles.map((image, idx) => (
              <img
                onClick={() => navigate(`image/${image.url.split('/').at(-1)}`)}
                className='IP-image'
                key={idx}
                src={image.url}
                alt={`Image ${idx + 1}`}
              />
            ))}
          </div>
        );
      }
    
    function FileAttachment({file}) {
        const originalName = file.url

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
            setIsLiked(true)
        }
    
        async function removeUserLikes(postId) {
            const userRef = doc(db, "users", user.uid);
            
            await updateDoc(userRef, {
                likes: arrayRemove(postId)
              });
              setIsLiked(false)
        }
        async function handleUserLikes(postId) {
            likePost(postId)
        }
        const likePost = async(postId) => {
            const likesAPILINK = `${backendURL}/api/v1/codeIn/socials/like/${postId}`
            try {
                const response = await fetch(likesAPILINK, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({userId: user.uid})
                });
                if (response.ok) {
                    const result = await response.json();
                    console.log(result)
                    if (result.status === 'success') {
                        if (result.operation === 'liked') {
                            setTempLikeCount((preVal) => preVal + 1);
                            addUserLikes(postId);
                        } else if (result.operation === 'unliked') {
                            setTempLikeCount((preVal) => preVal - 1)
                            removeUserLikes(postId)
                        }
                    }
                } else {
                    console.error('Unable to like post:', response.statusText);
                }
            } catch (e) {
                console.error('Unable to like post:', e)
            } finally {
                awaitUserData()
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
            <div style={{ width: 'fit-content', minWidth: '100%' }} id='code-block'>
                <SyntaxHighlighter language={language} style={vscDarkPlus} 
                customStyle={{
                    backgroundColor: isDarkMode ? '#181818' : undefined,
                    borderRadius: '8px',
                    minWidth: '100%',  
                    overflowX: 'auto',
                }}
                >
                {code}
                </SyntaxHighlighter>
            </div>
          );
    }

    function IndividualTag({tagName}) {

        return <motion.div className='IP-individual-tag' onClick={() => navigate(`/?tag=${tagName}`)}
            whileHover={{ scale: 1.1, backgroundColor: 'rgb(87, 87, 255)', color: 'rgb(255,255,255)', border: '1px solid transparent'
            }}
            transition={{ duration: 0.2 }}
            style={isDarkMode ? {border: '1px solid #A78BFA', color: ' #A78BFA'} : {border: '1px solid black', color: 'black'}}
            >
            {tagName}
        </motion.div>
    }

    function visibilityIcon(visibility) {
        switch(visibility) {
            case 'Public': 
                return <Icons.Globe color={isDarkMode ? 'rgb(255,255,255)' : 'rgb(29, 29, 29)'}/>
            case 'Followers':
                return <Icons.Follower color={isDarkMode ? 'rgb(255,255,255)' : 'rgb(29, 29, 29)'}/>
            case 'Private':
                return <Icons.Private color={isDarkMode ? 'rgb(255,255,255)' : 'rgb(29, 29, 29)'}/>
        }
    }
    function handleCopy(data) {
        navigator.clipboard.writeText(data);
        notify.success('Copied to clipboard!','📋')
    }
    const imageChecker = location.pathname.split('/').includes('image')

    function ExpandedCodeSnippet() {
        const [expanded, setExpanded] = React.useState(false)
        const height = Number(document.getElementById('code-block')?.offsetHeight) + 25
        
        return (
        <div className='EP-code-display-wrapper' style={expanded ? {height: height > 600 ? `600px` : `${height}px`} : {height: height > 300 ? '300px' : 'fit-content'}}>
            <div className='IP-code-display-copy' onClick={() => handleCopy(post.postContent.codeSnippet)}>
                <Icons.Copy />
            </div>
            {height > 300 && <div className='EP-code-expand' onClick={() => setExpanded(!expanded)}>
                {expanded ? 
                    <Icons.SquareMinus color={isDarkMode ? 'white': 'black'}/>
                    :
                    <Icons.SquarePlus color={isDarkMode ? 'white': 'black'}/>
                }
            </div>}
            <div className={`IP-code-display ${isDarkMode && 'dark'}`} id='IP-code-display'>
                <CodeBlock language={post.postContent.codeLanguage} code={post.postContent.codeSnippet}/>
            </div>
        </div>
        )
    }


    return (<div className='EP-outer-body' style={imageChecker ? {overflowY: 'hidden'} : {}}>
        {(loading && !loadingError) && <Skeleton.ExpandedPost darkMode={isDarkMode} />}
        {loadingError && <NotFound />}
        <Outlet />
        {confirmDeletePost == false && <ShowAlert message={'Are you sure you want to delete this post?'} confirm={true} setConfirmation={setConfirmDeletePost} callback={() => {
            handleDeleteAllComments(post._id);
            deletePost()
        }}/>}
        {confirmDeleteComment == false && <ShowAlert message={'Are you sure you want to delete this comment?'} confirm={true} setConfirmation={setConfirmDeleteComment} callback={() => {
            deleteComment(selectedComment, postId)
            setSelectedComment(null)
        }}/>}
        {!loading && <div className='EP-inner-body'
                        style={isDarkMode ? {backgroundColor: '#1E1E1E', color: '#EDEDED'} : {backgroundColor: 'rgba(253, 245, 234, 255)'}}
                    >
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

                            {post?.postContent?.codeSnippet && <ExpandedCodeSnippet />}

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
                            <Socials post={post} tempLikeCount={tempLikeCount} user={user} isLiked={isLiked}/>
                            <div className='IP-interact' style={{marginBottom: '1rem'}}>
                                {user && <h5 onClick={() => handleLike(post._id)} style={likeCooldown ? {color: 'gray', cursor: 'default'} : {}}>{isLiked ? 'Unlike' : 'Like'}</h5>}
                                <h5>Share</h5>
                            </div>
                            {loadComments && <Comments />}
                            {!loadComments && <Skeleton.Comments />}
                    </div>}
                </div>)
}