import './LikedPosts.css';
import React from 'react';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import IndividualPost from './IndividualPost';
import { useTheme } from "./ThemeContext";
import Skeleton from './skeleton/Skeleton';


export default function LikedPosts() {
       const { user } = useAuth();
       const { isDarkMode } = useTheme();
       const backendURL = process.env.REACT_APP_BACKEND_URL
       const [loading, setLoading] = React.useState(true)

       const [postLoad, setPostLoad] = React.useState(false)
            React.useEffect(() => {
                if (postLoad) {
                    setLoading(false)
                }
            }, [postLoad])
            //get liked posts
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
                const response = await getUserInfo(user?.uid)
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

    return <>
    {loading && <div className='liked-loading'>
        <Skeleton.Liked darkMode={isDarkMode}/>
    </div>}
    <div className='liked-posts-body' style={loading ? {opacity: 0} : {}}>
            <div className='liked-posts-container' style={isDarkMode ? {backgroundColor: '#121212'} : {backgroundColor: 'rgba(247,238,226,255)'}}>
                {likedPosts?.length > 0 && likedPosts.map((post) => {
                return <IndividualPost data={post} setPostLoad={setPostLoad}  key={post.id} tag={'navigate'}/>
            })}
            {likedPosts?.length < 1 && <p>Nothing liked yet!</p>}
            </div>
    </div>
    </>
}