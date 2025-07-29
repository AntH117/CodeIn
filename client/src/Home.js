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
import CodeInLogo from './images/codeIn-logo.png'
import Skeleton from './skeleton/Skeleton';
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "./ThemeContext";

function NavBar ({scrollRef, loggedUserData, setFilters, setConfirmSignOut, setToTop}) {
    const { isDarkMode } = useTheme();
    const [navHidden, setNavHidden] = React.useState(false)
    const lastScrollTop = React.useRef(0);
    const navigate = useNavigate()
    const [profileImageLoaded, setProfileImageLoaded] = React.useState(false)
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const { user } = useAuth();

    // Handle scroll event listener
    React.useEffect(() => {
        if (!scrollRef.current) return;

        const scroll = scrollRef.current
        const handleScroll = () => {
          const { scrollTop, scrollHeight, clientHeight } = scroll;
          if (Math.abs(scrollTop - lastScrollTop.current) < 10) return;
    
          if (scrollTop > lastScrollTop.current) {
            setNavHidden(true);
          } else {
            setNavHidden(false);
          }
          if (scrollTop > clientHeight) {
            setToTop(true)
          } else if (scrollTop < clientHeight) {
            setToTop(false)
          }
          lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
        };
    
        scrollRef.current.addEventListener("scroll", handleScroll);
    
        return () => {
            scroll.removeEventListener("scroll", handleScroll);
        };
      }, []);

    function UserDisplay() {
        const [open, setOpen] = React.useState(false)

        return <>
        <div className={`nav-user-display ${navHidden && 'hidden'}`}>
            <div className='nav-user-image' onClick={() => navigate(`/users/${user.uid}`)}>
                {!profileImageLoaded && <Skeleton.Circle width={'3rem'} height={'3rem'}/>}
                <img src={loggedUserData?.photoURL || `${backendURL}/uploads/final/Temp-profile-pic.png`} onLoad={() => setProfileImageLoaded(true)} style={!profileImageLoaded ? {display: 'hidden'} : {}}>
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
                <div className='user-dropdown-option' onClick={() => setConfirmSignOut(false)}>Sign Out</div>
            </div>}
        </div>
        </>
    }

    function DarkModeToggle() {
        const { isDarkMode, setIsDarkMode } = useTheme();
        const toggleSwitch = () => setIsDarkMode(!isDarkMode)

        return (
        <button 
            className={`toggle-container ${isDarkMode && 'dark'}`} 
            onClick={toggleSwitch}
            style={{
                justifyContent: "flex-" + (!isDarkMode ? "start" : "end"),
            }}
        >
            <motion.div
                    className={`toggle-handle ${isDarkMode && 'dark'}`}
                    layout
                    transition={{
                        type: "spring",
                        visualDuration: 0.2,
                        bounce: 0.2,
                    }}
            >
            </motion.div>
        </button>
        )
    }

    return (
        <div className={`nav-bar ${navHidden && 'hidden'}`}
            style={isDarkMode ? {backgroundColor: 'black', color: 'white'} : {backgroundColor: 'rgba(247,238,226,255)'}}
        >
            <div className='nav-bar-home'>
                <img src={CodeInLogo} className='codeIn-logo' onClick={() => {
                setFilters({tag: [], sort: ''});
                navigate('/')
            }}>
                </img>    
            </div>
            <div className='nav-bar-right'>
                {user ? 
                <UserDisplay />
                : 
                <Link to={'/login'} style={{color: 'black', textDecoration: 'none'}}>Login</Link>  
                }
                <DarkModeToggle />
            </div>
    </div>
    )
}

