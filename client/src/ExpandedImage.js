import './ExpandedImage.css';
import React from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate, useParams} from 'react-router-dom';

export default function ExpandedImage() {
    const navigate = useNavigate()
    const location  = useLocation()
    const postLocation = location.pathname.split('image')[0];
    console.log(postLocation)
    const { imageId } = useParams()
    return <div className='expanded-image-body' onClick={() => navigate(postLocation)}>
        <div className='expanded-image-container'>
            <button className="close-button" onClick={() => navigate(postLocation)}>✕</button>
            <img src={`https://res.cloudinary.com/dvc16neqe/image/upload/v1752025154/codein/${imageId}`}>
            </img>
        </div>
    </div>
}