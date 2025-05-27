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
        </div>}
    </div>
}