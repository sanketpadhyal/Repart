import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BlogPage from './pages/blogpage.jsx';
import DevelopersPage from './pages/DevelopersPage.jsx';
import AuthPage from './auth/authpage.tsx';
import LoginCallback from './auth/LoginCallback.jsx';
import Dashboard from './dashboard/dashboard.tsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import './App.css';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const showAuthModal = searchParams.get('login') === 'true' || searchParams.get('signup') === 'true';

  useEffect(() => {
    if (location.hash.includes('access_token=') && location.pathname !== '/login/callback') {
      navigate(`/login/callback${location.hash}`);
      return;
    }

    const token = localStorage.getItem('repart_auth_token');
    const pendingRepo = localStorage.getItem('pending_analyze_repo');
    const isPublicPage = ['/', '/blog', '/developers'].includes(location.pathname);

    if (token && !location.pathname.startsWith('/dashboard') && location.pathname !== '/login/callback' && !isPublicPage) {
      if (pendingRepo) {
        localStorage.removeItem('pending_analyze_repo');
        navigate(`/dashboard/analyze?repo=${encodeURIComponent(pendingRepo)}`);
      } else {
        navigate('/dashboard');
      }
    }
  }, [location.hash, location.pathname, navigate]);

  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/developers" element={<DevelopersPage />} />
        <Route path="/dashboard" element={<Dashboard defaultTab="overview" />} />
        <Route path="/dashboard/repositories" element={<Dashboard defaultTab="repositories" />} />
        <Route path="/dashboard/analyze" element={<Dashboard defaultTab="analyze" />} />
        <Route path="/dashboard/compare" element={<Dashboard defaultTab="compare" />} />
        <Route path="/dashboard/extensions" element={<Dashboard defaultTab="extensions" />} />
        <Route path="/login/callback" element={<LoginCallback />} />
      </Routes>
      {showAuthModal && <AuthPage />}
    </div>
  );
}

export default App;
