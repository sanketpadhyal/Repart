import React from 'react';
import { useNavigate } from 'react-router-dom';
import './bottombar.css';

interface BottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  return (
    <div className="bottom-bar-container">
      <button 
        className={`bottom-bar-item ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('overview');
          navigate('/dashboard');
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Overview</span>
      </button>

      <button 
        className={`bottom-bar-item ${activeTab === 'repositories' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('repositories');
          navigate('/dashboard/repositories');
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Repos</span>
      </button>

      <button
        className={`bottom-bar-item feature-hero-item ${activeTab === 'analyze' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('analyze');
          navigate('/dashboard/analyze');
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        <span>Analyze</span>
      </button>

      <button
        className={`bottom-bar-item ${activeTab === 'compare' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('compare');
          navigate('/dashboard/compare');
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line><line x1="7" y1="17" x2="4" y2="20"></line><line x1="3" y1="19" x2="5" y2="21"></line></svg>
        <span>Compare</span>
      </button>

      <button
        className={`bottom-bar-item ${activeTab === 'extensions' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('extensions');
          navigate('/dashboard/extensions');
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="2"></rect><rect x="14" y="2" width="8" height="8" rx="2"></rect><rect x="2" y="14" width="8" height="8" rx="2"></rect><rect x="14" y="14" width="8" height="8" rx="2"></rect></svg>
        <span>Extensions</span>
      </button>
    </div>
  );
};

export default BottomBar;
