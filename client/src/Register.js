import './Register.css';
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { doc, setDoc } from "firebase/firestore";


export default function Register () {

    const { user } = useAuth();
    async function saveUserInfo(user) {
        const userRef = doc(db, "users", user.uid);
        
    await setDoc(userRef, {
        displayName: user.displayName || null,
        email: user.email,
        photoURL: user.photoURL || "",
    }, { merge: true }); // merge keeps existing data
    }
    
    const navigate = useNavigate()

    //navigate out if user is logged in
    React.useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [])
    

    const [userDetail, setUserDetail] = React.useState({
        email: '',
        confirmEmail: '',
        password: ''
    })
    
    const [submitConditions, setSubmitConditions] = React.useState()
    const errors = {
        'auth/invalid-email': 'Email must be valid',
        emailMatch: 'Email & Confirm Emails must match',
        passwordLength: 'Password must be larger than 4 characters',
        'auth/email-already-in-use': 'Email already in use',
    }


function handleSignUp({email, password}) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCred => {
            alert('User successfully created')
            saveUserInfo(user)
            navigate('/')
        })
        .catch(error => setSubmitConditions(preVal => {
            return {
                ...preVal,
                [error.message.match(/\(([^)]+)\)/)[1]]: false
            }
        }));
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        //Check if Emails are valid and match. Passwords are valid.
        const conditions = {
            emailMatch: userDetail.email.toLocaleLowerCase() === userDetail.confirmEmail.toLocaleLowerCase(),
            passwordLength: userDetail.password.length > 4,
        }
        const allTrue = Object.values(conditions).every(value => value === true);
        if (allTrue) {
            handleSignUp({email: userDetail.email, password: userDetail.password})
        } else {
            setSubmitConditions(conditions)
        }        
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setUserDetail(preVal => {
            return {
                ...preVal,
                [name]: value
            }
        })
    }

    return <div className='register-body'>
                <div className='form-data'>
                    <h2>Register</h2>
                    <form className='credentials-form' onSubmit={handleSubmit}>
                        <input className='credentials-input' placeholder='Email' name={'email'} onChange={handleChange} value={userDetail.email}></input>
                        <input className='credentials-input' placeholder='Confirm Email' name={'confirmEmail'} onChange={handleChange} value={userDetail.confirmEmail}></input>
                        <input className='credentials-input' placeholder='Password' name={'password'} onChange={handleChange} value={userDetail.password}></input>
                        {submitConditions && <div className='creditials-form-errors'>
                                {Object.keys(submitConditions).map((x) => {
                                    return !submitConditions[x] ? <div className='error-message'>{errors[x]}</div> : ''
                                })}
                        </div>}
                        <button className='credentials-button'>Register</button>
                        <div className='register-link'>
                            <Link to={'/login'}>
                                Already a member?
                            </Link>
                        </div>
                    </form>
            </div>
    </div>
}