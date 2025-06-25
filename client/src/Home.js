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
import ShowAlert from './ShowAlert';
import { Toaster, toast } from 'react-hot-toast';
import notify from './Toast';

export default function Home() {
    //user
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    //handle loading
    const [loading, setLoading] = React.useState(true)

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
        try {
            const response = await getUserInfo(user?.uid)
            setLoggedUserData(response)
            //Get tailored posts
            getTailoredPosts(response.followed)
        } catch (e) {
            console.error('Unable to fetch posts')
        }
    }
    //get liked posts
    const [loggedUserData, setLoggedUserData] = React.useState(null)
    React.useEffect(() => {
        if (user) {
            awaitUserData()
        } else {
            //Get public posts
            getPublicPosts()
        }
    },[user, location])

    //get filters based on search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = React.useState({
        tag: searchParams.getAll("tag") || [],
        sort: searchParams.get("sort") || "",
      });


    const applyFilters = () => {
        const params = new URLSearchParams();
        filters.tag.forEach(tag => params.append('tag', tag));
        if (filters.sort) params.set('sort', filters.sort);
        setSearchParams(params);
    };

    const [posts, setPosts] = React.useState([])
    const [filteredPosts, setFilteredPosts] = React.useState(posts)
    const [visibleCount, setVisibleCount] = React.useState(3)
    const visiblePosts = filteredPosts.slice(0, visibleCount);


    const scrollRef = React.useRef(null);

    //Handle lazy loading
    React.useEffect(() => {
        const scroll = scrollRef.current;
    
        const handleScroll = () => {
          if (!scroll) return;
    
          const { scrollTop, scrollHeight, clientHeight } = scroll;
          if (scrollTop + clientHeight >= scrollHeight - 100) {
            setVisibleCount((prev) => prev + 3);
          }
        };
    
        if (scroll) {
          scroll.addEventListener('scroll', handleScroll);
        }
    
        return () => {
          if (scroll) {
            scroll.removeEventListener('scroll', handleScroll);
          }
        };
      }, []);


    function filterPosts() {
        let filtered = posts;
        if (filters.tag.length > 0) {
            filtered = posts.filter(post =>
                filters.tag.every(tag =>
                  post.postContent.tags.some(t => 
                    t.toLowerCase() === tag.toLowerCase()
                  )
                )
              )
        }
        if (filters.sort) {
            switch (filters.sort) {
                case 'newest':
                    filtered = compareTime(filtered, 'newest')
                    break;
                case 'oldest':
                    filtered = compareTime(filtered, 'oldest')
                    break;
                case 'likes':
                    filtered = filtered.sort((a,b) => b.likeCount - a.likeCount)
                    break;
                case 'comments':
                    filtered = filtered.sort((a,b) => b.commentCount - a.commentCount)
                    break;
                case 'followed':
                    filtered = filtered.filter((post) => loggedUserData?.followed.includes(post.user))
            }  
        }
        setFilteredPosts(filtered)
    }
    React.useEffect(() => {
        filterPosts()
    }, [searchParams, posts])
    
    function compareTime(filtered, sort) {
        filtered = filtered.sort((a,b) => {
            const aTime = new Date(a.postContent.time)
            const bTime = new Date(b.postContent.time)
            if (sort == 'newest') {
                return bTime - aTime
            } else if (sort == 'oldest') {
                return aTime - bTime
            }
        })
        return filtered
    }

    
    React.useEffect(() => {
        applyFilters()
    }, [filters])

    function handleSearchParams(tag) {
        if (!filters.tag.includes(tag)) {
            setFilters({ ...filters, tag: [...filters.tag, tag] })
        }
    }

    const publicAPI = 'http://localhost:5000/api/v1/codeIn/posts/'
    
    const getPublicPosts = async () => {
        try {
            const response = await fetch(publicAPI, {
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
    const tailoredAPI = 'http://localhost:5000/api/v1/codeIn/posts/tailored'
    const getTailoredPosts = async (followedIds) => {
        const userId = user.uid
        try {
            const response = await fetch(tailoredAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([userId, ...followedIds])
            });
            const data = await response.json();
            setPosts(data)
        } catch (e) {
            console.error('Unable to load posts:', e)
        } finally {
            setLoading(false)
        }
    };

    const [confirmSignOut, setConfirmSignOut] = React.useState(null)

    function handleSignOut() {
        setConfirmSignOut(false)
    }

    function FilterTag({tag}) {

        return <div className='filter-tag-body'>
                {tag || null}
                <div className='form-tag-delete' onClick={() => setFilters((preVal) => {
                    return {
                        ...preVal,
                        tag: preVal.tag.filter(x => x!== tag)
                    }
                })}>
                  <Icons.X />
                </div>
        </div>
    }

    function Filters() {
        const [expand, setExpand] = React.useState()
        const sortBy = ['newest', 'oldest', 'likes', 'comments', 'followed']
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
        <>
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
        </div>
        {filters.tag?.length > 0 && filters.tag.map((tag) => {return  <FilterTag tag={tag}/>})}
        {filters.tag?.length > 1 && <div className='filter-clear-all' onClick={() => setFilters((preVal) => {
            return {...preVal, tag: []}
        })}> 
            Clear All
        </div>}
        </>
        )
    }

    function FilterByTag() {
        const handleAddTag = () => {
            const tagName = document.getElementById('tag-name').value
            if (tagName && !filters.tag.includes(tagName)) {
                setFilters({ ...filters, tag: [...filters.tag, tagName] })
            }
        }
        

        return <div className='filter-by-tag'>
            <input type='text' className='filter-by-tag-input' placeholder='Tags' id='tag-name'>
            </input>
            <button className='filter-by-tag-add' onClick={handleAddTag}>
                <Icons.PlusLarge />
            </button>
        </div>
    }
    // onClick={() => navigate(`/users/${user.uid}`)}
    function NavBar () {
        function UserDisplay() {
            const [open, setOpen] = React.useState(false)
            return <>
            <div className='nav-user-display'>
                <div className='nav-user-image'>
                    <img src={loggedUserData?.photoURL || "http://localhost:5000/uploads/final/Temp-profile-pic.png"}>
                    </img>
                </div>
                <div className='nav-user-name'>
                    <div className='nav-user-display-name'>
                            {loggedUserData?.displayName}
                        </div>
                    <div className='nav-user-display-tag'>
                        @{loggedUserData?.displayTag}
                    </div>
                </div>
                <div className='nav-user-dropdown' onClick={() => setOpen((preVal) => !preVal)}>
                    <Icons.ArrowDown />
                </div>
                {<div className={`nav-user-options ${open ? 'open' : ''}`}>
                    <div className='user-dropdown-option'onClick={() => navigate(`/users/${user?.uid}`)}>Profile</div>
                    <div className='user-dropdown-option' onClick={handleSignOut}>Sign Out</div>
                </div>}
            </div>
            </>
        }

        return (
            <div className='nav-bar'>
                <Link to={'/'} style={{color: 'black', textDecoration: 'none'}} onClick={() => setFilters({tag: [], sort: ''})}>Home</Link>
                {user ? 
                <UserDisplay />
                : 
                <Link to={'/login'} style={{color: 'black', textDecoration: 'none'}}>Login</Link>  
                }
        </div>
        )
    }

    return <div className='home'>
        <Toaster />
        <NavBar />
        {confirmSignOut == false && <ShowAlert confirm={true} message={'Are you sure you want to sign out?'} setConfirmation={setConfirmSignOut} callback={() => {
            signOut(auth)
            notify.success('Successfully signed out')
        }}/>}
        <div className='news-feed-body'>
                <div className='news-feed' ref={scrollRef}>
                    {location.pathname == '/' && <div className='home-interaction'>
                        {(!loading && user) &&<div className='create-post'>
                        <button className='create-post-button'>
                            <Link to={'/post'} style={{textDecoration: 'none'}}>Create Post</Link>
                        </button>
                        </div>}
                        <FilterByTag />
                        <Filters />
                    </div>}
                {loading &&
                    <span class="loader"></span>
                }
                {!loading && <div className='individual-post-bodies'>
                    {(location.pathname == '/' || location.pathname == '/post') && visiblePosts.map((data) => {
                        return <IndividualPost data={data} key={data._id} handleSearchParams={handleSearchParams}/>
                    })}
                    {filteredPosts.length == 0 && <div>No posts found</div>}
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