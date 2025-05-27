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

    const [profileInfo, getProfileInfo] = React.useState()
    const location = useLocation();
    const userId = location.pathname.split('/').at(-1)
    const navigate = useNavigate()

    const isUser = user?.uid == userId

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
        const profileInfo = await getUserInfo(userId)
        getProfileInfo(profileInfo)
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
            const response = await fetch(`${APILINK}/user/${userId}`, {
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
                        {data.postContent.socials.likes}
                    </div>
                    <div className='IP-socials-individual'>
                        <Icons.Comment />
                        {data.postContent.socials.comments.length}
                    </div>
                    <div className='IP-socials-individual'>
                        <Icons.Share />
                        {data.postContent.socials.shares}
                    </div>
                </div>
                <div className='IP-interact'>
                    <h5>Like</h5>
                    <h5 onClick={() => navigate(`/posts/${data._id}`)}>Comment</h5>
                    <h5>Share</h5>
                </div>
            </div>
        }

        return <div className='user-posts-body'>
            {userPosts && userPosts.map((post) => 
                <IndividualUserPost data={post} />
            )}
        </div>
    }

    return <div className='user-profile-outer-body'>
        {profileInfo && <div className='user-profile-inner-body'>
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
            <UserPosts />
        </div>}
    </div>
}