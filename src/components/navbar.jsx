import "./navbar.css";
import { useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateToken = (length = 32) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createAuthSession = () => {
    const authToken = generateToken(32);
    const sessionToken = generateToken(32);

    sessionStorage.setItem("auth_token", authToken);
    sessionStorage.setItem("session_token", sessionToken);

    return { authToken, sessionToken };
  };

  const handleLoginRedirect = () => {
    const { authToken, sessionToken } = createAuthSession();
    navigate(`${location.pathname}?login=true&auth=${authToken}&sess=${sessionToken}${location.hash}`);
    setOpen(false);
  };

  const handleSignupRedirect = () => {
    const { authToken, sessionToken } = createAuthSession();
    navigate(`${location.pathname}?signup=true&auth=${authToken}&sess=${sessionToken}${location.hash}`);
    setOpen(false);
  };

  return (

    <>
<nav className="navbar">

<Link to="/" className="logo-container" onClick={scrollToTop}>
<img src="/assets/logo.png" alt="Repart" className="logo" />
<span className="logo-text">Repart</span>
</Link>

<div className={`nav-buttons ${open ? "active" : ""}`}>

<div className="mobile-menu-header">
<span>Menu</span>
</div>

  <button className="about-link" onClick={() => { navigate("/developers"); setOpen(false); }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
    About
  </button>
  <button className="signin" onClick={handleLoginRedirect}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
    Sign In
  </button>
  <button className="analyze-repo" onClick={handleSignupRedirect}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
    Analyse Repository
  </button>

</div>

<div className={`menu-toggle ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
<span></span>
<span></span>
<span></span>
</div>

</nav>

<div className={`menu-overlay ${open ? "active" : ""}`} onClick={() => setOpen(false)}></div>

</>);



}

export default Navbar;
