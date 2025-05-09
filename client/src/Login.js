import './Login.css';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Login() {

    function LoginForm() {

        return (
            <div className='form-data'>
                <h2>Login</h2>
                <form onSubmit={''}>

                </form>
                <div className='register-link'>
                    <Link to={'/register'}>
                        Not a member?
                    </Link>
                </div>
            </div>
        )
    }

    return (

    <div className='login-page'>
        <div className='nav-bar'>
            <Link to={'/'}>Home</Link>
            <Link to={'/login'}>Login</Link>
        </div>
        <div className='login-form'>
            <LoginForm />
        </div>
    </div>)
}