import './Settings.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';
import testImage from './images/Temp-profile-pic.png'
import { v4 as uuidv4 } from 'uuid';
import Icons from './icons/Icons';
import { useAuth } from "./AuthContext";
import { auth } from './firebase';
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { arrayUnion, arrayRemove  } from "firebase/firestore";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import NotFound from './NotFound';
import ShowAlert from './ShowAlert';
import notify from './Toast';
import Skeleton from './skeleton/Skeleton';
import { AnimatePresence, motion } from "motion/react"
import { useTheme } from "./ThemeContext";

function SettingsInput({displayName, value, name, setEditedInfo}) {
    const { isDarkMode } = useTheme()

    const handleChange = (e) => {
        const { value } = e.target;
        setEditedInfo((preVal) => ({
            ...preVal,
            [name]: value
        }))
    }
    
    return <div className='settings-input-outer-body'>
        <h4 style={{marginBottom: '0.5rem'}}>{displayName}</h4>
        <div className='settings-input-body'>
            <div className='settings-input-outline' 
                style={isDarkMode ? {border: '1px solid rgb(48, 47, 47)', backgroundColor:' rgb(48, 47, 47)'} 
                : 
                {border: '1px solid  rgb(240, 232, 221)', backgroundColor:' rgb(240, 232, 221)'} }
            >
                <input className='settings-input'
                    style={isDarkMode ? {color: 'white'} : {color: 'black'}}
                    defaultValue={value}
                    id={name}
                    onChange={handleChange}
                />
            </div>
        </div>
    </div>
}

export default function Settings() {
    const { isDarkMode } = useTheme()
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = React.useState(null)
    const [editedInfo, setEditedInfo] = React.useState(null)
    const edited = editedInfo?.email !== userInfo?.email || editedInfo?.displayName !== userInfo?.displayName || editedInfo?.displayTag !== userInfo?.displayTag
    
    //get user info
    const userId = user.uid
    async function getUserInfo(uid) {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setUserInfo(docSnap.data())
                setEditedInfo({
                    email: docSnap.data().email,
                    displayName: docSnap.data().displayName,
                    displayTag: docSnap.data().displayTag
                })
            } else {
                return null;
            }
        } catch (e) {
            console.error('Could not get user info')
        } finally {
        
        }
    }
    React.useEffect(() => {
        if (!user) {
            navigate(-1)
            notify.error('Invalid Permissions')
        } else {
            getUserInfo(userId)
        }
    }, [])      

    return (
        userInfo && <div className='settings-outer-body'>
        <div className='settings-inner-body'
             style={isDarkMode ? {backgroundColor: '#1E1E1E', color: '#EDEDED'} : {backgroundColor: 'rgba(253,245,234,255)'}}
        >   
            <motion.button className={`settings-cancel-button`} onClick={() => {
                navigate(-1)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            >
                <Icons.X />
            </motion.button>

            <motion.button className='settings-save-button'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={!edited ? {pointerEvents: 'none', opacity: '0.6'} : {}}
            >
                Save
            </motion.button>

            <div className='settings-title'>
                <h1>
                    Settings
                </h1>
            </div>
            <div className='settings-account'>
                <h3 style={{marginBottom: '0px'}}>
                    Account
                </h3>
                <SettingsInput displayName={'Email'} value={editedInfo.email} name={'email'} setEditedInfo={setEditedInfo}/>
                <SettingsInput displayName={'Display Name'} value={editedInfo.displayName} name={'displayName'} setEditedInfo={setEditedInfo}/>
                <SettingsInput displayName={'Display Tag'} value={editedInfo.displayTag} name={'displayTag'} setEditedInfo={setEditedInfo}/>
            </div>
        </div>
    </div>
    )
}