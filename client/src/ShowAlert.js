import './ShowAlert.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ShowAlert({message, redirect, confirmation}) {
    const navigate = useNavigate()
    const [countDown, setCountDown] = React.useState(3)
    
    React.useEffect(() => {
        if (!confirmation) {
        const timer = setInterval(() => {
            setCountDown(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    handleRedirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        }
    }, [confirmation]);

    function handleRedirect() {
        navigate(redirect)
    }
    
    
    return ReactDOM.createPortal(
        <div className="alert-overlay">
            <div className="custom-alert">
                <span style={{fontSize: '1.1rem'}}>{message}</span>
                <span style={{fontSize: '0.8rem'}}>Auto-close in {countDown}</span>
                <button className='custom-alert-button' onClick={handleRedirect}>Close</button>
            </div>
        </div>,
        document.body // renders directly into the body
    );
}