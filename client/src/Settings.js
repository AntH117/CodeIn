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

export default function Settings() {
    const location  = useLocation()
    const { isDarkMode } = useTheme()
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user) {
            navigate(-1)
            notify.error('Invalid Permissions')
        }
    }, [])

    return <div className='settings-outer-body'>
        <div className='settings-inner-body'
             style={isDarkMode ? {backgroundColor: '#1E1E1E', color: '#EDEDED'} : {backgroundColor: 'rgba(253,245,234,255)'}}
        >   

        </div>
    </div>
}