import './Profile.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';

export default function Profile () {
    const { user } = useAuth();
 
    const [profileInfo, setProfileInfo] = React.useState()
    const location = useLocation();
    const profileId = location.pathname.split('/').at(-1)
    const navigate = useNavigate()
    
    //handle loading
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
        getPosts()
    }, [location])

    const isUser = user?.uid == profileId

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
        try {
            const profileInfo = await getUserInfo(profileId)
            setProfileInfo(profileInfo)
        } catch (e) {
            console.error('Error getting profile info')
        } finally {
            setLoading(false)
        }
    }

    function convertDate(date) {
        const dateSplit = date.split(' ')
        const dateCreated = dateSplit.slice(1, 4).join(' ')
        return dateCreated
    }

    React.useEffect(() => {
        getAuthorInfo()
    },[location])


    //get user only posts
    const [userPosts, setUserPosts] = React.useState()  
    const APILINK = 'http://localhost:5000/api/v1/codeIn'

    const getPosts = async () => {
        try {
            const response = await fetch(`${APILINK}/user/${profileId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setUserPosts(data)
        } catch (e) {
            console.error('Unable to load posts:', e)
        }
      };


    //display user only posts
    function UserPosts() {
        
        function IndividualUserPost({data}) {

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
    
            return <div className='individual-user-post-body'>
                <div className='IP-title'>
                    <h2 onClick={() => navigate(`/posts/${data._id}`)}>{data.postContent.title}</h2>
                </div>
                    <div className='IP-author-date'>
                        <div className='IP-author-image' onClick={() => navigate(`/users/${data.user}`)}>
                            <img src={profileInfo?.photoURL}></img>
                        </div>
                        <h4><span style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${data.user}`)}>{ 
                        profileInfo?.displayName || `@${profileInfo?.displayTag}`
                        }</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.postContent.time)}</span></h4>
                        <span style={{fontWeight: '400', marginLeft: '5px'}}>{data.postContent?.edited ? ' (Edited)' : ''}</span>
                    </div>
                {data.postContent.paragraph && <div className='IP-paragraph'>
                    <p>{data.postContent.paragraph}</p>
                </div>}
                {imageFiles?.length > 0 && <ImageGrid imageFiles={imageFiles} />}
                {otherFiles?.length > 0 && 
                <div className='IP-attachments' style={{marginTop: '1rem'}}>
                    + {otherFiles.length} attachment{otherFiles.length > 1 && 's'}
                </div>
                }
                <div className='IP-socials'>
                    <div className='IP-socials-individual'>
                        <Icons.Heart />
                        {data.likeCount}
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
                    <h5>Like</h5>
                    <h5 onClick={() => navigate(`/posts/${data._id}`)}>Comment</h5>
                    <h5>Share</h5>
                </div>
            </div>
        }

        return <>
            {userPosts && userPosts.map((post) => 
                <IndividualUserPost data={post} />
            )}
        </>
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

    //display user only comments
    function UserComments() {
        const [userComments, setUserComments] = React.useState([])
            const CommentAPILINK = `http://localhost:5000/api/v1/comments`
        const getUserComments = async() => {
            try {
                const response = await fetch(`${CommentAPILINK}/user/${profileId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                const result = await response.json();
                if (result) {
                    setUserComments(result)
                } else {
                    console.error('failed to receive comments')
                }
            } catch (e) {
                console.error('failed to receive comments:', e)
            }
        }

        React.useEffect(() => {
            getUserComments()
        }, [])
        console.log(userComments)

        //individual comments
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

            //handle delete comments
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

            //get comment posters info
            React.useEffect(() => {
                getuserInfo()
            }, [])
            //If user, allow delete post
            return (
                <div className='individual-comment-body'>
                    {user?.uid === userInfo?.uid &&<div className='IC-delete' onClick={() => handleDeleteComment(data._id, data.postId)}>
                        <Icons.Trash />
                    </div>}
                    <div className='individual-comment-navigate' onClick={() => navigate(`/posts/${data.postId}`)}>
                        <Icons.ArrowRight />
                    </div>
                    <div className='individual-comment-user-info'>
                        <div className='IC-user-image'>
                            <img src={userInfo?.photoURL || null}></img>
                        </div>
                        <div className='IC-user-name-date'>
                         <h4><span style={{cursor: 'pointer'}}>{userInfo?.displayName || userInfo?.displayTag}</span> <span style={{fontWeight: '200'}}> &#9679; {convertTime(data.comment.timestamp)}</span></h4>
                        </div>
                    </div>
                    <div className='individual-comment-comment'>
                        <p>{data.comment.text}</p>
                    </div>
                </div>
            )
        }


        return <>
            {userComments.map((comment) => {
                return <IndividualComment data={comment}/>
            })}
        </>
    }


    function UserProfileToggle () {
        const [selectToggle, setSelectToggle] = React.useState('Posts')

        function ToggleOption({name}) {

            return <div className={`user-toggle-option ${name === selectToggle ? 'selected' : ''}`} onClick={() => setSelectToggle(name)}>
                {name}
                {name === selectToggle && <div className='user-toggled'>
                    
                </div>}
            </div>
        }
        const toggleDisplay = () => {
            switch(selectToggle) {
                case 'Posts': 
                    return <UserPosts />;
                case 'Comments':
                    return <UserComments />
        }
        }

        return (<>
            <div className='user-profile-toggle'>
                <ToggleOption name={'Posts'}/>
                <ToggleOption name={'Comments'}/>
            </div>
            <div className='user-toggle-outlet'>
             {toggleDisplay()}
            </div>
        </>
        )
    }

    return <div className='user-profile-outer-body'>
        {loading && <div className='loading-body'>
            <span class="loader"></span>
        </div>}
        {!loading && <div className='user-profile-inner-body'>
            <div className='user-background'>
                <img className='user-background-image' src={profileInfo?.backgroundURL || null}>

                </img>
                <div className='user-info-image'>
                    <img src={profileInfo?.photoURL || testImage}>
                    </img>
                </div>
            </div>
            <div className='user-info-name'>
                <span style={{fontWeight: 'bold', marginRight: "10px"}}>{profileInfo?.displayName || 'No name yet'}</span>
                <div className='user-info-tag'>
                    @{profileInfo?.displayTag}
                </div>
                {isUser && <div className='user-edit'>
                        <div className='EP-dropdown-option' onClick={() => navigate('edit')}> <Icons.Edit /> Edit</div>
                </div>}
                <div className='user-creation-date'>
                   <Icons.Calendar /> Joined {convertDate(profileInfo?.creationDate)}
                </div>
            </div>
            <UserProfileToggle />
        </div>}
    </div>
}