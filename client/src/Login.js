import './Login.css';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {

    function LoginForm() {

        return (
            <div className='form-data'>
                <h2>Login</h2>
                <form className='credentials-form'>
                    <input className='credentials-input' placeholder='Email'></input>
                    <input className='credentials-input' placeholder='Password'></input>
                    <button className='credentials-button'>Login</button>
                    <div className='register-link'>
                        <Link to={'/register'}>
                            Not yet a member?
                        </Link>
                </div>
                </form>
            </div>
        )
    }

    return (
        <div className='login-form'> 
            <LoginForm />
        </div>
    )
}