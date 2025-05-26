import './Register.css';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { auth } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register () {

    function handleSignUp(email, password) {
        createUserWithEmailAndPassword(auth, email, password)
          .then(userCred => {
            console.log("Signed up:", userCred.user);
          })
          .catch(err => alert(err.message));
      }
    
    function handleSubmit(e) {
        e.preventDefault()
        //Check if Emails are valid and match. Passwords are valid.
        
    }

 function RegisterForm() {
        return (
            <div className='form-data'>
                <h2>Register</h2>
                <form className='credentials-form' onSubmit={handleSubmit}>
                    <input className='credentials-input' placeholder='Email'></input>
                    <input className='credentials-input' placeholder='Confirm Email'></input>
                    <input className='credentials-input' placeholder='Password'></input>
                    <button className='credentials-button'>Register</button>
                    <div className='register-link'>
                        <Link to={'/login'}>
                            Already a member?
                        </Link>
                </div>
                </form>
            </div>
        )
    }

    return <div className='register-body'>
        <RegisterForm />
    </div>
}