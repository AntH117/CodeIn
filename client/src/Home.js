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

    const applyFilters = () => {
    const params = {};
        if (filters.tag) params.tag = filters.tag;
        if (filters.type) params.type = filters.type;
        setSearchParams(params);
    };

    React.useEffect(() => {
        applyFilters()
    }, [filters])

    function handleSearchParams(tag) {
        setFilters({ ...filters, tag: tag })
    }

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

    function FilterTag({tag}) {

        return <div className='filter-tag-body'>
                {tag}
                <div className='form-tag-delete' onClick={() => setFilters((preVal) => {
                    return {
                        ...preVal,
                        tag: ''
                    }
                })}>
                  <Icons.X />
                </div>
        </div>
    }
    //simple filter, should change as website gets larger
    const filteredPosts = filters.tag !== '' ?  posts.filter((post) => {
        return post.postContent.tags.includes(filters.tag)
    }) : posts
    
    //reversed posts
    const reversedPosts = React.useMemo(() => filteredPosts.slice().reverse(), [posts]);
    

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
                        <div className='home-filter-body'>
                            <div className='home-filter'>
                                <Icons.Filter />
                            </div>
                            {filters.tag !== '' && <FilterTag tag={filters.tag}/>}
                        </div>
                    </div>}
                {loading &&
                    <span class="loader"></span>
                }
                {!loading && <div className='individual-post-bodies'>
                    {(location.pathname == '/' || location.pathname == '/post') && reversedPosts.map((data) => {
                        return <IndividualPost data={data} key={data._id} handleSearchParams={handleSearchParams}/>
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