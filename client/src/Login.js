import './Login.css';
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword  } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { doc, setDoc } from "firebase/firestore";


export default function Login() {
    const { user } = useAuth();
    const navigate = useNavigate()

    //navigate out if user is logged in
    React.useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [])


    const [userDetail, setUserDetail] = React.useState({
        email: '',
        password: ''
    })


    const [submitConditions, setSubmitConditions] = React.useState()

   const errors = {
        'auth/invalid-email': 'Email not found',
        'auth/missing-password': 'Password is empty',
        'auth/invalid-credential': 'Email or Password is incorrect'
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

    //Sync user basic data with db
    function handleSignIn({email, password}) {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        // Store basic user details upon login
        navigate('/')
        })
        .catch((error) => {
            console.log(error.message)
            setSubmitConditions(preVal => {
                return {
                    [error.message.match(/\(([^)]+)\)/)[1]]: false
                }
            })
        });

    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSignIn({email: userDetail.email, password: userDetail.password})
    }

    return (
        <div className='login-form'> 
            <div className='form-data'>
                <h2>Login</h2>
                <form className='credentials-form' onSubmit={handleSubmit}>
                    <input className='credentials-input' placeholder='Email' name='email' onChange={handleChange}></input>
                    <input className='credentials-input' placeholder='Password' name='password' onChange={handleChange}></input>
                    {submitConditions && <div className='creditials-form-errors'>
                                {Object.keys(submitConditions).map((x) => {
                                    return !submitConditions[x] ? <div className='error-message'>{errors[x]}</div> : ''
                                })}
                        </div>}
                    <button className='credentials-button'>Login</button>
                    <div className='register-link'>
                        <Link to={'/register'}>
                            Not yet a member?
                        </Link>
                </div>
                </form>
            </div>
        </div>
    )
}