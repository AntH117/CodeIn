import './ShowAlert.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ShowAlert({message, redirect, confirm, setConfirmation, callback}) {
    const navigate = useNavigate()
    const [countDown, setCountDown] = React.useState(3)
    
    React.useEffect(() => {
        if (!confirm) {
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
    }, [confirm]);

    function handleRedirect() {
        navigate(redirect)
    }
    
    
    return ReactDOM.createPortal(
        <div className="alert-overlay">
            {!confirm && <div className="custom-alert">
                <span style={{fontSize: '1.1rem'}}>{message}</span>
                <span style={{fontSize: '0.8rem'}}>Auto-close in {countDown}</span>
                <button className='custom-alert-button' onClick={handleRedirect}>Close</button>
            </div>}
            {confirm && <div className="custom-alert">
                <span style={{fontSize: '1.1rem'}}>{message}</span>
                <div className='custom-alert-confirmation'>
                <button className='custom-alert-button' style={{backgroundColor: 'rgba(112,94,218,255)'}} onClick={() => {if (callback) callback();
                    setConfirmation(null)}}>Yes</button>
                <button className='custom-alert-button' style={{backgroundColor: 'rgb(243, 136, 136)'}} onClick={() => setConfirmation(null)}>No</button>
                </div>
            </div>}
        </div>,
        document.body // renders directly into the body
    );
}