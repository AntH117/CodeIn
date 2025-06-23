import './EditProfile.css';
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "./AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import testImage from './images/Temp-profile-pic.png'
import Icons from './icons/Icons';
import { getAuth, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import ShowAlert from './ShowAlert';

export default function EditProfile() {
    const { user } = useAuth();
    const location = useLocation();
    const profileId = location?.pathname.split('/').at(-2)
    const navigate = useNavigate()
    const userImageRef = React.useRef(null)
    const userBgRef = React.useRef(null)

    
    // Check if current user is profile user
    React.useEffect(() => {
        if (user.uid !== profileId) {
            navigate(-1)
        }
    },[])

    const [profileInfo, setProfileInfo] = React.useState({
    })
    const [uploadedFiles, setUploadedFiles] = React.useState([])
    const userId = user.uid

    async function getUserInfo(uid) {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
        }

    async function getAuthorInfo() {
        const profileInfo = await getUserInfo(userId)
        setProfileInfo(profileInfo)
    }
    React.useEffect(() => {
        getAuthorInfo()
    },[location])

    function convertDate(date) {
        if (date) {
            const dateSplit = date.split(' ')
            const dateCreated = dateSplit.slice(1, 4).join(' ')
            return dateCreated
        }
    }

    //handle text change
    const handleChange = (e) => {
        const {value, name} = e.target
        setProfileInfo((preVal) => {
            return {
                ...preVal,
                [name]: value
            }
        })
    }
    //handle file change
    const APILINK = `http://localhost:5000/api/v1/codeIn`
    const handleImageChange = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        //file conditions
        const validFiles = [  
            "image/jpeg",
            "image/png",
        ]
        const maxFileSizeMb = 35;
        
        const valid = {
            fileSize: file.size <= maxFileSizeMb * 1024 * 1024, 
            fileType: validFiles.includes(file.type),
        }
        const allTrue = Object.values(valid).every(value => value === true);
        if (!allTrue) {
            return
        }

        //post file
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(`${APILINK}/temp-upload`, {
            method: 'POST',
            body: form
        });

        const data = await res.json();
        setUploadedFiles((preval) => [...preval, data.filePath])
        setProfileInfo((preval) => {
            return {
                ...preval,
                [type]: `http://localhost:5000/${data.filePath}`
            }
        }) 
    }
    const handleImageClick =() => {
        userImageRef.current.click();
    }

    const handleBgClick =() => {
        userBgRef.current.click();
    }
    async function saveUserInfo(user) {
        const userRef = doc(db, "users", user.uid);
        
        await setDoc(userRef, {
            displayName: user.displayName || null,
            displayTag: user.displayTag,
            email: user.email,
            photoURL: user.photoURL || "",
            description: user.description || "",
            backgroundURL: user.backgroundURL,
        }, { merge: true }); // merge keeps existing data
    }

    const [confirmation, setConfirmation] = React.useState(null)
    const [alert , setAlert] = React.useState(null)

    React.useEffect(() => {
        if (confirmation) {
            handleSaveEdits()
        }
    }, [confirmation])

    const handleSaveEdits = async () => {
        const updatedUserData = { 
            ...profileInfo, 
            uid: user.uid };

            const finalisedFiles = [];


        try {
            //check for profile photo && background images
           if (uploadedFiles.length > 0) {
                // 1. Handle profile photo update
                if (profileInfo.photoURL.includes('/temp/')) {
                    const photoPath = profileInfo.photoURL.split('http://localhost:5000/')[1];
                    const res = await fetch(`${APILINK}/final-upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filePath: photoPath })
                    });
        
                    const data = await res.json();
                    if (res.ok) {
                        updatedUserData.photoURL = `http://localhost:5000/${data.newPath}`;
                        finalisedFiles.push(photoPath);
                    } else {
                        console.error('Failed to finalize profile image:', data.error);
                    }
                }
                if (profileInfo.backgroundURL.includes('/temp/')) {
                    const bgPath = profileInfo.backgroundURL.split('http://localhost:5000/')[1];
                    const res = await fetch(`${APILINK}/final-upload`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filePath: bgPath })
                    });
        
                    const data = await res.json();
                    if (res.ok) {
                        updatedUserData.backgroundURL = `http://localhost:5000/${data.newPath}`;
                        finalisedFiles.push(bgPath);
                    } else {
                        console.error('Failed to finalize background image:', data.error);
                    }
                }
           } 
        await saveUserInfo(updatedUserData);
        //delete any leftover temp files
        const leftoverTempFiles = uploadedFiles.filter(
            file => !finalisedFiles.includes(file)
        );

        if (leftoverTempFiles.length > 0) {
            await Promise.all(
                leftoverTempFiles.map(fileUrl => {
                    const fileName = fileUrl.split('/').pop();
                    return fetch(`${APILINK}/temp-upload`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ fileName })
                    });
                })
            );
            console.log('All temp files deleted');
        }

        setAlert({message: 'Profile successfully saved', redirect: `/users/${user.uid}`})
        } catch (e) {
            console.error('Error saving profile')
        }
    }
    const handleCancelEdits = async () => {
        if (uploadedFiles.length > 0) {
            const deleteRequests = uploadedFiles.map(fileUrl => {
                const fileName = fileUrl.split('/').pop();
                return fetch(`${APILINK}/temp-upload`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName })
                });
            });
            try {
                await Promise.all(deleteRequests); // wait for all deletions
                console.log('All temp files deleted');
            } catch (err) {
                console.error('Error deleting one or more files:', err);
            }
        }
        navigate(-1)
    }

    function SensitiveData() {
        const [toggle, setToggle] = React.useState(false)
        const [passwords, setPasswords] = React.useState({
            current:'',
            new: ''
        })

        const [errors, setErrors] = React.useState(null)
        
        const errorMessages = {
            'auth/invalid-credential': 'Incorrect password',
            'auth/missing-password': 'Missing password',
            passwordLengthMin: 'Password must be larger than 4 characters',
            passwordLengthMax: 'Password must be less than 12 characers'
        }

        const handlePasswords = (e) => {    
            const {value, name} = e.target;
            setPasswords((preVal) => {
                return {
                    ...preVal,
                    [name]: value
                }
            })
        }
        async function changeUserPassword({currentPass, newPass}) {
            if (!user) {
                console.error("Not authenticated.");
                return;
              }
            if (newPass.length < 4) {
                setErrors('passwordLengthMin')
                return
            } else if (newPass.length > 11) {
                setErrors(`passwordLengthMax`)
                return;
            }
            const credential = EmailAuthProvider.credential(user.email, currentPass);
            try {
                await reauthenticateWithCredential(user, credential);
                console.log("Reauthentication successful.");
                await updatePassword(user, newPass);
                alert("Password updated successfully.");
                navigate(`/users/${user.uid}`);
              } catch (error) {
                setErrors(error.message.match(/\(([^)]+)\)/)[1])
              }
        }
        return <div className='user-sensitive-body'>
            <div className='user-sensitive-toggle' onClick={() => setToggle((preVal) => !preVal)}>{toggle ? <Icons.LockOpen /> : <Icons.LockClosed />}</div>
            <div className={`user-sensitive-inner-body ${toggle ? 'open' : ''}`}>
                <div className='user-change-password'>
                    Current Password:
                    <input type='password' className='user-change-password-input' name='current' onChange={handlePasswords}></input>
                </div>
                <div className='user-change-password'>
                    New Password:
                    <input type='password' className='user-change-password-input' name='new' onChange={handlePasswords}></input>
                </div>
                {errors && <div className='password-error-div'>
                    {errorMessages[errors]}
                </div>}
                <button className='user-submit-password' onClick={() => changeUserPassword({currentPass: passwords.current, newPass: passwords.new})}>
                        Change Password
                </button>
            </div>
    </div>
    }    
    

    return <div className='user-profile-outer-body'>
            {alert && <ShowAlert message={alert?.message} redirect={alert?.redirect}/>}
        {profileInfo && <div className='user-profile-inner-body'>
            <div className='user-background'>
                <img className='user-background-image' src={profileInfo?.backgroundURL || null} onClick={handleBgClick}style={{cursor: 'pointer', zIndex: '5'}}>
                </img>
                <input type='file' className='user-bg-input' ref={userBgRef} onChange={(e) => handleImageChange(e, 'backgroundURL')}>
                </input>
                <div className='user-info-image' onClick={handleImageClick} style={{cursor: 'pointer', zIndex: '5'}}>
                    <img src={profileInfo?.photoURL || testImage}>
                    </img>
                    <input type='file' className='user-image-input' ref={userImageRef} onChange={(e) => handleImageChange(e, 'photoURL')}>
                    </input>
                </div>
            </div>
            <div className='user-edit-info-name'>
                <span style={{fontWeight: 'bold'}} className='user-edit-display'>
                    <input placeholder={profileInfo.displayName || 'Display Name'} name='displayName' onChange={handleChange} value={profileInfo.displayName} style={{width: '100%'}} type='text'>
                    </input>
                </span>
                <div className='user-edit-info-tag'>
                    <span style={{fontSize: '0.9rem'}}>@</span><input placeholder='Display Tag' name='displayTag' onChange={handleChange} value={profileInfo.displayTag} className='user-display-tag-input'></input>
                </div>
                <div className='user-edit'>
                        <div className='user-edit-cancel' onClick={handleCancelEdits}> <Icons.X /> Cancel</div>
                </div>
                <div className='user-creation-date'>
                   <Icons.Calendar /> Joined {convertDate(profileInfo?.creationDate)}
                </div>
                <div className='user-edit-description'>
                    <textarea type='text' placeholder='No info yet!' name='description' onChange={handleChange} value={profileInfo.description}>
                        
                    </textarea>
                </div>
                <div className='user-save'>
                    <div className='user-edit-save' onClick={() => setConfirmation(false)}> Save</div>
                    {confirmation == false && <ShowAlert message={'Save Edits?'} confirm={true} setConfirmation={setConfirmation}/>}
                </div>
            </div>
            <SensitiveData />
        </div>}
    </div>
}