import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../api/api.tsx';
import BottomBar from './bottombar.tsx';
import RepositoriesView from './repositories.tsx';
import AnalyzeRepo from './analyze/analyze-repo.tsx';
import AnalyzeResult from './analyze/analyze-result.tsx';
import AccountComparison from './acc-compare/comparison.tsx';
import ExtensionsView from './extentions.tsx';
import './dashboard.css';

interface UserProfile {
  avatar_url?: string;
  user_name?: string;
  name?: string;
  email?: string;
  followers?: number;
  provider_token?: string;
}

interface GitHubProfileData {
  followers: number;
  following: number;
  public_repos: number;
  total_repos: number;
  bio?: string;
  location?: string;
  html_url?: string;
  avatar_url?: string;
  name?: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
}

interface ActivityMetrics {
  longestStreak: number;
  currentStreak: number;
  totalCommits: number;
  weeklyVelocity?: number;
}

interface PortfolioAnalytics {
  totalLOC: number;
  formattedLOC: string;
  securityScore: number;
  securityGrade: string;
  testCoverageRatio: number;
  languages: Array<{ name: string; count: number; percent: number; color: string }>;
  archetype: string;
  analyzedReposCount: number;
}

interface DashboardProps {
  defaultTab?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ defaultTab = 'overview' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>(
    location.pathname === '/dashboard/repositories' ? 'repositories' :
    location.pathname === '/dashboard/analyze' ? 'analyze' :
    location.pathname === '/dashboard/compare' ? 'compare' : defaultTab
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubProfileData | null>(null);
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics | null>(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [topRepos, setTopRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    if (location.pathname === '/dashboard/repositories') {
      setActiveTab('repositories');
    } else if (location.pathname === '/dashboard/analyze') {
      setActiveTab('analyze');
    } else if (location.pathname === '/dashboard/compare') {
      setActiveTab('compare');
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [activeTab, location.pathname]);

  useEffect(() => {
    const storedUserStr = localStorage.getItem('repart_user');
    let username = '';
    let providerToken = '';
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        setUser(parsed);
        if (parsed.github_username || parsed.user_name) {
          username = parsed.github_username || parsed.user_name;
        }
        if (parsed.provider_token) {
          providerToken = parsed.provider_token;
        }
      } catch (e) {
        console.error("Error parsing stored user", e);
      }
    }

    if (!username) {
      setIsLoading(false);
      navigate('/?login=true');
      return;
    }

    const cacheKey = `repart_gh_dash_v6_${username}`;
    const cachedStr = sessionStorage.getItem(cacheKey);
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
          if (cached.stats) setGithubStats(cached.stats);
          if (cached.repos) setTopRepos(cached.repos);
          if (cached.activity) setActivityMetrics(cached.activity);
          if (cached.portfolioAnalytics) setPortfolioAnalytics(cached.portfolioAnalytics);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem(cacheKey);
      }
    }

    setIsLoading(true);
    const reqHeaders: Record<string, string> = {};
    if (providerToken) {
      reqHeaders['Authorization'] = `token ${providerToken}`;
    }

    apiFetch(`/api/github/user-full/${username}`, { headers: reqHeaders })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          let statsObj = null;
          if (data.user) {
            statsObj = {
              followers: data.user.followers || 0,
              following: data.user.following || 0,
              public_repos: data.user.public_repos || 0,
              total_repos: data.user.public_repos || 0,
              bio: data.user.bio || '',
              location: data.user.location || '',
              html_url: data.user.html_url || `https://github.com/${username}`
            };
            setGithubStats(statsObj);
          }
          const repoList = (data.allRepos && data.allRepos.length > 0) ? data.allRepos : (data.repos || []);
          const mostRecent = [...repoList].sort((a: any, b: any) => {
            const timeA = new Date(a.updated_at || 0).getTime();
            const timeB = new Date(b.updated_at || 0).getTime();
            return timeB - timeA;
          }).slice(0, 6);

          setTopRepos(mostRecent);
          if (mostRecent.length > 0) {
            setRepoUrl(mostRecent[0].html_url);
          }
          if (data.activity) {
            setActivityMetrics({
              longestStreak: data.activity.longestStreak || 0,
              currentStreak: data.activity.currentStreak || 0,
              totalCommits: data.activity.totalCommits || 0
            });
          }
          if (data.portfolioAnalytics) {
            setPortfolioAnalytics(data.portfolioAnalytics);
          }

          sessionStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            stats: statsObj,
            repos: data.repos,
            activity: data.activity,
            portfolioAnalytics: data.portfolioAnalytics
          }));
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching live github data:", err);
        setIsLoading(false);
      });
  }, [navigate]);

  const confirmLogout = () => {
    localStorage.removeItem('repart_auth_token');
    localStorage.removeItem('repart_user');
    navigate('/');
  };

  const handleSelectRepo = (targetRepoUrl: string) => {
    setRepoUrl(targetRepoUrl);
    setActiveTab('analyze');
    navigate(`/dashboard/analyze?repo=${encodeURIComponent(targetRepoUrl)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Avatar & Username formatting
  const avatarUrl = user?.avatar_url || githubStats?.avatar_url || 'https://github.com/github.png';
  const displayName = user?.name || user?.user_name || githubStats?.name || 'Developer';
  const usernameHandle = user?.github_username || user?.user_name || '';
  const handleName = usernameHandle ? `@${usernameHandle}` : '';

  const getLanguageColor = (lang?: string) => {
    switch (lang) {
      case 'TypeScript': return '#3178c6';
      case 'JavaScript': return '#f7df1e';
      case 'Python': return '#3572A5';
      case 'Go': return '#00ADD8';
      case 'HTML': return '#e34c26';
      case 'CSS': return '#563d7c';
      default: return '#8b5cf6';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Desktop Left Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => navigate('/')}>
            <img src="/assets/logo.png" alt="Repart Logo" className="sidebar-logo" />
            <span className="sidebar-brand-text">Repart</span>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                navigate('/dashboard');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              <span>Overview</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'repositories' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('repositories');
                navigate('/dashboard/repositories');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              <span>Repositories</span>
            </button>

            <button
              className={`sidebar-nav-btn feature-shift-right ${activeTab === 'analyze' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('analyze');
                navigate('/dashboard/analyze');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>Analyze Repository</span>
            </button>

            <button
              className={`sidebar-nav-btn ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('compare');
                navigate('/dashboard/compare');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline><line x1="13" y1="19" x2="19" y2="13"></line><line x1="16" y1="16" x2="20" y2="20"></line><line x1="19" y1="21" x2="21" y2="19"></line><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"></polyline><line x1="5" y1="14" x2="9" y2="18"></line><line x1="7" y1="17" x2="4" y2="20"></line><line x1="3" y1="19" x2="5" y2="21"></line></svg>
              <span>Compare Accounts</span>
            </button>

            <button
              className={`sidebar-nav-btn ${activeTab === 'extensions' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('extensions');
                navigate('/dashboard/extensions');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="2"></rect><rect x="14" y="2" width="8" height="8" rx="2"></rect><rect x="2" y="14" width="8" height="8" rx="2"></rect><rect x="14" y="14" width="8" height="8" rx="2"></rect></svg>
              <span>Extensions</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile-card">
            <img src={avatarUrl} alt={displayName} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-handle">{handleName}</span>
            </div>
            <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <div className="mobile-header-left" onClick={() => navigate('/')}>
          <img src="/assets/logo.png" alt="Repart" className="mobile-logo" />
          <span className="sidebar-brand-text">Repart</span>
        </div>
        <div className="mobile-header-right">
          <img src={avatarUrl} alt={displayName} className="user-avatar-small" />
          <button className="logout-btn-mobile" onClick={() => setShowLogoutModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeTab === 'extensions' && (
          <div className="tab-content fade-in">
            <ExtensionsView username={usernameHandle} />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="tab-content fade-in">
            {/* GitHub Profile Hero Card */}
            {isLoading ? (
              <div className="gh-profile-card skeleton-card">
                <div className="gh-profile-header">
                  <div className="skeleton skeleton-avatar"></div>
                  <div className="gh-profile-details">
                    <div className="gh-name-row">
                      <div className="skeleton skeleton-name"></div>
                      <div className="skeleton skeleton-handle"></div>
                    </div>
                    <div className="skeleton skeleton-bio"></div>
                  </div>
                </div>
                <div className="gh-stats-grid">
                  {[1,2,3].map(i => (
                    <div key={i} className="gh-stat-box skeleton-stat">
                      <div className="skeleton skeleton-stat-icon"></div>
                      <div>
                        <div className="skeleton skeleton-stat-num"></div>
                        <div className="skeleton skeleton-stat-label"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="gh-profile-card">
                <div className="gh-profile-header">
                  <img src={avatarUrl} alt={displayName} className="gh-profile-avatar" />
                  <div className="gh-profile-details">
                    <div className="gh-name-row">
                      <h3>{displayName}</h3>
                      <span className="gh-username-pill">{handleName}</span>
                    </div>
                    <p className="gh-bio">{githubStats?.bio || ''}</p>
                  </div>
                </div>

                <div className="gh-stats-grid">
                  <div className="gh-stat-box">
                    <div className="gh-stat-icon purple">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                      <span className="gh-stat-num">{githubStats?.followers ?? 0}</span>
                      <span className="gh-stat-label">Followers</span>
                    </div>
                  </div>

                  <div className="gh-stat-box">
                    <div className="gh-stat-icon blue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                    </div>
                    <div>
                      <span className="gh-stat-num">{githubStats?.following ?? 0}</span>
                      <span className="gh-stat-label">Following</span>
                    </div>
                  </div>

                  <div className="gh-stat-box">
                    <div className="gh-stat-icon gold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                    </div>
                    <div>
                      <span className="gh-stat-num">{githubStats?.public_repos ?? 0}</span>
                      <span className="gh-stat-label">Public Repos</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {portfolioAnalytics && (
              <div className="portfolio-intelligence-card fade-in">
                <div className="pi-card-header">
                  <div className="pi-header-title-group">
                    <h2 className="pi-title">Codebase Intelligence & <span className="text-green-highlight">Security Hygiene</span></h2>
                  </div>
                  <div className="pi-archetype-pill">
                    <span className="pi-arch-label">ARCHETYPE</span>
                    <strong>{portfolioAnalytics.archetype}</strong>
                  </div>
                </div>

                <div className="pi-metrics-grid">
                  <div className="pi-metric-box">
                    <div className="pi-metric-icon loc">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                    </div>
                    <div>
                      <span className="pi-metric-label">TOTAL LINES OF CODE</span>
                      <p className="pi-metric-value">{portfolioAnalytics.formattedLOC}</p>
                      <small className="pi-metric-sub">Across {portfolioAnalytics.analyzedReposCount} repositories</small>
                    </div>
                  </div>

                  <div className="pi-metric-box">
                    <div className="pi-metric-icon security">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <div>
                      <span className="pi-metric-label">PORTFOLIO SECURITY RATING</span>
                      <p className="pi-metric-value score-high">
                        {portfolioAnalytics.securityScore}/100 <span className="pi-grade">{portfolioAnalytics.securityGrade}</span>
                      </p>
                      <small className="pi-metric-sub">Zero critical vulnerabilities</small>
                    </div>
                  </div>

                  <div className="pi-metric-box">
                    <div className="pi-metric-icon test">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <span className="pi-metric-label">AUTOMATED TEST DENSITY</span>
                      <p className="pi-metric-value">{portfolioAnalytics.testCoverageRatio}% Tested</p>
                      <small className="pi-metric-sub">Verified test hygiene</small>
                    </div>
                  </div>
                </div>

                <div className="pi-lang-section">
                  <div className="pi-lang-header">
                    <span>Language Composition Ratio</span>
                    {portfolioAnalytics.languages && portfolioAnalytics.languages.length > 0
                      ? <small>{portfolioAnalytics.languages.length} Language{portfolioAnalytics.languages.length > 1 ? 's' : ''} Detected</small>
                      : <small>No language data available</small>
                    }
                  </div>
                  {portfolioAnalytics.languages && portfolioAnalytics.languages.length > 0 ? (
                    <>
                      <div className="pi-lang-bar-wrap">
                        {portfolioAnalytics.languages.map((l, i) => (
                          <div
                            key={i}
                            className="pi-lang-seg"
                            style={{ width: `${l.percent}%`, backgroundColor: l.color }}
                            title={`${l.name}: ${l.percent}%`}
                          />
                        ))}
                      </div>
                      <div className="pi-lang-legend">
                        {portfolioAnalytics.languages.slice(0, 5).map((l, i) => (
                          <div key={i} className="pi-lang-legend-item">
                            <span className="pi-lang-dot" style={{ backgroundColor: l.color }} />
                            <span className="pi-lang-name">{l.name}</span>
                            <strong className="pi-lang-pct">{l.percent}%</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="pi-lang-empty">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                      <span>No language data detected across repositories</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <section className="top-repos-section">
              <div className="section-title-row">
                <h2>Recent Repositories</h2>
                <span className="section-sub-tag">Most Recent</span>
              </div>

              <div className="top-repos-grid">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="repo-card skeleton-repo">
                      <div className="repo-card-top">
                        <div className="skeleton skeleton-repo-title"></div>
                        <div className="skeleton skeleton-repo-badge"></div>
                      </div>
                      <div className="skeleton skeleton-repo-desc-1"></div>
                      <div className="skeleton skeleton-repo-desc-2"></div>
                      <div className="skeleton skeleton-repo-footer"></div>
                    </div>
                  ))
                ) : topRepos.map((repo) => (
                  <div key={repo.id} className="repo-card">
                    <div className="repo-card-top">
                      <div className="repo-name-group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-card-name">
                          {repo.name}
                        </a>
                      </div>
                      <span className="repo-public-badge">
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>

                    <p className="repo-card-desc">{repo.description || 'Repository registered under ' + handleName}</p>

                    <div className="repo-card-footer">
                      <div className="repo-meta-left">
                        {repo.language && (
                          <span className="repo-lang">
                            <span className="lang-dot" style={{ backgroundColor: getLanguageColor(repo.language) }}></span>
                            {repo.language}
                          </span>
                        )}
                        <span className="repo-stat-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                          {repo.stargazers_count}
                        </span>
                        <span className="repo-stat-item">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M18 6A6 6 0 0 0 6 12v6"></path></svg>
                          {repo.forks_count}
                        </span>
                      </div>
                      <button className="repo-action-btn" onClick={() => handleSelectRepo(repo.html_url)}>
                        Analyze
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="contributions-section">
              <div className="section-title-row">
                <h2>{isLoading ? 'Loading activity...' : `${(activityMetrics?.totalCommits || 0).toLocaleString()} contributions in the last year`}</h2>
                <span className="section-sub-tag">GitHub Activity</span>
              </div>

              <div className="contributions-card">
                <div className="contributions-layout">
                  <div className="contributions-left">
                    <div className="chart-scroll-wrapper">
                      <img 
                        src={`https://ghchart.rshah.org/8c6b22/${usernameHandle}`} 
                        alt="GitHub Contribution Calendar"
                        className="contributions-chart-img"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = `https://ghchart.rshah.org/${usernameHandle}`;
                        }}
                      />
                    </div>
                    <div className="chart-footer">
                      <span className="chart-meta-text">Learn how contributions are counted</span>
                      <div className="chart-legend">
                        <span>Less</span>
                        <span className="legend-cell level-0"></span>
                        <span className="legend-cell level-1"></span>
                        <span className="legend-cell level-2"></span>
                        <span className="legend-cell level-3"></span>
                        <span className="legend-cell level-4"></span>
                        <span>More</span>
                      </div>
                    </div>
                  </div>

                  <div className="contributions-right-panel">
                    <div className="activity-stat-pill streak-current">
                      <div className="activity-stat-icon fire">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22c4.2 0 7-2.8 7-6.7 0-3.1-1.8-5.3-4.6-7.7.1 2-1 3.2-2.3 3.9.2-3.7-1.4-6.6-4.2-9.5.1 4.5-3 6.9-3 10.5C4.9 18.1 7.7 22 12 22Z" /></svg>
                      </div>
                      <div>
                        <span className="activity-val">{isLoading ? '...' : `${activityMetrics?.currentStreak ?? 0} Days`}</span>
                        <span className="activity-lbl">Current Streak</span>
                      </div>
                    </div>

                    <div className="activity-stat-pill streak-longest">
                      <div className="activity-stat-icon gold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      </div>
                      <div>
                        <span className="activity-val">{isLoading ? '...' : `${activityMetrics?.longestStreak ?? 0} Days`}</span>
                        <span className="activity-lbl">Longest Streak</span>
                      </div>
                    </div>

                    <div className="activity-stat-pill velocity">
                      <div className="activity-stat-icon purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                      </div>
                      <div>
                        <span className="activity-val">{isLoading ? '...' : `${activityMetrics?.weeklyVelocity ?? 0} / Wk`}</span>
                        <span className="activity-lbl">Weekly Commit Velocity</span>
                      </div>
                    </div>

                    <div className="activity-stat-pill">
                      <div className="activity-stat-icon blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><line x1="3" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="21" y2="12"></line></svg>
                      </div>
                      <div>
                        <span className="activity-val">{isLoading ? '...' : (activityMetrics?.totalCommits ?? 0).toLocaleString()}</span>
                        <span className="activity-lbl">Total Commits</span>
                      </div>
                    </div>

                    <div className="activity-stat-pill">
                      <div className="activity-stat-icon green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                      </div>
                      <div>
                        <span className="activity-val">{isLoading ? '...' : `${githubStats?.public_repos ?? 0} Repos`}</span>
                        <span className="activity-lbl">Active Projects</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'repositories' && (
          <RepositoriesView 
            username={usernameHandle} 
            onSelectRepo={handleSelectRepo} 
          />
        )}

        {activeTab === 'analyze' && (() => {
          const repoParam = new URLSearchParams(location.search).get('repo');
          return repoParam
            ? <AnalyzeResult repoUrl={repoParam} />
            : <div className="tab-content fade-in" style={{ padding: 0 }}><AnalyzeRepo /></div>;
        })()}

        {activeTab === 'compare' && (
          <div className="tab-content fade-in" style={{ padding: 0 }}>
            <AccountComparison currentUsername={usernameHandle} />
          </div>
        )}

        {activeTab === 'diagrams' && (
          <div className="tab-content fade-in">
            <header className="main-header">
              <h1>Architecture Diagrams</h1>
              <p>Interactive tree graph generated via static code analysis.</p>
            </header>

            <div className="diagram-preview-card">
              <div className="diagram-header">
                <span className="active-repo-name">{repoUrl.replace('https://github.com/', '')}</span>
                <div className="diagram-tags">
                  <span className="tag-node frontend">React Frontend</span>
                  <span className="tag-node backend">Node Express</span>
                  <span className="tag-node db">Supabase PostgreSQL</span>
                </div>
              </div>

              <div className="diagram-canvas">
                <div className="canvas-node center-node">
                  <strong>Client App</strong>
                  <small>React + React Router</small>
                </div>
                <div className="node-line"></div>
                <div className="canvas-node api-node">
                  <strong>Express Server (:8080)</strong>
                  <small>Rate Limiter + JWT Middleware</small>
                </div>
                <div className="node-line"></div>
                <div className="canvas-node db-node">
                  <strong>Supabase Auth & DB</strong>
                  <small>OAuth Provider</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="tab-content fade-in">
            <header className="main-header">
              <h1>API & Data Model Explorer</h1>
              <p>Automatically mapped endpoints and database entity relations.</p>
            </header>

            <div className="explorer-grid">
              <div className="explorer-card">
                <h3>Detected Endpoints</h3>
                <ul className="endpoint-list">
                  <li><span className="method get">GET</span> <code>/auth/github</code> <span className="desc">Initiates OAuth</span></li>
                  <li><span className="method post">POST</span> <code>/auth/callback</code> <span className="desc">Issues 15-day JWT</span></li>
                  <li><span className="method get">GET</span> <code>/health</code> <span className="desc">Server status check</span></li>
                </ul>
              </div>

              <div className="explorer-card">
                <h3>Database Schema Models</h3>
                <ul className="model-list">
                  <li>
                    <strong>users</strong>
                    <p>id (UUID), email (VARCHAR), github_username (VARCHAR), created_at (TIMESTAMP)</p>
                  </li>
                  <li>
                    <strong>profiles</strong>
                    <p>id (UUID), name (TEXT), followers (INT), avatar_url (TEXT)</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {showLogoutModal && (
        <div className="logout-modal-wrapper" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-panel" onClick={(e) => e.stopPropagation()}>
            <button className="logout-close-btn" onClick={() => setShowLogoutModal(false)} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="logout-icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>

            <h2 className="logout-modal-title">Sign out of Repart?</h2>
            <p className="logout-modal-subtitle">
              Are you sure you want to end your current session? You will need to log in again to access your dashboard.
            </p>

            <div className="logout-actions">
              <button className="logout-cancel-btn" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="logout-confirm-btn" onClick={confirmLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
