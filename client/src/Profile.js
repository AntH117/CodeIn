import './Profile.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from './firebase';
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import IndividualPost from './IndividualPost';
import { doc, getDoc, setDoc, updateDoc, increment  } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";

export default function Profile () {
    const { user } = useAuth();
 
    const [profileInfo, setProfileInfo] = React.useState()
    const [loggedUserInfo, setLoggedUserInfo] = React.useState()
    const [tempFollowCount, setTempFollowCount] = React.useState(0)
    const [followed, setFollowed] = React.useState(false)
    const location = useLocation();
    const profileId = location.pathname.split('/').at(-1)
    const navigate = useNavigate()

    //handle loading
    const [loading, setLoading] = React.useState(true)
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

    React.useEffect(() => {
        setTempFollowCount(profileInfo?.followCount)
        setFollowed(loggedUserInfo?.followed.includes(profileId))
    }, [profileInfo])
    
    React.useEffect(() => {
        if (user?.uid) {
            getLoggedUserInfo()
        }
    }, [location])

    async function getLoggedUserInfo() {
        try {
            const userInfo = await getUserInfo(user.uid)
            setLoggedUserInfo(userInfo)
        } catch (e) {
            console.error('Error getting profile info')
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


    //display user only posts
    function UserPosts({onLoaded}) {
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
        } finally {
            onLoaded()
        }
      };

        React.useEffect(() => {
            getPosts()
        }, [location])
    

        return <div className='individual-post-body'>
            {userPosts && userPosts.map((post) => 
                <IndividualPost data={post} />
            )}
            {userPosts?.length == 0 && <p>No posts yet!</p>}
        </div>
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
    function UserComments({onLoaded}) {
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
            } finally {
                onLoaded()
            }
        }

        React.useEffect(() => {
            getUserComments()
        }, [])

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
            {userComments.length > 0 && userComments.map((comment) => {
                return <IndividualComment data={comment}/>
            })}
            {userComments.length == 0 && <p>No comments yet!</p>}
        </>
    }

    //User likes
    function UserLikes({onLoaded}) {
        //get liked posts
        const [loggedUserData, setLoggedUserData] = React.useState(null)
        const [likedPosts, setLikedPosts] = React.useState(null)
        async function getUserInfo(uid) {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data(); // { displayName, photoURL, email }
            } else {
                return null;
            }
        }
        async function awaitUserData() {
            const response = await getUserInfo(profileId)
            getLikedPosts(response.likes)
        }
        React.useEffect(() => {
            if (user) {
                awaitUserData()
            }
        },[user])
        
        const getLikedPosts = async(postIds) => {
            const APILINK = `http://localhost:5000/api/v1/codeIn/posts/batch`
            try {
                const response = await fetch(APILINK, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ postIds }), // send array of IDs
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLikedPosts(data); 
            } catch (e) {
                console.error('Unable to load posts:', e);
            } finally {
                onLoaded();
            }
    }

    return (
        <div className='individual-post-body'>
            {likedPosts && likedPosts.map((post) => {
            return <IndividualPost data={post}/>
        })}
        </div>
    )
}


    function UserProfileToggle () {
        const [selectToggle, setSelectToggle] = React.useState('Posts')
        const [toggleLoading, setToggleLoading] = React.useState(true)
        React.useEffect(() => {
            setToggleLoading(true)
        }, [selectToggle])
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
                    return <UserPosts onLoaded={() => setToggleLoading(false)}/>;
                case 'Comments':
                    return <UserComments onLoaded={() => setToggleLoading(false)}/>
                case 'Likes':
                    return <UserLikes  onLoaded={() => setToggleLoading(false)} />
        }
        }
        return (<>
            <div className='user-profile-toggle'>
                <ToggleOption name={'Posts'}/>
                <ToggleOption name={'Comments'}/>
                <ToggleOption name={'Likes'}/>
            </div>
            <div className='user-toggle-outlet'>
            {toggleLoading && <div className='toggle-loader'>
                <span class="loader"></span>
            </div>}
             {toggleDisplay()}
            </div>
        </>
        )
    }

    async function followUser(userId) {
        //logged user info
        const userRef = doc(db, "users", user.uid);
        //profile page info
        const profileRef = doc(db, "users", profileId);
        
        await updateDoc(profileRef, {
            followCount: increment(1)
        })
        await updateDoc(userRef, {
            followed: arrayUnion(userId)
            });
    }

    async function unfollowUser(userId) {
        //logged user info
        const userRef = doc(db, "users", user.uid);
        //profile page info
        const profileRef = doc(db, "users", profileId);
        await updateDoc(profileRef, {
            followCount: increment(-1)
        })
        await updateDoc(userRef, {
            followed: arrayRemove(userId)
            });
    }

    function handleFollow() {
        if (followed) {
            setTempFollowCount((preVal) => preVal -= 1)
            unfollowUser(profileId)
            setFollowed(false)
        } else {
            setTempFollowCount((preVal) => preVal += 1)
            followUser(profileId)
            setFollowed(true)
        }
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
                <div className='user-follow'>
                    Followers: {tempFollowCount}
                    {!isUser && <button className='follow-button' onClick={handleFollow}>
                        {followed? 'Unfollow' : 'Follow'}
                    </button>}
                </div>
                <div className='user-creation-date'>
                   <Icons.Calendar /> Joined {convertDate(profileInfo?.creationDate)}
                </div>
                <div className='user-info-description'>
                    {profileInfo?.description || 'Nothing about this user yet!'}
                </div>
            </div>
            <UserProfileToggle />
        </div>}
    </div>
}