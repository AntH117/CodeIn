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
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import IndividualPost from './IndividualPost';
import ShowAlert from './ShowAlert';
import { Toaster, toast } from 'react-hot-toast';
import notify from './Toast';
import CodeInLogo from './images/codeIn-logo.png'
import Skeleton from './skeleton/Skeleton';
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "./ThemeContext";


function DarkModeToggle() {
    const { isDarkMode, setIsDarkMode } = useTheme();
    const toggleSwitch = () => setIsDarkMode(!isDarkMode)

    return (
    <button 
        className={`toggle-container ${isDarkMode && 'dark'}`} 
        onClick={toggleSwitch}
    >
        <motion.div
            className={`toggle-handle ${isDarkMode && 'dark'}`}
            initial={false}
            animate={{ 
                x: isDarkMode ? 22 : 0,
                backgroundColor: isDarkMode ? "#B0C4DE" : "#f1d884",
            }}
            transition={{
                type: "spring",
                duration: 0.5,
                bounce: 0.2,
            }}
        />
    </button>
    )
}

function SearchBar({filters, setFilters}) {
    const { isDarkMode } = useTheme();
    const [focus, setFocus] = React.useState()
    const [searchCriteria, setSearchCriteria] = React.useState('')
    const [searchResults, setSearchResults] = React.useState([])
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const searchRef = React.useRef()

    //Check if user clicked outside the searchRef
    React.useEffect(() => {
        function handleClickOutside(event) {
          if ((focus && searchRef.current) && !searchRef.current.contains(event.target)) {
            setFocus(false)
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [focus]);

    function TagResults() {
        const tagsAPI = `${backendURL}/api/v1/codeIn/tags/${searchCriteria}`
        const [tagResults, setTagResults] = React.useState()
        const [loaded, setLoaded] = React.useState(false)

        const getTags = async () => {
            try {
                const response = await fetch(tagsAPI, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                console.log(data)
                setTagResults(data)
            } catch (e) {
                console.error('Unable to fetch tags:', e)
            } finally {
                setLoaded(true)
            }
          };

        React.useEffect(() => {
            getTags()
        }, [])

        function SearchTags({value, amount}) {
            return (
            <motion.div className='individual-search-tag'
                style={isDarkMode ? {backgroundColor: 'rgb(30, 30, 30)', color: 'rgb(237, 237, 237)'} : {backgroundColor: 'rgb(255, 250, 242)', color: 'black'}}
                whileHover={{
                    backgroundColor: isDarkMode ? "#3C3F51" : "#f0f0ff"
                  }}
                  onClick={() => {setFilters({ ...filters, tag: [value] }); setFocus(false); setSearchCriteria(value)}}
            >
                <Icons.LookingGlass color={isDarkMode ? 'rgb(237, 237, 237)' : 'gray'}/>
                {`#${value}`}
                <span className='individual-tag-amount'>
                    {amount && amount}
                </span>
            </motion.div>)
        }

        return <div className='search-bar-tag-container'>
           <SearchTags value={`${searchCriteria}`}/>
           {loaded && tagResults?.map((tag) => (
            <SearchTags value={tag.tag} amount={tag.count}/>
           ))}
           {!loaded && <div className='search-loader'>
                    <span class="loader" style={isDarkMode ? {color: 'white'} : {color: 'black'}}></span>
            </div>}
        </div>
    }

    function UserResults() {
        const [userResults, setUserResults] = React.useState([])
        async function searchUsers(search) {
            if (!search) return [];

            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("displayName"), limit(20));
            const snapshot = await getDocs(q);
        
            setUserResults(snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(user => user.displayName?.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 3))
        }

        React.useEffect(() => {
            searchUsers(searchCriteria)
        }, [searchCriteria])
        console.log(userResults)

        function IndividualUserResult({user}) {
            const navigate = useNavigate()  
            return <motion.div className='user-result-body'
                style={isDarkMode ? {backgroundColor: 'rgb(30, 30, 30)', color: 'rgb(237, 237, 237)'} : {backgroundColor: 'rgb(255, 250, 242)', color: 'black'}}
                whileHover={{
                    backgroundColor: isDarkMode ? "#3C3F51" : "#f0f0ff"
                }}
                onClick={() => {navigate(`/users/${user.uid}`); setFocus(false)}}
            >
                <div className='user-result-image'>
                   <img src={user.photoURL}></img>
                </div>
                <p>{user.displayName}</p>
                <p><span style={{color: 'gray'}}>@{user.displayTag}</span></p>
            </motion.div>
        }

        return <div className='search-bar-user-container'>
            {userResults.map((x) => {
                return <IndividualUserResult user={x}/>
            })}
        </div>
        
    }

    return (
        <div className='nav-bar-search'>
        <input className='search-bar'
            placeholder='Search'
            style={isDarkMode ? {backgroundColor: 'rgb(30, 30, 30)', color: 'rgb(237, 237, 237)'} : {backgroundColor: 'rgb(255, 250, 242)', color: 'black'}}
            onChange={(e) => setSearchCriteria(e.target.value)}
            value={searchCriteria}
            onClick={() => setFocus(true)}
            onFocus={() => setFocus(true)}
        />    
        <div className='search-bar-icon'>
         <Icons.LookingGlass 
            color={isDarkMode ? 'rgb(237, 237, 237)' : 'gray'}
         />    
        </div>
        {focus && 
        <div className={`search-dropdown ${isDarkMode && 'dark'}`} ref={searchRef}>
            {searchCriteria.length == 0 && <p style={{marginTop: '2rem'}}>Try searching for people or tags</p>}
            {searchCriteria.length > 0 && <div className='search-result-body'>
                <TagResults />
                <UserResults />
            </div>}
        </div>
        }         
    </div>
    )
}

function NavBar ({scrollRef, loggedUserData, filters, setFilters, setConfirmSignOut, setToTop, isDesktop}) {
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
        if (isDesktop) return;
        
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
                <div className={`user-dropdown-option ${isDarkMode && 'dark'}`} onClick={() => navigate(`/users/${user?.uid}`)}>Profile</div>
                {!isDesktop && <div className={`user-dropdown-option ${isDarkMode && 'dark'}`} onClick={() => navigate(`/settings`)}>Settings</div>}
                <div className={`user-dropdown-option ${isDarkMode && 'dark'}`}  onClick={() => setConfirmSignOut(false)}>Sign Out</div>
            </div>}
        </div>
        </>
    }

    return (
        <div className={`nav-bar ${navHidden && 'hidden'}`}
            style={isDarkMode ? {backgroundColor: '#121212', color: '	#EDEDED', borderBottom: '1px solid #2C2C2C'} : {backgroundColor: 'rgba(247,238,226,255)', boxShadow: '0px 2px 2px 0px rgba(0, 0, 0, 0.137)'}}
        >
            <div className='nav-bar-home'>
                <img src={CodeInLogo} className='codeIn-logo' onClick={() => {
                setFilters({tag: [], sort: ''});
                navigate('/')
            }}>
                </img>    
            </div>
            {isDesktop && <SearchBar setFilters={setFilters} filters={filters}/>}
            <div className='nav-bar-right'>
                {user && !isDesktop ? 
                <UserDisplay filters={filters} setFilters={setFilters}/>
                :
                user && isDesktop ?
                null
                : 
                <Link to={'/login'} style={isDarkMode ? {color: 'rgb(237, 237, 237)', textDecoration: 'none'}: {color: 'black', textDecoration: 'none'}}>Login</Link>  
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
        {open && <div class={`filter-drop-down ${isDarkMode && 'dark'}`}>
            {options.map((item) => {
                return <button className={`filter-drop-option ${isDarkMode && 'dark'}`} onClick={() => setTemp((preVal) => {return {...preVal, ['sort']: item}})}>
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

    //Check for desktop
    const [isDesktop, setIsDesktop] = React.useState(window.innerWidth > 1024);

    React.useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
      }, []);

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
    
        // clean up
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
            <input type='text' className={`filter-by-tag-input ${isDarkMode && 'dark'}`} placeholder='Tags' id='tag-name' autocomplete="off"
                style={isDarkMode ? {backgroundColor: '	#1E1E1E', color: '	#EDEDED'} : {backgroundColor: 'white'}}
            >
            </input>
            <button className='filter-by-tag-add' onClick={handleAddTag}>
                <Icons.PlusLarge 
                    color={isDarkMode ? '#EDEDED' : ""}
                />
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
            <motion.button className='create-post-button'  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 300 }} 

            >
                <Link to={'/post'} style={{textDecoration: 'none', color: '	#EDEDED'}}>Create Post</Link>
            </motion.button>
        )
    }

    function ForceRefreshButton() {

        return (
            <motion.div className='forced-refresh' initial={{ rotate: 0 }} whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} 
                onClick={() => setForcedRefresh((preVal) => preVal += 1)}>
                <Icons.Refresh />
             </motion.div>
        )
    }

    function SideBar() {
        const [selected, setSelected] = React.useState('')
        const location = useLocation()
        React.useEffect(() => {
            switch (location.pathname) {
                case ('/'): 
                    setSelected('Home')
                    break;
                case ('/post'):
                    setSelected('Create Post')
                    break;
                case ('/liked'):
                    setSelected('Liked')
                    break;
                case ('/settings'):
                    setSelected('Settings')
                    break;
            }
        }, [])

        function UserDisplay() {
            const [open, setOpen] = React.useState(false)
            const [profileImageLoaded, setProfileImageLoaded] = React.useState(false)
            
            return <>
            <div className={`sideBar-user-display`}>
                <div className='sideBar-option-container'>
                    <div className={`sideBar-user-options ${open ? 'open' : ''}`}>
                        <div className={`user-dropdown-option ${isDarkMode && 'dark'}`} onClick={() => navigate(`/users/${user?.uid}`)}>Profile</div>
                        <div className={`user-dropdown-option ${isDarkMode && 'dark'}`}  onClick={() => setConfirmSignOut(false)}>Sign Out</div>
                    </div>
                </div>
                <div className='sideBar-user-container'>
                    <div className='nav-user-image' onClick={() => navigate(`/users/${user.uid}`)}>
                        {!profileImageLoaded && <Skeleton.Circle width={'3rem'} height={'3rem'}/>}
                        <img src={loggedUserData?.photoURL || `${backendURL}/uploads/final/Temp-profile-pic.png`} style={!profileImageLoaded ? {display: 'hidden'} : {}}
                            onLoad={() => setProfileImageLoaded(true)}
                        >
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
                        <Icons.ArrowUpIcon />
                    </div>
                </div>
            </div>
            </>
        }

        const colors = {
            darkMode: {
                normal: 'rgb(158, 156, 156)',
                selected: '#EDEDED'
            },
            lightMode: {
                normal: 'rgb(158, 156, 156)',
                selected: 'black'
            }
        }

        function SideOption({icon, selectedIcon, name, callback, disabled}) {
            function setSelect() {
                if (selected !== name) {
                    setSelected(name); 
                    if (callback) {
                        callback()
                    }
                }
            }

            return <motion.button className={`home-side-option ${disabled && 'disabled'}`}
                onClick={() => setSelect()}
                style={(isDarkMode) ? 
                    (selected == name ? {backgroundColor: '#1E1E1E'} : {backgroundColor: 'transparent'}) : 
                    (selected == name ? {backgroundColor: '#f0e8dd'} : {backgroundColor: 'transparent'})
                }
                whileHover={!disabled && { scale: 1.1 }} whileTap={{ scale: 0.95 }}
                disabled={disabled}
            >
                    <div className='side-logo'>
                        {selected == name ? selectedIcon : icon}
                    </div>
                    <div className='side-name'
                        style={selected == name ? isDarkMode ? {color: colors.darkMode.selected} : {color: colors.lightMode.selected} : {color: colors.darkMode.normal}}
                    >
                        {name}
                    </div>
            </motion.button>
        }

        return (
            <div className='home-sidebar' 
                    style={isDarkMode ? {backgroundColor: 'rgb(22, 22, 22)', color: '#EDEDED'} : {backgroundColor: 'rgba(253,245,234,255)'}}
                >
                <SideOption 
                    icon={<Icons.Home width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    selectedIcon={<Icons.HomeFilled width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    name={'Home'}
                    callback={() => navigate('/')}
                />
                <SideOption 
                    icon={<Icons.PlusLarge color={isDarkMode ? 'white' : 'black'}/>} 
                    selectedIcon={<Icons.PlusLarge color={isDarkMode ? 'white' : 'black'}/>} 
                    name={'Create Post'}
                    callback={() => navigate('/post')}
                    disabled={!user}
                />
                <SideOption 
                    icon={<Icons.Heart width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    selectedIcon={<Icons.HeartFilled width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    name={'Liked'}
                    callback={() => navigate('/liked')}
                    disabled={!user}
                />
                <SideOption 
                    icon={<Icons.Gear width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    selectedIcon={<Icons.GearFilled width={'16'} height={'16'} color={isDarkMode ? 'white' : 'black'}/>} 
                    name={'Settings'}
                    callback={() => navigate('/settings')}
                    disabled={!user}
                />
                {user && <UserDisplay />}
            </div>
        )
    }

    return <div className={`home ${isDarkMode && 'dark'}`}>
        <Toaster />
        {<NavBar scrollRef={scrollRef} loggedUserData={loggedUserData} filters={filters} setFilters={setFilters} setConfirmSignOut ={setConfirmSignOut} setToTop={setToTop} isDesktop={isDesktop}/>}
        {confirmSignOut == false && <ShowAlert confirm={true} message={'Are you sure you want to sign out?'} setConfirmation={setConfirmSignOut} callback={() => handleSignOut()}/>}
        <div className='news-feed-body'>
                <div className='news-feed-absolute-container'>  
                    <div className='news-feed-relative-container'>
                        {toTop && <motion.button className={`to-top-button`} disabled={!toTop} onClick={scrollToTop}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                        >
                            <Icons.ArrowUp color={'white'}/>
                        </motion.button>}
                    </div>
                </div>

                {isDesktop && <SideBar />}
                {(location.pathname == '/') && <div className='news-feed' ref={scrollRef}
                    style={isDarkMode ? {backgroundColor: '#121212'} : {backgroundColor: 'rgba(247,238,226,255)'}}
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
                        <Skeleton.Home darkMode={isDarkMode}/>
                    }
                    {loadingError && <div>Error loading posts</div>}
                    <div className={`individual-post-bodies ${loading ? 'hidden' : ''}`}>
                        {(location.pathname == '/' || location.pathname == '/post') && visiblePosts.map((data) => {
                            return <IndividualPost data={data} key={data._id} handleSearchParams={handleSearchParams} setPostLoad={setPostLoad} />
                        })}
                        {filteredPosts.length == 0 && <div>No posts found</div>}
                    </div>
                </div>}
                {
                    (location.pathname !== '/') && 
                    <div className={`outlet`}
                        style={isDarkMode ? {backgroundColor: '#121212'} : {backgroundColor: 'rgba(247,238,226,255)'}}
                    >
                        <Outlet />
                    </div> 
                }
        </div>
    </div>
}