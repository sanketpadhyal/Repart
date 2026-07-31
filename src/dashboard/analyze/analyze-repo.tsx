import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './analyze-repo.css';

interface AnalyzeRepoProps {
  initialUrl?: string;
}

const AnalyzeRepo: React.FC<AnalyzeRepoProps> = ({ initialUrl = '' }) => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState<string>(initialUrl);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const isValidGitHubUrl = (url: string) => {
    return /^https?:\/\/(www\.)?github\.com\/[^/]+\/[^/]+/.test(url.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    if (!isValidGitHubUrl(repoUrl)) {
      setError('Enter a valid GitHub URL like: https://github.com/user/repo');
      return;
    }
    // Navigate to the result page with the repo URL as query param
    navigate(`/dashboard/analyze?repo=${encodeURIComponent(repoUrl.trim())}`);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then(text => {
      if (text) setRepoUrl(text.trim());
    }).catch(() => {});
  };

  const exampleRepos = [
    { label: 'facebook/react', url: 'https://github.com/facebook/react' },
    { label: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
    { label: 'tailwindlabs/tailwindcss', url: 'https://github.com/tailwindlabs/tailwindcss' },
  ];

  return (
    <div className="analyze-page">
      {/* Hero */}
      <div className="analyze-hero">
        <h1 className="analyze-title">
          Analyze Any
          <span className="analyze-title-gradient"> GitHub Repository</span>
        </h1>
        <p className="analyze-subtitle">
          Paste any public or private GitHub repo URL and get a deep architectural analysis — dependencies, structure, patterns and more.
        </p>
      </div>

      {/* Big Search Form */}
      <form className="analyze-form" onSubmit={handleSubmit}>
        <div className={`analyze-input-wrap ${isFocused ? 'focused' : ''} ${error ? 'has-error' : ''}`}>
          <div className="analyze-input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            className="analyze-input"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={e => { setRepoUrl(e.target.value); setError(''); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
            spellCheck={false}
          />

          {!repoUrl && (
            <button type="button" className="analyze-paste-btn" onClick={handlePaste} tabIndex={-1}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              Paste
            </button>
          )}

          {repoUrl && (
            <button type="button" className="analyze-clear-btn" onClick={() => { setRepoUrl(''); setError(''); inputRef.current?.focus(); }} tabIndex={-1}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}

          <button type="submit" className="analyze-submit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            Analyze
          </button>
        </div>

        {error && (
          <p className="analyze-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </p>
        )}
      </form>

      {/* Example repos */}
      <div className="analyze-examples">
        <span className="analyze-examples-label">Try an example:</span>
        <div className="analyze-example-chips">
          {exampleRepos.map(r => (
            <button
              key={r.url}
              type="button"
              className="analyze-example-chip"
              onClick={() => { setRepoUrl(r.url); setError(''); inputRef.current?.focus(); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature tags */}
      <div className="analyze-features">
        <div className="analyze-feature-tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
          <span>File Tree</span>
        </div>
        <div className="analyze-feature-tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
          <span>Dependency Graph</span>
        </div>
        <div className="analyze-feature-tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
          <span>AST Parsing</span>
        </div>
        <div className="analyze-feature-tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>Private Repos</span>
        </div>
        <div className="analyze-feature-tag">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          <span>Code Metrics</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeRepo;
