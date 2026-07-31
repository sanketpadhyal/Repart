import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api/api.tsx';
import './repositories.css';

export interface RepositoryItem {
  id: number | string;
  name: string;
  full_name: string;
  description: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  private?: boolean;
  visibility?: string;
  updated_at?: string;
  is_pinned?: boolean;
}

interface RepositoriesProps {
  username?: string;
  onSelectRepo?: (repoUrl: string) => void;
}

export const RepositoriesView: React.FC<RepositoriesProps> = ({ username = '', onSelectRepo }) => {
  const [repositories, setRepositories] = useState<RepositoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when ⌘K or / key shortcut is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch live repositories (public & private) from backend
  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `repart_repos_cache_v2_${username}`;
    const cachedStr = sessionStorage.getItem(cacheKey);
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.timestamp < 10 * 60 * 1000 && Array.isArray(cached.repos) && cached.repos.length > 0) {
          setRepositories(cached.repos);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem(cacheKey);
      }
    }

    setIsLoading(true);
    const reqHeaders: Record<string, string> = {};
    const storedUserStr = localStorage.getItem('repart_user');
    if (storedUserStr) {
      try {
        const parsed = JSON.parse(storedUserStr);
        if (parsed.provider_token) {
          reqHeaders['Authorization'] = `token ${parsed.provider_token}`;
        }
      } catch (e) {}
    }

    apiFetch(`/api/github/user-full/${username}`, { headers: reqHeaders })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          const pinnedList = (data.repos || []).map((r: any) => ({ ...r, is_pinned: true }));
          const pinnedNames = new Set(pinnedList.map((r: any) => r.name.toLowerCase()));
          const otherRepos = (data.allRepos || []).filter((r: any) => !pinnedNames.has(r.name.toLowerCase()));
          const combined = [...pinnedList, ...otherRepos];

          if (combined.length > 0) {
            setRepositories(combined);
            sessionStorage.setItem(cacheKey, JSON.stringify({
              timestamp: Date.now(),
              repos: combined
            }));
          }
        }
      })
      .catch(err => {
        console.warn("Error fetching repositories:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const getLanguageColor = (lang?: string) => {
    switch (lang) {
      case 'TypeScript': return '#3178c6';
      case 'JavaScript': return '#f1e05a';
      case 'Python': return '#3572A5';
      case 'HTML': return '#e34c26';
      case 'CSS': return '#563d7c';
      case 'Java': return '#b07219';
      case 'Go': return '#00ADD8';
      case 'Rust': return '#dea584';
      default: return '#8c6b22';
    }
  };

  // Filter & Sort logic
  const filteredRepos = repositories.filter(repo => {
    // Search query filter
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type filter (All, Public, Private)
    const isPrivate = repo.private || repo.visibility === 'private';
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'public' && !isPrivate) ||
      (typeFilter === 'private' && isPrivate);

    // Language filter
    const matchesLang = languageFilter === 'all' || 
      (repo.language && repo.language.toLowerCase() === languageFilter.toLowerCase());

    return matchesSearch && matchesType && matchesLang;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'stars') {
      return b.stargazers_count - a.stargazers_count;
    } else {
      const timeA = new Date(a.updated_at || 0).getTime();
      const timeB = new Date(b.updated_at || 0).getTime();
      return timeB - timeA;
    }
  });

  return (
    <div className="repos-page-container fade-in">
      {/* Header Row */}
      <div className="repos-header-row">
        <div className="repos-title-group">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8c6b22" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            Repositories
            {!isLoading && <span className="repos-count-badge">{repositories.length} Repos</span>}
          </h1>
          <p>Browse, search, and analyze all your public and private GitHub repositories.</p>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="repos-controls-bar">
        <div className="repos-search-box">
          <svg className="repos-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            ref={searchInputRef}
            type="text" 
            className="repos-search-input"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="repos-shortcut-kbd">⌘K</kbd>
        </div>

        <div className="repos-filters-group">
          {/* Type Filter */}
          <select 
            className="repos-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Type: All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {/* Language Filter */}
          <select 
            className="repos-filter-select"
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
          >
            <option value="all">Language: All</option>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          {/* Sort By */}
          <select 
            className="repos-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updated">Sort: Last Updated</option>
            <option value="name">Sort: Name</option>
            <option value="stars">Sort: Stars</option>
          </select>
        </div>
      </div>

      {/* Repositories Grid / Skeletons / Empty State */}
      <div className="repos-grid">
        {isLoading ? (
          // Smooth Skeleton Cards
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="repo-skeleton-card">
              <div className="repo-card-top">
                <div className="skeleton-box skeleton-title"></div>
                <div className="skeleton-box skeleton-badge"></div>
              </div>
              <div className="skeleton-box skeleton-text-1"></div>
              <div className="skeleton-box skeleton-text-2"></div>
              <div className="skeleton-box skeleton-footer"></div>
            </div>
          ))
        ) : filteredRepos.length > 0 ? (
          filteredRepos.map(repo => {
            const isPrivate = repo.private || repo.visibility === 'private';
            return (
              <div key={repo.id} className="repo-card">
                <div>
                  <div className="repo-card-top">
                    <div className="repo-name-group">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="repo-card-name"
                      >
                        {repo.name}
                      </a>
                    </div>
                    <span className="repo-public-badge">
                      {isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>

                  <p className="repo-card-desc">
                    {repo.description || `Repository ${repo.name} owned by @${username}`}
                  </p>
                </div>

                <div className="repo-card-footer">
                  <div className="repo-meta-left">
                    {repo.language && (
                      <span className="repo-lang">
                        <span 
                          className="lang-dot" 
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        ></span>
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

                  {onSelectRepo && (
                    <button 
                      className="repo-action-btn"
                      onClick={() => onSelectRepo(repo.html_url)}
                    >
                      Analyze
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="repos-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>No repositories found</h3>
            <p>Try adjusting your search query or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoriesView;
