import './Home.css';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Home() {

    return <div className='home'>
        <div className='nav-bar'>
        <Link to={'/'}>Home</Link>
        <Link to={'/login'}>Login</Link>
        </div>
        <div className='outlet'>
            <Outlet />
        </div>
    </div>
}