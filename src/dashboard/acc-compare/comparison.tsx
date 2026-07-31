import React, { useState, useEffect } from 'react';
import {
  Trophy, Swords, Star, GitFork, Users, Code, Award, Sparkles,
  ExternalLink, RefreshCw, ShieldAlert, ShieldCheck, Zap, Wrench
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './comparison.css';

import { apiFetch } from '../../api/api.tsx';

const PRESET_USERS = [
  { username: 'torvalds', label: 'Linus Torvalds' },
  { username: 'gaearon', label: 'Dan Abramov' },
  { username: 'yyx99', label: 'Evan You' },
  { username: 'sindresorhus', label: 'Sindre Sorhus' },
  { username: 'tj', label: 'TJ Holowaychuk' }
];

export default function AccountComparison({ currentUsername }: { currentUsername: string }) {
  const [user1, setUser1] = useState(currentUsername || 'sanketpadhyal');
  const [user2, setUser2] = useState('gaearon');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<any>(null);

  const fetchComparison = async (u1: string, u2: string) => {
    if (!u1 || !u2) {
      setError('Please enter two GitHub usernames to compare.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const storedUser = JSON.parse(localStorage.getItem('repart_user') || '{}');
      const token = storedUser?.provider_token || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `token ${token}`;

      const res = await apiFetch(`/api/compare?user1=${encodeURIComponent(u1)}&user2=${encodeURIComponent(u2)}`, { headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `GitHub API limit reached or account not found. Please verify usernames.`);
      }

      const data = await res.json();
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Could not fetch developer comparison. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUsername) {
      setUser1(currentUsername);
    }
  }, [currentUsername]);

  const handleStartDuel = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComparison(user1, user2);
  };

  // 6 Multidimensional Metrics for BarChart Comparison
  const dimensionChartData = comparison ? [
    { metric: 'Work Quality', [comparison.user1.login]: comparison.user1.engineering_score, [comparison.user2.login]: comparison.user2.engineering_score },
    { metric: 'Code Quality', [comparison.user1.login]: comparison.user1.code_quality_score, [comparison.user2.login]: comparison.user2.code_quality_score },
    { metric: 'Architecture', [comparison.user1.login]: comparison.user1.architecture_score, [comparison.user2.login]: comparison.user2.architecture_score },
    { metric: 'Security Hygiene', [comparison.user1.login]: comparison.user1.security_score, [comparison.user2.login]: comparison.user2.security_score },
    { metric: 'OS Velocity', [comparison.user1.login]: comparison.user1.velocity_score, [comparison.user2.login]: comparison.user2.velocity_score },
    { metric: 'Power Rating', [comparison.user1.login]: comparison.user1.power_score, [comparison.user2.login]: comparison.user2.power_score }
  ] : [];

  return (
    <div className="cmp-page fade-in">
      {/* Header Title */}
      <div className="cmp-header">
        <div className="cmp-title-wrap">
          <div className="cmp-icon-badge">
            <Swords size={22} />
          </div>
          <div>
            <h1>GitHub Developer Duel</h1>
            <p>Multidimensional engineering audit matchup (evaluates both open-source reach & pure work quality)</p>
          </div>
        </div>
      </div>

      {/* Duel Setup Arena Card */}
      <div className="cmp-arena-card">
        <form onSubmit={handleStartDuel} className="cmp-arena-form">
          <div className="cmp-player-box left">
            <div className="cmp-player-header">
              <span className="cmp-player-tag">Player 1 (You)</span>
            </div>
            <div className="cmp-player-row">
              {user1 && (
                <img
                  src={`https://github.com/${user1.trim()}.png`}
                  alt={user1}
                  className="cmp-arena-avatar"
                  onError={(e) => (e.currentTarget.style.opacity = '0')}
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                />
              )}
              <div className="cmp-input-wrap">
                <span className="cmp-at">@</span>
                <input
                  type="text"
                  className="cmp-input"
                  placeholder="username1"
                  value={user1}
                  onChange={(e) => setUser1(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* VS Center Badge */}
          <div className="cmp-vs-badge">
            <span>VS</span>
          </div>

          <div className="cmp-player-box right">
            <div className="cmp-player-header">
              <span className="cmp-player-tag">Player 2 (Opponent)</span>
            </div>
            <div className="cmp-player-row">
              {user2 && (
                <img
                  src={`https://github.com/${user2.trim()}.png`}
                  alt={user2}
                  className="cmp-arena-avatar"
                  onError={(e) => (e.currentTarget.style.opacity = '0')}
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                />
              )}
              <div className="cmp-input-wrap">
                <span className="cmp-at">@</span>
                <input
                  type="text"
                  className="cmp-input"
                  placeholder="username2"
                  value={user2}
                  onChange={(e) => setUser2(e.target.value)}
                  required
                />
              </div>
            </div>
            {/* Quick Opponent Suggestion Chips */}
            <div className="cmp-presets-row">
              <small>Presets:</small>
              {PRESET_USERS.map((p) => (
                <button
                  key={p.username}
                  type="button"
                  className={`cmp-preset-chip ${user2 === p.username ? 'active' : ''}`}
                  onClick={() => {
                    setUser2(p.username);
                    fetchComparison(user1, p.username);
                  }}
                >
                  {p.username}
                </button>
              ))}
            </div>
          </div>

          <div className="cmp-btn-row">
            <button type="submit" className="cmp-launch-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="cmp-spin" /> Deep Structural Audit in Progress...
                </>
              ) : (
                <>
                  <Swords size={18} /> Launch Developer Duel
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Card */}
      {error && (
        <div className="cmp-error-card">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="cmp-results-document">

          {/* 30-Second Executive Matchup Brief Banner */}
          <div className="cmp-summary-card">
            <div className="cmp-summary-head">
              <Sparkles size={18} className="cmp-gold-sparkle" />
              <h3>30-Second Matchup Executive Brief</h3>
            </div>
            <div className="cmp-summary-body">
              <p>
                <strong>@ {comparison.user1.login}</strong> demonstrates <span>{comparison.user1.engineering_score}/99 Pure Work Quality</span> with {comparison.user1.quality_breakdown?.type_safety} type safety across {comparison.user1.public_repos} repositories.
              </p>
              <p>
                <strong>@ {comparison.user2.login}</strong> demonstrates <span>{comparison.user2.engineering_score}/99 Pure Work Quality</span> with {comparison.user2.followers.toLocaleString()} community followers and {comparison.user2.total_stars.toLocaleString()} total stars.
              </p>
            </div>
          </div>

          {/* Dual Winners Banner (Overall Reach vs Pure Work Quality) */}
          <div className="cmp-dual-winners-grid">
            <div className="cmp-winner-banner work-winner">
              <div className="cmp-winner-badge">
                <Wrench size={26} className="cmp-wrench" />
                <div>
                  <h2>
                    {comparison.work_winner === 'Tie' ? 'Work Quality: Draw' : `Work Quality Winner: @${comparison.work_winner}`}
                  </h2>
                  <p>
                    {comparison.work_winner === 'Tie'
                      ? 'Both developers produce equal pure engineering work quality & type safety.'
                      : `@${comparison.work_winner} leads in pure codebase quality, stack sophistication, and type safety regardless of follower count.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="cmp-winner-banner overall-winner">
              <div className="cmp-winner-badge">
                <Trophy size={26} className="cmp-trophy" />
                <div>
                  <h2>
                    {comparison.winner === 'Tie' ? 'Reach: Draw' : `Overall Reach Winner: @${comparison.winner}`}
                  </h2>
                  <p>
                    {comparison.winner === 'Tie'
                      ? 'Both developers demonstrate equal community reach and star impact.'
                      : `@${comparison.winner} leads in overall community reach, open-source stars, and developer power rating.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Player Cards Comparison Row */}
          <div className="cmp-hero-duel-grid">
            {/* User 1 Card */}
            <div className={`cmp-hero-card ${comparison.work_winner === comparison.user1.login ? 'winner-card' : ''}`}>
              {comparison.work_winner === comparison.user1.login && (
                <div className="cmp-crown-badge work-crown"><Wrench size={12} /> WORK MVP</div>
              )}
              <div className="cmp-card-top">
                <img src={comparison.user1.avatar_url} alt={comparison.user1.login} className="cmp-avatar" />
                <div>
                  <h3 className="cmp-user-name">{comparison.user1.name}</h3>
                  <a href={comparison.user1.html_url} target="_blank" rel="noreferrer" className="cmp-user-handle">
                    @{comparison.user1.login} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <p className="cmp-bio">{comparison.user1.bio}</p>

              {/* 4 Score Badges Grid */}
              <div className="cmp-scores-quad">
                <div className="cmp-power-box work">
                  <span className="cmp-power-lbl">WORK QUALITY</span>
                  <span className="cmp-power-val">{comparison.user1.engineering_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box quality">
                  <span className="cmp-power-lbl">CODE QUALITY</span>
                  <span className="cmp-power-val">{comparison.user1.code_quality_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box arch">
                  <span className="cmp-power-lbl">STACK DIVERSITY</span>
                  <span className="cmp-power-val">{comparison.user1.architecture_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box sec">
                  <span className="cmp-power-lbl">POWER RATING</span>
                  <span className="cmp-power-val">{comparison.user1.power_score}</span>
                  <small>/ 99</small>
                </div>
              </div>

              <div className="cmp-quality-chips">
                <span className="cmp-q-chip"><ShieldCheck size={12} /> {comparison.user1.quality_breakdown?.type_safety}</span>
                <span className="cmp-q-chip"><Code size={12} /> {comparison.user1.quality_breakdown?.originality}</span>
                <span className="cmp-q-chip"><Zap size={12} /> {comparison.user1.quality_breakdown?.active_velocity}</span>
              </div>

              <div className="cmp-stats-mini-grid">
                <div className="cmp-stat-item">
                  <Star size={14} /> <strong>{comparison.user1.total_stars.toLocaleString()}</strong> <small>Stars</small>
                </div>
                <div className="cmp-stat-item">
                  <Users size={14} /> <strong>{comparison.user1.followers.toLocaleString()}</strong> <small>Followers</small>
                </div>
                <div className="cmp-stat-item">
                  <Code size={14} /> <strong>{comparison.user1.public_repos}</strong> <small>Repos</small>
                </div>
                <div className="cmp-stat-item">
                  <GitFork size={14} /> <strong>{comparison.user1.total_forks.toLocaleString()}</strong> <small>Forks</small>
                </div>
              </div>
            </div>

            {/* User 2 Card */}
            <div className={`cmp-hero-card ${comparison.work_winner === comparison.user2.login ? 'winner-card' : ''}`}>
              {comparison.work_winner === comparison.user2.login && (
                <div className="cmp-crown-badge work-crown"><Wrench size={12} /> WORK MVP</div>
              )}
              <div className="cmp-card-top">
                <img src={comparison.user2.avatar_url} alt={comparison.user2.login} className="cmp-avatar" />
                <div>
                  <h3 className="cmp-user-name">{comparison.user2.name}</h3>
                  <a href={comparison.user2.html_url} target="_blank" rel="noreferrer" className="cmp-user-handle">
                    @{comparison.user2.login} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
              <p className="cmp-bio">{comparison.user2.bio}</p>

              {/* 4 Score Badges Grid */}
              <div className="cmp-scores-quad">
                <div className="cmp-power-box work">
                  <span className="cmp-power-lbl">WORK QUALITY</span>
                  <span className="cmp-power-val">{comparison.user2.engineering_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box quality">
                  <span className="cmp-power-lbl">CODE QUALITY</span>
                  <span className="cmp-power-val">{comparison.user2.code_quality_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box arch">
                  <span className="cmp-power-lbl">STACK DIVERSITY</span>
                  <span className="cmp-power-val">{comparison.user2.architecture_score}</span>
                  <small>/ 99</small>
                </div>
                <div className="cmp-power-box sec">
                  <span className="cmp-power-lbl">POWER RATING</span>
                  <span className="cmp-power-val">{comparison.user2.power_score}</span>
                  <small>/ 99</small>
                </div>
              </div>

              <div className="cmp-quality-chips">
                <span className="cmp-q-chip"><ShieldCheck size={12} /> {comparison.user2.quality_breakdown?.type_safety}</span>
                <span className="cmp-q-chip"><Code size={12} /> {comparison.user2.quality_breakdown?.originality}</span>
                <span className="cmp-q-chip"><Zap size={12} /> {comparison.user2.quality_breakdown?.active_velocity}</span>
              </div>

              <div className="cmp-stats-mini-grid">
                <div className="cmp-stat-item">
                  <Star size={14} /> <strong>{comparison.user2.total_stars.toLocaleString()}</strong> <small>Stars</small>
                </div>
                <div className="cmp-stat-item">
                  <Users size={14} /> <strong>{comparison.user2.followers.toLocaleString()}</strong> <small>Followers</small>
                </div>
                <div className="cmp-stat-item">
                  <Code size={14} /> <strong>{comparison.user2.public_repos}</strong> <small>Repos</small>
                </div>
                <div className="cmp-stat-item">
                  <GitFork size={14} /> <strong>{comparison.user2.total_forks.toLocaleString()}</strong> <small>Forks</small>
                </div>
              </div>
            </div>
          </div>

          {/* 6-Dimension Comparative Bar Chart */}
          <div className="cmp-chart-card">
            <h3><Sparkles size={16} /> 6-Dimensional Architectural Comparison</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={dimensionChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={comparison.user1.login} fill="#8c6b22" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={comparison.user2.login} fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category-by-Category Breakdown Table */}
          <div className="cmp-table-card">
            <h3><Award size={16} /> 10-Point Matchup Matrix</h3>
            <div className="cmp-table">
              <div className="cmp-tr head">
                <div className="cmp-td">Category</div>
                <div className="cmp-td">@{comparison.user1.login}</div>
                <div className="cmp-td">@{comparison.user2.login}</div>
                <div className="cmp-td">Advantage</div>
              </div>

              <div className="cmp-tr highlight-row">
                <div className="cmp-td font-bold">Pure Work & Engineering Quality</div>
                <div className="cmp-td font-bold">{comparison.user1.engineering_score}/99</div>
                <div className="cmp-td font-bold">{comparison.user2.engineering_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.work === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.work || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Code Quality Index</div>
                <div className="cmp-td">{comparison.user1.code_quality_score}/99</div>
                <div className="cmp-td">{comparison.user2.code_quality_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.quality === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.quality || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Stack Sophistication</div>
                <div className="cmp-td">{comparison.user1.architecture_score}/99</div>
                <div className="cmp-td">{comparison.user2.architecture_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.architecture === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.architecture || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Security Hygiene Rating</div>
                <div className="cmp-td">{comparison.user1.security_score}/99</div>
                <div className="cmp-td">{comparison.user2.security_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.security === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.security || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Open-Source Velocity</div>
                <div className="cmp-td">{comparison.user1.velocity_score}/99</div>
                <div className="cmp-td">{comparison.user2.velocity_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.velocity === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.velocity || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Developer Power Rating</div>
                <div className="cmp-td">{comparison.user1.power_score}/99</div>
                <div className="cmp-td">{comparison.user2.power_score}/99</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners?.power === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners?.power || 'Tie'}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Community Followers</div>
                <div className="cmp-td">{comparison.user1.followers.toLocaleString()}</div>
                <div className="cmp-td">{comparison.user2.followers.toLocaleString()}</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners.followers === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners.followers}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Open Source Stars</div>
                <div className="cmp-td">{comparison.user1.total_stars.toLocaleString()}</div>
                <div className="cmp-td">{comparison.user2.total_stars.toLocaleString()}</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners.stars === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners.stars}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Total Repositories</div>
                <div className="cmp-td">{comparison.user1.public_repos}</div>
                <div className="cmp-td">{comparison.user2.public_repos}</div>
                <div className="cmp-td adv">
                  <span className={`cmp-winner-chip ${comparison.category_winners.repos === comparison.user1.login ? 'u1' : 'u2'}`}>
                    @{comparison.category_winners.repos}
                  </span>
                </div>
              </div>

              <div className="cmp-tr">
                <div className="cmp-td font-bold">Primary Ecosystem</div>
                <div className="cmp-td">{comparison.user1.primary_language}</div>
                <div className="cmp-td">{comparison.user2.primary_language}</div>
                <div className="cmp-td adv">—</div>
              </div>
            </div>
          </div>

          {/* Repart Watermark Footer */}
          <div className="cmp-watermark-row">
            <span>⚡ Repart Hyper-Level Engineering Audit Engine v3.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
