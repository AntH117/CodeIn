import './Home.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Home() {
    //user
    const { user } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
     
    const [posts, setPosts] = React.useState([])

    //Temp looking for posts with Anthony
    // const APILINK = user ? `http://localhost:5000/api/v1/codeIn/user/${user.uid}` : `http://localhost:5000/api/v1/codeIn/user/Anthony`
    const APILINK = 'http://localhost:5000/api/v1/codeIn/posts/'

    const getPosts = async () => {
        try {
            const response = await fetch(APILINK, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setPosts(data)
        } catch (e) {
            console.error('Unable to load posts:', e)
        }
      };

    React.useEffect(() => {
        getPosts()
    }, [location])

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
    function IndividualPost({data}) {
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
        },[])

    
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
              <div style={gridStyle} className='IP-image-container'  onClick={() => navigate(`/posts/${data._id}`)}>
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

        return <div className='IP-body'>
            <div className='IP-title'>
                <h2 onClick={() => navigate(`/posts/${data._id}`)}>{data.postContent.title}</h2>
            </div>
                <div className='IP-author-date'>
                    <div className='IP-author-image'>
                        <img src={authorInfo?.photoUrl || testImage}></img>
                    </div>
                    <h4><span style={{cursor: 'pointer'}} onClick={() => navigate(`/users/${data.user}`)}>{ 
                    authorInfo?.displayName || authorInfo?.email
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

    function handleSignOut() {
        if (window.confirm('Are you sure you want to sign out?')) {
            signOut(auth)
        }
    }

    return <div className='home'>
        <div className='nav-bar'>
            <Link to={'/'} style={{color: 'black', textDecoration: 'none'}}>Home</Link>
            {user ? 
            <Link to={`/users/${user.uid}`} style={{color: 'black', textDecoration: 'none'}}>Profile</Link>  
            : 
            <Link to={'/login'} style={{color: 'black', textDecoration: 'none'}}>Login</Link>  
            }
            {
            user && <div onClick={handleSignOut} style={{cursor: 'pointer'}}>Sign Out</div>
            }
        </div>
        <div className='news-feed-body'>
                <div className='news-feed'>
                {(location.pathname == '/' || location.pathname == '/post') && posts.slice().reverse().map((data) => {
                        return <IndividualPost data={data}/>
                    })}
                    {
                    location.pathname == '/' && <div className='create-post'>
                    {user && <button className='create-post-button'>
                        <Link to={'/post'} style={{color: 'white', textDecoration: 'none'}}>Create Post</Link>
                    </button>}
                </div>
                    }
                </div>
                {
                location.pathname !== '/' && 
                <div className='outlet'>
                    <Outlet />
                </div>
                }
            </div>
    </div>
}