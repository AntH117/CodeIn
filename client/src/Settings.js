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

function SettingsInput({displayName, value, name, setEditedInfo, errorMessages, saveConditions}) {
    const { isDarkMode } = useTheme()

    const errorMessage = {
        validEmail: 'Not a valid email',
        displayNameMin: 'Please input a display name',
        displayNameMax: 'Name must not exceed 15 characters',
        displayTagMin: 'Please input a display tag',
        displayTagMax: 'Tag must not exceed 15 characters',
    }

    const handleChange = (e) => {
        const { value } = e.target;
        setEditedInfo((preVal) => ({
            ...preVal,
            [name]: value
        }))
    }
    function ErrorMessages({error}) {
        return (saveConditions[error] == false && <div className='settings-error-body'>
            {<p style={{margin: '0px'}}>{errorMessage[error]}</p>}
        </div>)
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
            {errorMessages?.map((x) => {
            return (
                <ErrorMessages error={x}/>
            )
        })}
        </div>
    </div>
}

function SettingsToggle({name}) {
    const { isDarkMode } = useTheme()
    const [toggle, setToggle] = React.useState(false)
    const styles = {
        lightMode: {
            off: {
                backgroundColor: ' #ff6b6b',

            },
            on: {
                backgroundColor: '#4ade80'
            }
        },
        darkMode: {
            off: {
                backgroundColor: '#a83d3d'
            },
            on: {
                backgroundColor:' #3da853'
            }
        }
    }

    return <div className='settings-toggle-body'>
            {name}
            <button 
                className={`settings-toggle-container ${isDarkMode && 'dark'}`} 
                onClick={() => setToggle(!toggle)}
                style={isDarkMode ? (toggle ? styles.darkMode.on : styles.darkMode.off) : (toggle ? styles.lightMode.on : styles.lightMode.off)}
            >
                <motion.div
                    className={`settings-toggle-handle ${isDarkMode && 'dark'}`}
                    initial={false}
                    animate={{ 
                        x: toggle ? 22 : 0,
                        backgroundColor: isDarkMode ? "#e5e5e5" : "white",
                    }}
                    transition={{
                        type: "spring",
                        duration: 0.5,
                        bounce: 0.2,
                    }}
                />
            </button>
    </div>
}

export default function Settings() {
    const { isDarkMode } = useTheme()
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = React.useState(null)
    const [editedInfo, setEditedInfo] = React.useState(null)
    const edited = editedInfo?.email !== userInfo?.email || editedInfo?.displayName !== userInfo?.displayName || editedInfo?.displayTag !== userInfo?.displayTag
    const [forceRerender, setForceRerender] = React.useState(true)

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

    // Save settings
    let saveConditions = React.useRef({
        validEmail: null,
        displayNameMin: null,
        displayNameMax: null,
        displayTagMin: null,
        displayTagMax: null,
    })

    function handleSave() {
        saveConditions.current = {
            validEmail: editedInfo.email.includes('@'),
            displayNameMin: editedInfo.displayName.length <= 15,
            displayNameMax: editedInfo.displayName.length > 0,
            displayTagMin: editedInfo.displayTag.length <= 15,
            displayTagMax: editedInfo.displayTag.length > 0,
          };
        setForceRerender(!forceRerender)
        const allTrue = Object.values(saveConditions.current).every(value => value === true);
        if (allTrue) {
            // saveUserInfo(user)
            console.log('all conditions true!')
        } else {
            return
        }
    }

    async function saveUserInfo(user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            displayName: editedInfo.displayName,
            displayTag: editedInfo.displayTag,
            email: editedInfo.email,
        }, { merge: true }); // merge keeps existing data
    }

    return (
        userInfo && <div className='settings-outer-body'>
        <div className='settings-inner-body'
             style={isDarkMode ? {backgroundColor: '#1E1E1E', color: '#EDEDED'} : {backgroundColor: 'rgba(253,245,234,255)'}}
        >   
            <motion.button className={`settings-cancel-button`} onClick={() => {
                navigate('/')
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
                onClick={() => handleSave()}
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
                <SettingsInput displayName={'Email'} value={editedInfo.email} name={'email'} setEditedInfo={setEditedInfo} errorMessages={['validEmail']} saveConditions={saveConditions.current}/>
                <SettingsInput displayName={'Display Name'} value={editedInfo.displayName} name={'displayName'} setEditedInfo={setEditedInfo} errorMessages={['displayNameMin', 'displayNameMax']} saveConditions={saveConditions.current}/>
                <SettingsInput displayName={'Display Tag'} value={editedInfo.displayTag} name={'displayTag'} setEditedInfo={setEditedInfo} errorMessages={['displayTagMin', 'displayTagMax']} saveConditions={saveConditions.current}/>
            </div>
            <div className='settings-notifications'>
                <h3 style={{marginBottom: '1rem', marginTop: '2rem'}}>
                    Notifications
                </h3>
                <SettingsToggle name={'Push notifications'}/>
            </div>
        </div>
    </div>
    )
}