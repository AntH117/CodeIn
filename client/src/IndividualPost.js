import React from 'react';
import './IndividualPost.css';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function IndividualPost({data, handleSearchParams}) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [likeCooldown, setLikeCooldown] = React.useState(false);

    //get liked posts
    async function awaitUserData() {
        const response = await getUserInfo(user?.uid)
        setLoggedUserData(response)
    }
    const [loggedUserData, setLoggedUserData] = React.useState(null)
    React.useEffect(() => {
        if (user) {
            awaitUserData()
        }
    },[user])
    
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

    //Liking a post
    //Temporarily like count
    const [tempLikeCount, setTempLikeCount] = React.useState(data.likeCount)
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


    //getting author info
    const [authorInfo, setAuthorInfo] = React.useState()
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
        const authorInfo = await getUserInfo(data.user)
        setAuthorInfo(authorInfo)
    }

    React.useEffect(() => {
        getAuthorInfo()
    },[location])

    let imageFiles = [];
    let otherFiles = [];

    if (data.postContent.files.length > 0) {
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'];
         imageFiles = data.postContent.files.filter(file => {
            const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
            return imageExtensions.includes(ext);
          });
        otherFiles = data.postContent.files.filter(file => {
            const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
            return !imageExtensions.includes(ext);
          });
    }

    function ImageGrid({ imageFiles }) {
        const columns = Math.min(imageFiles.length, 4);
        const gridStyle = {
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '10px',
        };
      
        return (
          <div style={imageFiles.length === 1 ? {} : gridStyle} className={`IP-image-container ${imageFiles.length === 1 ? 'single' : ''}`}  onClick={() => navigate(`/posts/${data._id}`)}>
            {imageFiles.map((src, idx) => (
              <img
                className='IP-image'
                key={idx}
                src={`http://localhost:5000/${src}`}
                alt={`Image ${idx + 1}`}
              />
            ))}
          </div>
        );
      }

    function CodeBlock({ code, language}) {

        return (
            <SyntaxHighlighter language={language} style={vscDarkPlus}>
              {code}
            </SyntaxHighlighter>
          );
    }

    function IndividualTag({tagName}) {

        return <div className='IP-individual-tag' onClick={() => handleSearchParams(tagName)}>
            {tagName}
        </div>
    }

    return <div className='IP-body'>
        <div className='IP-title'>
            <h2 onClick={() => navigate(`/posts/${data._id}`)}>{data.postContent.title}</h2>
        </div>
            <div className='IP-author-date'>
                <div className='IP-author-image' onClick={() => navigate(`/users/${data.user}`)}>
                    <img src={authorInfo?.photoURL}></img>
                </div>
                <h4><span style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${data.user}`)}>{ 
                authorInfo?.displayName || `@${authorInfo?.displayTag}`
                }</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.postContent.time)}</span></h4>
                <span style={{fontWeight: '400', marginLeft: '5px'}}>{data.postContent?.edited ? ' (Edited)' : ''}</span>
            </div>
        {data.postContent.paragraph && <div className='IP-paragraph'>
            <p>{data.postContent.paragraph}</p>
        </div>}
        
        <div className='IP-code-display'>
            {data?.postContent?.codeSnippet && <CodeBlock language={data.postContent.codeLanguage} code={data.postContent.codeSnippet}/>}
        </div>

        {imageFiles?.length > 0 && <ImageGrid imageFiles={imageFiles} />}
        {otherFiles?.length > 0 && 
        <div className='IP-attachments' style={{marginTop: '1rem'}}>
            + {otherFiles.length} attachment{otherFiles.length > 1 && 's'}
        </div>
        }
        {data.postContent?.tags.length > 0 && <div className='IP-tags'>
            {data.postContent.tags.map((tag) => {
                return <IndividualTag tagName={tag}/>
            })}
        </div>}
        <div className='IP-socials'>
            <div className='IP-socials-individual'>
                {user ? loggedUserData?.likes?.includes(data._id) ? <Icons.HeartFilled /> : <Icons.Heart /> : <Icons.Heart />}
                {tempLikeCount}
            </div>
            <div className='IP-socials-individual'>
                <Icons.Comment />
                {data.commentCount}
            </div>
            <div className='IP-socials-individual'>
                <Icons.Share />
                {data.shareCount}
            </div>
        </div>
        <div className='IP-interact'>
            {user && <h5 onClick={() => handleLike(data._id)}>{loggedUserData?.likes.includes(data._id) ? 'Unlike' : 'Like'}</h5>}
            <h5 onClick={() => navigate(`/posts/${data._id}`)}>Comment</h5>
            <h5>Share</h5>
        </div>
    </div>
}