import React, { useState, useEffect } from 'react';
import {
  Blocks, CheckCircle2, ExternalLink, RefreshCw,
  Search, Globe, ChevronRight, Lock, Server
} from 'lucide-react';
import './extentions.css';

import { apiFetch } from '../api/api.tsx';

interface ExtensionItem {
  id: string;
  name: string;
  slug?: string;
  icon: string;
  category: string;
  description: string;
  status: 'Connected' | 'Available' | 'Active';
  permissions: string[];
  connected_at?: string;
  doc_url?: string;
}

export default function ExtensionsView({ username }: { username: string }) {
  const [extensions, setExtensions] = useState<ExtensionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [totalConnectedCount, setTotalConnectedCount] = useState(0);

  const fetchExtensions = async () => {
    setIsLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('repart_user') || '{}');
      const token = storedUser?.provider_token || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `token ${token}`;

      const res = await apiFetch(`/api/extensions/${encodeURIComponent(username || 'user')}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setExtensions(data.extensions || []);
        setTotalConnectedCount(data.total_connected || 0);
      }
    } catch (err) {
      console.error('Error loading extensions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const categories = ['All', 'Connected', 'Cloud & Deployment', 'CI / CD', 'Database', 'Security'];

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Connected') {
      matchesFilter = ext.status === 'Connected';
    } else if (activeFilter === 'Cloud & Deployment') {
      matchesFilter = ext.category.includes('Cloud') || ext.category.includes('Deployment');
    } else if (activeFilter === 'CI / CD') {
      matchesFilter = ext.category.includes('CI') || ext.category.includes('Container');
    } else if (activeFilter === 'Database') {
      matchesFilter = ext.category.includes('Database');
    } else if (activeFilter === 'Security') {
      matchesFilter = ext.category.includes('Security');
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="ext-page fade-in">
      {/* Header */}
      <div className="ext-header">
        <div className="ext-title-wrap">
          <div className="ext-icon-badge">
            <Blocks size={22} />
          </div>
          <div>
            <h1>Connected Cloud Platforms & Extensions</h1>
            <p>Real-time GitHub integrations: GCP, AWS, Vercel, Supabase, Actions, Docker, Dependabot & Ecosystem Apps</p>
          </div>
        </div>
        <button onClick={fetchExtensions} className="ext-refresh-btn" disabled={isLoading}>
          <RefreshCw size={14} className={isLoading ? 'ext-spin' : ''} /> Sync Integrations
        </button>
      </div>

      {/* Account & Connection Bar */}
      <div className="ext-account-bar">
        <div className="ext-account-info">
          <Globe size={16} className="ext-gold-icon" />
          <span>Connected GitHub Account: <strong>@{username || 'Developer'}</strong></span>
        </div>
        <div className="ext-summary-pills">
          <span className="summary-chip green"><Server size={13} /> {totalConnectedCount} Platforms Connected</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="ext-controls-row">
        <div className="ext-search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search Google Cloud, AWS, Vercel, Supabase, Actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ext-search-input"
          />
        </div>

        <div className="ext-filter-pills">
          {categories.map(filter => (
            <button
              key={filter}
              className={`ext-filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions Cards Grid */}
      <div className="ext-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ext-card skeleton-card">
              <div className="skeleton skeleton-icon"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-desc"></div>
            </div>
          ))
        ) : filteredExtensions.length > 0 ? (
          filteredExtensions.map(ext => (
            <div key={ext.id} className={`ext-card ${ext.status === 'Connected' ? 'connected' : ''}`}>
              <div className="ext-card-header">
                <div className="ext-brand">
                  <img
                    src={ext.icon}
                    alt={ext.name}
                    className="ext-brand-icon"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
                    }}
                  />
                  <div>
                    <h3>{ext.name}</h3>
                    <span className="ext-category-tag">{ext.category}</span>
                  </div>
                </div>
                <span className={`ext-badge ${ext.status.toLowerCase()}`}>
                  {ext.status === 'Connected' && <CheckCircle2 size={12} />}
                  {ext.status}
                </span>
              </div>

              <p className="ext-description">{ext.description}</p>

              <div className="ext-permissions-box">
                <span className="permissions-lbl"><Lock size={12} /> Integration Scope:</span>
                <div className="permissions-chips">
                  {ext.permissions.map((p, idx) => (
                    <span key={idx} className="perm-chip">{p}</span>
                  ))}
                </div>
              </div>

              <div className="ext-card-footer">
                {ext.doc_url && (
                  <a href={ext.doc_url} target="_blank" rel="noreferrer" className="ext-doc-link">
                    Docs <ExternalLink size={12} />
                  </a>
                )}
                <button
                  className={`ext-action-btn ${ext.status === 'Connected' ? 'manage' : 'connect'}`}
                  onClick={() => {
                    if (ext.doc_url) window.open(ext.doc_url, '_blank');
                  }}
                >
                  {ext.status === 'Connected' ? 'Configure' : 'Connect Platform'} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="ext-empty">
            <Blocks size={36} />
            <h3>No platforms found</h3>
            <p>Try refining your search query or reset the category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
