import './ExpandedImage.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate} from 'react-router-dom';

export default function ExpandedImage() {
    const navigate = useNavigate()
    const location  = useLocation()
    
    const id = location.pathname.split('/').at(-1)
    return <div className='expanded-image-body' onClick={() => navigate(-1)}>
        <div className='expanded-image-container'>
            <img src={`http://localhost:5000/uploads/final/${id}`}>
            </img>
        </div>
    </div>
}