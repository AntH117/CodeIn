import './ExpandedImage.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';

export default function ExpandedImage() {
    const navigate = useNavigate()
    const location  = useLocation()
    const backendURL = process.env.REACT_APP_BACKEND_URL
    const id = location.pathname.split('/').at(-1)
    return <div className='expanded-image-body' onClick={() => navigate(-1)}>
        <div className='expanded-image-container'>
            <img src={`${backendURL}/uploads/final/${id}`}>
            </img>
        </div>
    </div>
}