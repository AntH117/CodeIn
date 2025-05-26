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
    const [profileInfo, getProfileInfo] = React.useState()
    const location = useLocation();
    const userId = location.pathname.split('/').at(-1)
    const navigate = useNavigate()
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

    React.useEffect(() => {
        getAuthorInfo()
    },[])

    //edit posts
    function DropDownMenu() {
        const [open, setOpen] = React.useState(false)

        return <>
        <div className='EP-delete' onClick={() => setOpen((preVal) => !preVal)}>
            <div className='dot'></div>
            <div className='dot'></div>
            <div className='dot'></div>
        </div>
        {open && <div className='EP-dropdown'>
                <div className='EP-dropdown-option'> <Icons.Edit /> Edit</div>
            </div>}
        </>
    }

    return <div className='user-profile-outer-body'>
        <div className='user-profile-inner-body'>
            <DropDownMenu />
            <div className='user-info'>
                <div className='user-info-image'>
                    <img src={profileInfo?.photoURL || testImage}>
                    </img>
                </div>
                <div className='user-info-name'>
                    <span style={{fontWeight: 'bold', marginRight: "10px"}}>{profileInfo?.displayName || 'No name yet'}</span> || {profileInfo?.email}
                </div>
            </div>
        </div>
    </div>
}