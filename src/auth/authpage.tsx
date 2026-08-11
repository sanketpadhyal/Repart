import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { backendUrl } from '../api/api.tsx';
import './authpage.css';

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClose = () => {
    if (isConnecting) return;
    navigate(location.pathname + location.hash);
  };

  const handleGithubAuth = () => {
    setIsConnecting(true);
    setTimeout(() => {
      window.location.href = backendUrl('/auth/github');
    }, 150);
  };

  return (
    <div className="auth-page-wrapper" onClick={handleClose}>
      <div className="auth-panel" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={handleClose} aria-label="Close" disabled={isConnecting}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <img src="/assets/logo.png" alt="Repart" className="auth-logo" />
        
        <h1 className="auth-title">Login to <span className="auth-logo-text">Repart</span></h1>
        <p className="auth-subtitle">
          Continue with GitHub for a faster and secure experience.
        </p>

        <button 
          className={`auth-github-btn ${isConnecting ? 'connecting' : ''}`} 
          onClick={handleGithubAuth}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="auth-btn-spinner"></div>
              Connecting to GitHub...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              Continue with GitHub
            </>
          )}
        </button>

        <p className="auth-footer-text">
          Your data is safe with Repart Auth System.
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
