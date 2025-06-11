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
        sort: searchParams.get("sort") || "",
      });


    const applyFilters = () => {
        const params = {};
        if (filters.tag) params.tag = filters.tag;
        if (filters.sort) params.sort = filters.sort;
        setSearchParams(params);
    };

    const [posts, setPosts] = React.useState([])
    const [filteredPosts, setFilteredPosts] = React.useState(posts)

    function filterPosts() {
        let filtered = posts;
        if (filters.tag) {
            filtered = filters.tag !== '' ?  posts.filter((post) => {
                return post.postContent.tags.includes(filters.tag)
            }) : posts
        }
        if (filters.sort) {
            switch (filters.sort) {
                case 'newest':
                    filtered = filtered.slice().reverse()
                    break;
                case 'oldest':
                    //Default behaviour
                    break;
                case 'likes':
                    filtered = filtered.sort((a,b) => b.likeCount - a.likeCount)
                    break;
                case 'comments':
                    filtered = filtered.sort((a,b) => b.commentCount - a.commentCount)
                    break;
            }  
        }
        setFilteredPosts(filtered)
    }
    React.useEffect(() => {
        filterPosts()
    }, [searchParams, posts])
    
    //simple filter, should change as website gets larger
    //reversed posts
        

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

    function Filters() {
        const [expand, setExpand] = React.useState()
        const sortBy = ['newest', 'oldest', 'likes', 'comments']
        const [temp, setTemp] = React.useState({
            sort: filters.sort,
            tag: filters.tag
        })

        function capitalizeFirstLetter(val) {
            return String(val).charAt(0).toUpperCase() + String(val).slice(1);
        }

        const handleApply = () => {
            if (temp.sort) setFilters((preVal) => {return {...preVal, ['sort']: temp.sort}})
        }

        function FilterDropDownMenu({options}) {
            const [open, setOpen] = React.useState(false)
    
            return <div className='filter-sort-dropdown'>
            <button class="filter-drop-toggle" type="button" onClick={() => setOpen((preVal) => !preVal)}>
                {temp.sort ? capitalizeFirstLetter(temp.sort) : 'Sort By'}
            </button>
            {open && <div class="filter-drop-down">
                {options.map((item) => {
                    return <button className='filter-drop-option' onClick={() => setTemp((preVal) => {return {...preVal, ['sort']: item}})}>
                        {capitalizeFirstLetter(item)}
                    </button>
                })}
            </div>}
        </div>
        }

        React.useEffect(() => {
            if (expand) {
                setTimeout(() => {
                    document.getElementById('home-filter').style.overflow = "";
                }, [500])
            } else {
                document.getElementById('home-filter').style.overflow = 'hidden';
            }
        }, [expand])

        return (
        <div className='home-filter-body'>
            <div className={`home-filter ${expand ? 'expanded' : ''}`} id='home-filter'>
                <div className='home-filter-icon' onClick={() => setExpand((preVal) => preVal == null ? true : !preVal)}>
                    <Icons.Filter />
                </div>
                <div className='home-filter-options'>
                    <FilterDropDownMenu options={sortBy}/>
                    <button className='filter-apply' onClick={handleApply}>
                        Apply
                    </button>
                </div>
            </div>
            {filters.tag !== '' && <FilterTag tag={filters.tag}/>}
        </div>
        )
    }

    return <div className='home'>
        <div className='nav-bar'>
            <Link to={'/'} style={{color: 'black', textDecoration: 'none'}} onClick={() => setFilters({tag: '', sort: ''})}>Home</Link>
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
                        <Filters />
                    </div>}
                {loading &&
                    <span class="loader"></span>
                }
                {!loading && <div className='individual-post-bodies'>
                    {(location.pathname == '/' || location.pathname == '/post') && filteredPosts.map((data) => {
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