function Filters({filters, setFilters}) {
    const { isDarkMode } = useTheme()
    const location = useLocation()
    const [forcedRefresh, setForcedRefresh] = React.useState(0)
    React.useEffect(() => {
        setForcedRefresh((preVal) => preVal += 1)
    }, [location.search])

    const { user } = useAuth();
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
    
    const renderedTagsRef = React.useRef(new Set());
    function FilterTag({ tag }) {
        const isNew = !renderedTagsRef.current.has(tag);
        return (
          <motion.div   
            className="filter-tag-body"
            initial={isNew  ? { opacity: 0, scale: 0 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layout 
            transition={{
              duration: 0.3,
              scale: { type: 'spring', bounce: 0.4 },
            }}
            onAnimationComplete={() => {
                // Only add to ref once animation is completed
                if (isNew) {
                  renderedTagsRef.current.add(tag);
                }
            }}
          >
            {tag}
            <div
              className="form-tag-delete"
              onClick={() =>
              {
                setFilters((prev) => ({
                    ...prev,
                    tag: prev.tag.filter((x) => x !== tag),
                  }));
                renderedTagsRef.current.delete(tag)
              }
              }
            >
              <Icons.X />
            </div>
          </motion.div>
        );
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
                <FilterDropDownMenu options={user ? [...sortBy, 'followed'] : sortBy}/>
                <button className='filter-apply' onClick={handleApply}>
                    Apply
                </button>
            </div>
        </div>
    </div>
    <AnimatePresence>
        {filters.tag?.length > 0 &&
            filters.tag.map((tag) => {
            return <FilterTag key={tag} tag={tag}/>
        })}
    </AnimatePresence>
    {filters.tag?.length > 1 && <motion.div className='filter-clear-all' onClick={() => {setFilters((preVal) => { return {...preVal, tag: []}});  renderedTagsRef.current.clear()}}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{
            duration: 0.4,
            scale: { type: "spring" },
        }}
        >
        Clear All
    </motion.div>}
    </>
    )
}

export default function Home() {
    //user
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    //handle loading
    const [loading, setLoading] = React.useState(true)
    const [forcedRefresh, setForcedRefresh] = React.useState(0)
    const [postLoad, setPostLoad] = React.useState(false)
    // Force posts to reload on params change
    const [forceParams, setForceParams] = React.useState(0)

    //scrollable div
    const scrollContainerRef = React.useRef(null)

    //dark mode
    const { isDarkMode } = useTheme();

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

    //get filters based on search params
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = React.useState({
        tag: searchParams.getAll("tag") || [],
        sort: searchParams.get("sort") || "",
        });

    // Forces render on search params change
    React.useEffect(() => {
        setForceParams((preVal) => preVal += 1)
        setFilters({
            tag: searchParams.getAll("tag") || [],
            sort: searchParams.get("sort") || "",
            })
    }, [searchParams])
    
    //get liked posts
    const [loggedUserData, setLoggedUserData] = React.useState(null)

    React.useEffect(() => {
        if (location.pathname !== '/post') {
            setLoading(true)
            setTimeout(() => {
                if (postLoad) {
                    setLoading(false)
                }
            }, [1000])
            if (user) {
                awaitUserData()
            } else {
                //Get public posts
                getPublicPosts()
            }
        }
    },[user, forcedRefresh, location.pathname])
    React.useEffect(() => {
        if (postLoad) {
            setLoading(false)
        }
    }, [postLoad])

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
    //Display to top button
    const [toTop, setToTop] = React.useState(false)

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
                    if (user) {
                        filtered = filtered.filter((post) => loggedUserData?.followed.includes(post.user))
                    }
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

    const publicAPI = `${backendURL}/api/v1/codeIn/posts/`
    const [loadingError, setLoadingError] = React.useState(false)

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
            setLoadingError(true)
        } finally {
            // setLoading(false)
        }
      };
    const tailoredAPI = `${backendURL}/api/v1/codeIn/posts/tailored`
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
            setLoadingError(true)
        } finally {
            // setLoading(false)
        }
    };

    const [confirmSignOut, setConfirmSignOut] = React.useState(null)

    function handleSignOut() {
        signOut(auth)
        notify.success('Successfully signed out')
        
    }



    function FilterByTag() {
        const handleAddTag = () => {
            const tagName = document.getElementById('tag-name').value.trim();
            if (tagName && !filters.tag.includes(tagName)) {
                setFilters({ ...filters, tag: [...filters.tag, tagName] })
            }
        }
        

        return (
        <div className='filter-by-tag'>
            <input type='text' className='filter-by-tag-input' placeholder='Tags' id='tag-name' autocomplete="off"
                style={isDarkMode ? {backgroundColor: 'gray', color: 'white'} : {backgroundColor: 'white'}}
            >
            </input>
            <button className='filter-by-tag-add' onClick={handleAddTag}>
                <Icons.PlusLarge />
            </button>
        </div>)
    }

    const scrollToTop = () => {
        scrollRef.current?.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      };

    function CreatePostButton() {

        return (
            <motion.button className='create-post-button'  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Link to={'/post'} style={{textDecoration: 'none', color: 'white'}}>Create Post</Link>
            </motion.button>
        )
    }

    function ForceRefreshButton() {

        return (
            <motion.div className='forced-refresh'   initial={{ rotate: 0 }} whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
            <Icons.Refresh />
             </motion.div>
        )
    }

    return <div className='home'>
        <Toaster />
        {<NavBar scrollRef={scrollRef} loggedUserData={loggedUserData} setFilters={setFilters} setConfirmSignOut ={setConfirmSignOut} setToTop={setToTop}/>}
        {confirmSignOut == false && <ShowAlert confirm={true} message={'Are you sure you want to sign out?'} setConfirmation={setConfirmSignOut} callback={() => handleSignOut()}/>}
        <div className='news-feed-body'>
                <div className='news-feed-absolute-container'>  
                    <div className='news-feed-relative-container'>
                        <button className={`to-top-button ${!toTop && 'hidden'}`} disabled={!toTop} onClick={scrollToTop}>
                            <Icons.ArrowUp color={'white'}/>
                        </button>
                    </div>
                </div>
                <div className='news-feed' ref={scrollRef}
                    style={isDarkMode ? {backgroundColor: 'black'} : {backgroundColor: 'rgba(247,238,226,255)'}}
                >
                    {(location.pathname == '/' && !loading) && <div className='home-interaction'>
                        {(!loading && user) && <div className='create-post'>
                        <CreatePostButton />
                        <ForceRefreshButton />
                        </div>}
                        <FilterByTag />
                        <Filters filters={filters} setFilters={setFilters} />
                    </div>}
                    {(loading && location.pathname == '/') &&
                        <Skeleton.Home />
                    }
                    {loadingError && <div>Error loading posts</div>}
                    {(location.pathname == '/' || '/post') && <div className={`individual-post-bodies ${loading ? 'hidden' : ''}`}>
                        {(location.pathname == '/' || location.pathname == '/post') && visiblePosts.map((data) => {
                            return <IndividualPost data={data} key={data._id} handleSearchParams={handleSearchParams} setPostLoad={setPostLoad} />
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