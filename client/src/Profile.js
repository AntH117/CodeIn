import './Profile.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from './firebase';
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import IndividualPost from './IndividualPost';
import { doc, getDoc, setDoc, updateDoc, increment  } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import NotFound from './NotFound';
import notify from './Toast';
import ShowAlert from './ShowAlert';
import Skeleton from './skeleton/Skeleton';

export default function Profile () {
    const { user } = useAuth();
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const [profileInfo, setProfileInfo] = React.useState()
    const [loggedUserInfo, setLoggedUserInfo] = React.useState()
    const [tempFollowCount, setTempFollowCount] = React.useState(0)
    const [followed, setFollowed] = React.useState(false)
    const location = useLocation();
    const { profileId } = useParams();
    const navigate = useNavigate()
    const [loadingError, setLoadingError] = React.useState(false)
    const [forcedRefresh, setForcedRefresh] = React.useState(0)
    

    //handle loading
    const [loading, setLoading] = React.useState(true)
    const isUser = user?.uid == profileId

    //handle image loading
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
        if (profileInfo) {
            setTempFollowCount(profileInfo?.followCount)
            setFollowed(loggedUserInfo?.followed.includes(profileId))
        }
    }, [profileInfo])

    
    React.useEffect(() => {
        if (user?.uid) {
            getLoggedUserInfo()
        }

        //reset loading error state
        setLoadingError(false)
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
            if (profileInfo) {
                setProfileInfo(profileInfo)
            } else {
                setLoadingError(true)
            }
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
        setLoading(true)
        getAuthorInfo()
    },[location])


    //display user only posts
    function UserPosts({onLoaded}) {
    const [postLoad, setPostLoad] = React.useState(false)

    React.useEffect(() => {
        if (postLoad) {
            onLoaded()
        }
    }, [postLoad])

    //get user only posts
    const [userPosts, setUserPosts] = React.useState()  
    const APILINK = `${backendURL}/api/v1/codeIn`


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

        React.useEffect(() => {
            getPosts()
        }, [location])

        let filteredPosts = []
        if (!user || !loggedUserInfo?.followed.includes(profileId)) {
            filteredPosts = userPosts?.filter((post) => post.postContent.visibility === 'Public');
        } else if (user && loggedUserInfo?.followed.includes(profileId)) {
            filteredPosts = userPosts?.filter((post) => post.postContent.visibility !== 'Private')
        } else if (user && loggedUserInfo.uid == profileId) {
            filteredPosts = userPosts;
        }
        
        return <div className='individual-post-body'>
            {userPosts && filteredPosts.map((post) => 
                <IndividualPost data={post} setPostLoad={setPostLoad}/>
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
        const [loaded, setLoaded] = React.useState(false)
        const [forcedRefresh, setForcedRefresh] = React.useState(0)
        const CommentAPILINK = `${backendURL}/api/v1/comments`
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
                setLoaded(true)
            }
        }

        React.useEffect(() => {
            getUserComments()
        }, [forcedRefresh])

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
            const [confirmDeleteComment, setConfirmDeleteComment] = React.useState(null)
            function handleDeleteComment() {
                setConfirmDeleteComment(false)
            }
            const deleteComment = async (commentId, postId) => {
                notify.progress('Deleting comment...')
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
                    notify.success('Comment deleted successfully')
                    setForcedRefresh((preVal) => preVal += 1)
                } else {
                    console.error('Backend Error', result.error)
                }
            } catch (e) {
                notify.error('Error deleting comment')
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
                    {confirmDeleteComment === false && <ShowAlert confirm={true} message={'Are you sure you want to delete this comment?'} 
                        setConfirmation={setConfirmDeleteComment}
                        callback={() => deleteComment(data._id, data.postId)}
                    />}
                    {user?.uid === userInfo?.uid &&<div className='IC-delete' onClick={() => handleDeleteComment()}>
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
            <div className='user-comments-body'>
                {userComments.length > 0 && userComments.map((comment) => {
                    return <IndividualComment data={comment}/>
                })}
                {(userComments.length == 0 && loaded) && <p>No comments yet!</p>}
            </div>
        </>
    }

    //User likes
    function UserLikes({onLoaded}) {
        const [postLoad, setPostLoad] = React.useState(false)
        React.useEffect(() => {
            if (postLoad) {
                onLoaded()
            }
        }, [postLoad])
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
            const APILINK = `${backendURL}/api/v1/codeIn/posts/batch`
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
            }
    }

    return (
        <div className='individual-post-body'>
            {likedPosts?.length > 0 && likedPosts.map((post) => {
            return <IndividualPost data={post} setPostLoad={setPostLoad}/>
        })}
        {likedPosts?.length < 1 && <p>Nothing liked yet!</p>}
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
                case 'Followed':
                    return <UserFollowed onLoaded={() => setToggleLoading(false)}/>
        }
        }
        return (<>
            <div className='user-profile-toggle'>
                <ToggleOption name={'Posts'}/>
                <ToggleOption name={'Comments'}/>
                <ToggleOption name={'Likes'}/>
                <ToggleOption name={'Followed'}/>
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

    function UserFollowed({onLoaded}) {
        const [followed, setFollowed] = React.useState([])
        async function getUserInfo(uid) {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data(); // { displayName, photoURL, email }
            } else {
                return null;
            }
        }        
        
        async function displayFollowed(followed) {
            try {
                const promises = followed.map(async (user) => {
                    const response = await getUserInfo(user);
                    // followedInfo.push(response)
                    return response;
                });
                const results = await Promise.all(promises);
                setFollowed(results)
            } catch (e) {
                console.error('User not found')
            } finally {
                onLoaded()
            }
        }
        //get profile info && followed info
        async function awaitUserData() {
            try {
                //get profile info
                const response = await getUserInfo(profileId)
                //get followed info
                displayFollowed(response.followed)
            } catch (e) {

            }
        }
        React.useEffect(() => {
            awaitUserData()
        }, [])

        function IndividualUser({user}) {
            return (
                <div className='IU-body' onClick={() => navigate(`/users/${user.uid}`)}>
                    <div className='IU-left'>
                        <div className='IU-pfp'>
                            <img src={user.photoURL}>
                            </img>
                        </div>
                        <div className='IU-display-body'>
                            <span className='IU-display-name'>{user.displayName}</span>
                            <span className='IU-display-tag'>@{user.displayTag}</span>
                        </div>
                    </div>
                    <div className='user-creation-date'>
                        <Icons.Calendar /> Joined {convertDate(user.creationDate)}
                    </div>
                </div>
            )
        }

        return (
            followed.length > 0 ? <div className='user-profile-followed-body'>
                {followed.map((user) => {
                    return IndividualUser({user: user})
                })}
            </div> : <p>
                No-one followed yet!
            </p>
        )
    }

    return <div className='user-profile-outer-body'>
        {(loading && !loadingError) && <Skeleton.Profile />}
        {/* <span class="loader"></span> */}
        {loadingError && <NotFound />}
        {!loading && <div className='user-profile-inner-body'>
            <div className='user-background'>
                {profileInfo?.backgroundURL ? <img className='user-background-image' src={profileInfo?.backgroundURL}>
                </img> : <div className='default-background'></div>}
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
                    {!isUser && <button className={`follow-button ${followed ? 'active' : ''}`} onClick={handleFollow}>
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