import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../api/api.tsx';

function LoginCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    
    if (!hash) {
      setError("No authentication token found in URL");
      return;
    }

    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const providerToken = hashParams.get('provider_token');

    if (!accessToken) {
      setError("Access token missing from URL");
      return;
    }


    fetch(backendUrl('/auth/callback'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        supabase_access_token: accessToken,
        provider_token: providerToken 
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error);
      } else if (data.token) {
        localStorage.setItem('repart_auth_token', data.token);
        if (data.user) {
          const userWithToken = {
            ...data.user,
            provider_token: providerToken || data.user.provider_token
          };
          localStorage.setItem('repart_user', JSON.stringify(userWithToken));
        }

        const pendingRepo = localStorage.getItem('pending_analyze_repo');
        if (pendingRepo) {
          localStorage.removeItem('pending_analyze_repo');
          navigate(`/dashboard/analyze?repo=${encodeURIComponent(pendingRepo)}`);
        } else {
          navigate('/dashboard');
        }
      }
    })
    .catch(err => {
      console.error('Error exchanging token:', err);
      setError("Failed to verify authentication with server");
    });

  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#fdfdfb',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '24px 16px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @keyframes cbSpin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent !important; outline: none !important; }
      `}</style>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #e4e4e7',
        borderRadius: '24px',
        padding: '40px 28px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.03)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="/assets/logo.png" 
            alt="Repart" 
            style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
          />
          <span style={{
            fontFamily: "'Times New Roman', Georgia, serif",
            fontSize: '24px',
            fontWeight: 700,
            color: '#8c6b22',
            letterSpacing: '-0.02em'
          }}>Repart</span>
        </div>

        {error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', margin: 0 }}>
              Authentication Failed
            </h2>
            <p style={{ fontSize: '13px', color: '#71717a', margin: 0, lineHeight: 1.5 }}>
              {error}
            </p>
            <button 
              onClick={() => navigate('/')} 
              style={{
                marginTop: '8px',
                padding: '10px 24px',
                backgroundColor: '#18181b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '100px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer'
              }}
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3.5px solid #fef3c7',
              borderTopColor: '#8c6b22',
              borderRadius: '50%',
              animation: 'cbSpin 0.8s linear infinite'
            }}></div>

            <div>
              <h2 style={{
                fontSize: '20px',
                fontFamily: "'Times New Roman', Georgia, serif",
                fontWeight: 700,
                color: '#18181b',
                margin: '0 0 6px 0'
              }}>
                Authenticating with GitHub
              </h2>
              <p style={{ fontSize: '13px', color: '#71717a', margin: 0, lineHeight: 1.4 }}>
                Verifying credentials & initializing workspace...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginCallback;
