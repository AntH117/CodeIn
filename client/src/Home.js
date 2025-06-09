import './Home.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import IndividualPost from './IndividualPost';

export default function Home() {
    
    //user
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    //handle loading
    const [loading, setLoading] = React.useState(true)
    React.useEffect(() => {
        getPosts()
    }, [location])

    //Get logged in user into
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
        const response = await getUserInfo(user?.uid)
        setLoggedUserData(response)
    }
    const [posts, setPosts] = React.useState([])

    //get liked posts
    const [loggedUserData, setLoggedUserData] = React.useState(null)
    React.useEffect(() => {
        if (user) {
            awaitUserData()
        }
    },[user])

    //get filters based on search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = React.useState({
        tag: searchParams.get("tag") || "",
        type: searchParams.get("type") || "",
      });

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
        } finally {
            setLoading(false)
        }
      };
    
    function handleSignOut() {
        if (window.confirm('Are you sure you want to sign out?')) {
            signOut(auth)
        }
    }

    //reversed posts
    const reversedPosts = React.useMemo(() => posts.slice().reverse(), [posts]);
    

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
                    {location.pathname == '/' && <div className='home-interaction'>
                        {(!loading && user) &&<div className='create-post'>
                        <button className='create-post-button'>
                            <Link to={'/post'} style={{color: 'white', textDecoration: 'none'}}>Create Post</Link>
                        </button>
                        </div>}
                        <div className='home-filter'>
                            <Icons.Filter />
                        </div>
                    </div>}
                {loading &&
                    <span class="loader"></span>
                }
                {!loading && <div className='individual-post-bodies'>
                    {(location.pathname == '/' || location.pathname == '/post') && reversedPosts.map((data) => {
                        return <IndividualPost data={data} key={data._id}/>
                    })}
                </div>}
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