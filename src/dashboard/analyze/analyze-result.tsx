import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, ExternalLink, Star, GitFork, Eye, AlertCircle, FileCode, Scale,
  HardDrive, GitBranch, Calendar, Layers, ShieldCheck, Zap, Activity,
  Cpu, Clock, Code, Folder, File, ChevronRight, ChevronDown, CheckCircle2,
  AlertTriangle, ShieldAlert, Globe, Users, BookOpen, Info, Search, Lightbulb,
  PieChart as PieIcon, BarChart2, Sparkles, Check, ArrowRight
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import './analyze-result.css';

import { apiFetch } from '../../api/api.tsx';

const SCAN_STEPS = [
  { id: 1, label: 'Fetching repository metadata' },
  { id: 2, label: 'Reading file tree' },
  { id: 3, label: 'Analyzing language breakdown' },
  { id: 4, label: 'Fetching top contributors' },
  { id: 5, label: 'Scanning dependencies' },
  { id: 6, label: 'Reading README' },
  { id: 7, label: 'Detecting tech stack & architecture' },
  { id: 8, label: 'Running security audit' },
  { id: 9, label: 'Computing performance & health metrics' },
  { id: 10, label: 'Compiling full audit report' }
];

const SECTIONS = [
  { id: 'summary', label: 'Summary', icon: Sparkles },
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'languages', label: 'Languages', icon: Code },
  { id: 'tree', label: 'File Tree', icon: Folder },
  { id: 'dependencies', label: 'Dependencies', icon: Code },
  { id: 'routes', label: 'API Routes', icon: Globe },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'health', label: 'Code Health', icon: Activity },
  { id: 'stack', label: 'Tech Stack', icon: Cpu },
  { id: 'contributors', label: 'Contributors', icon: Users },
  { id: 'readme', label: 'README', icon: BookOpen },
  { id: 'timeline', label: 'Timeline', icon: Clock }
];

const FOLDER_PURPOSES: Record<string, { purpose: string; color: string }> = {
  'app': { purpose: 'Next.js App Router routes & layouts', color: '#8c6b22' },
  'pages': { purpose: 'Page-level route components', color: '#8c6b22' },
  'components': { purpose: 'Reusable UI components', color: '#16a34a' },
  'src': { purpose: 'Primary source code directory', color: '#2563eb' },
  'api': { purpose: 'Backend API endpoints & handlers', color: '#d97706' },
  'routes': { purpose: 'Application route handlers', color: '#d97706' },
  'controllers': { purpose: 'Request validation & business handlers', color: '#d97706' },
  'services': { purpose: 'Core business logic & data services', color: '#059669' },
  'lib': { purpose: 'Shared utilities & third-party wrappers', color: '#6b7280' },
  'utils': { purpose: 'Helper functions', color: '#6b7280' },
  'hooks': { purpose: 'Custom React state hooks', color: '#7c3aed' },
  'types': { purpose: 'TypeScript type definitions & interfaces', color: '#3178c6' },
  'styles': { purpose: 'Stylesheets & CSS design tokens', color: '#c026d3' },
  'tests': { purpose: 'Automated test suite', color: '#dc2626' },
  '__tests__': { purpose: 'Jest unit & integration tests', color: '#dc2626' },
  'prisma': { purpose: 'Prisma ORM schema & migrations', color: '#5a67d8' },
  'docker': { purpose: 'Container configurations', color: '#2496ed' },
  '.github': { purpose: 'GitHub Actions CI/CD workflows', color: '#2088ff' }
};

const CHART_COLORS = [
  '#8c6b22', '#2563eb', '#16a34a', '#d97706', '#7c3aed',
  '#c026d3', '#059669', '#2496ed', '#dc2626', '#3178c6'
];

function getLangColor(lang: string): string {
  const map: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    HTML: '#e34c26', CSS: '#563d7c', Go: '#00ADD8', Rust: '#dea584',
    Java: '#b07219', C: '#555555', 'C++': '#f34b7d', Ruby: '#701516',
    PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Shell: '#89e051'
  };
  return map[lang] || '#8c6b22';
}

function processReadmeHtml(raw: string): string {
  if (!raw) return '';
  let html = raw;
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%; height:auto;" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre className="ar-md-code-block"><code>$1</code></pre>');
  return html;
}

function TreeNode({ node, level = 0 }: { node: any; level?: number }) {
  const [open, setOpen] = useState(level < 2);
  const isDir = node.type === 'tree';

  return (
    <div className="ar-tree-node" style={{ paddingLeft: `${level * 12}px` }}>
      <div className="ar-tree-row" onClick={() => isDir && setOpen(!open)}>
        {isDir ? (
          open ? <ChevronDown size={14} className="ar-tree-arrow" /> : <ChevronRight size={14} className="ar-tree-arrow" />
        ) : (
          <span className="ar-tree-spacer" />
        )}
        {isDir ? <Folder size={15} className="ar-tree-folder-icon" /> : <File size={14} className="ar-tree-file-icon" />}
        <span className={isDir ? 'ar-tree-dir-name' : 'ar-tree-file-name'}>{node.name}</span>
        {FOLDER_PURPOSES[node.name] && isDir && (
          <span className="ar-folder-badge" style={{ background: FOLDER_PURPOSES[node.name].color }}>
            {FOLDER_PURPOSES[node.name].purpose}
          </span>
        )}
        {!isDir && node.size > 0 && (
          <span className="ar-tree-size">{node.size > 1024 ? `${(node.size / 1024).toFixed(1)} KB` : `${node.size} B`}</span>
        )}
      </div>
      {isDir && open && node.children && (
        <div className="ar-tree-children">
          {node.children.map((child: any, i: number) => (
            <TreeNode key={i} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExplainCardProps {
  detected: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
}

function AuditExplainCard({ detected, explanation, whyItMatters, recommendation }: ExplainCardProps) {
  return (
    <div className="ar-explain-card">
      <div className="ar-explain-row">
        <div className="ar-explain-icon detected"><Search size={14} /></div>
        <div>
          <span className="ar-explain-label">Detected Signal</span>
          <p className="ar-explain-value">{detected}</p>
        </div>
      </div>
      <div className="ar-explain-row">
        <div className="ar-explain-icon meaning"><Info size={14} /></div>
        <div>
          <span className="ar-explain-label">What This Means (Simple English)</span>
          <p className="ar-explain-text">{explanation}</p>
        </div>
      </div>
      <div className="ar-explain-row">
        <div className="ar-explain-icon why"><AlertTriangle size={14} /></div>
        <div>
          <span className="ar-explain-label">Why It Matters</span>
          <p className="ar-explain-text">{whyItMatters}</p>
        </div>
      </div>
      <div className="ar-explain-row">
        <div className="ar-explain-icon rec"><Lightbulb size={14} /></div>
        <div>
          <span className="ar-explain-label">Architectural Recommendation</span>
          <p className="ar-explain-text">{recommendation}</p>
        </div>
      </div>
    </div>
  );
}

function ClockGauge({ percent, color, size = 52 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  const angle = -90 + (percent / 100) * 360;
  const needleLength = radius - 6;
  const radians = (angle * Math.PI) / 180;
  const handX = size / 2 + needleLength * Math.cos(radians);
  const handY = size / 2 + needleLength * Math.sin(radians);

  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const tickAngle = (i * 30 - 90) * (Math.PI / 180);
    const innerR = radius - (i % 3 === 0 ? 5 : 3);
    const outerR = radius - 1;
    return {
      x1: size / 2 + innerR * Math.cos(tickAngle),
      y1: size / 2 + innerR * Math.sin(tickAngle),
      x2: size / 2 + outerR * Math.cos(tickAngle),
      y2: size / 2 + outerR * Math.sin(tickAngle),
      isMajor: i % 3 === 0
    };
  });

  return (
    <div className="ar-clock-gauge-wrap" title={`${percent}% of total system modules`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth={strokeWidth}
        />
        {ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isMajor ? '#a1a1aa' : '#e4e4e7'}
            strokeWidth={t.isMajor ? 1.5 : 1}
          />
        ))}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <circle cx={size / 2} cy={size / 2} r="2.5" fill={color} />
        <line
          x1={size / 2}
          y1={size / 2}
          x2={handX}
          y2={handY}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="ar-clock-gauge-val" style={{ color }}>{percent}%</span>
    </div>
  );
}

export default function AnalyzeResult({ repoUrl }: { repoUrl: string }) {
  const cacheKey = `repart_scan_${repoUrl}`;

  const [phase, setPhase] = useState<'scan' | 'done' | 'error'>('scan');
  const [steps, setSteps] = useState<Record<number, { status: 'pending' | 'running' | 'done'; label: string }>>(() =>
    Object.fromEntries(SCAN_STEPS.map(s => [s.id, { status: 'pending', label: s.label }]))
  );
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const abortRef = useRef<AbortController | null>(null);

  const repoName = (() => {
    try {
      const m = repoUrl.match(/github\.com[/:]([^/]+\/[^/]+)/);
      return m ? m[1] : repoUrl;
    } catch { return repoUrl; }
  })();

  const runScan = useCallback(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { report: r, ts } = JSON.parse(cached);
        if (Date.now() - ts < 30 * 60 * 1000) {
          setReport(r);
          setProgress(100);
          setSteps(Object.fromEntries(SCAN_STEPS.map(s => [s.id, { status: 'done', label: s.label }])));
          setPhase('done');
          return;
        }
      }
    } catch {}

    const user = JSON.parse(localStorage.getItem('repart_user') || '{}');
    const token = user?.provider_token || '';
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setPhase('scan');
    setError('');

    apiFetch(`/api/analyze/scan?repo=${encodeURIComponent(repoUrl)}`, {
      headers: { Accept: 'text/event-stream', ...(token ? { Authorization: `token ${token}` } : {}) },
      signal: ctrl.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        function read() {
          reader.read().then(({ done, value }) => {
            if (done) return;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));

                if (data.step === 'DONE') {
                  setReport(data.report);
                  setProgress(100);
                  setSteps(Object.fromEntries(SCAN_STEPS.map(s => [s.id, { status: 'done', label: s.label }])));
                  setPhase('done');
                  try { sessionStorage.setItem(cacheKey, JSON.stringify({ report: data.report, ts: Date.now() })); } catch {}
                  ctrl.abort();
                  return;
                }

                if (data.step === 'ERROR') {
                  setError(data.error || 'Scan failed');
                  setPhase('error');
                  ctrl.abort();
                  return;
                }

                const stepNum = data.step as number;
                setProgress(data.progress || 0);
                setSteps(prev => {
                  const next = { ...prev };
                  for (let i = 1; i < stepNum; i++) next[i] = { ...next[i], status: 'done' };
                  next[stepNum] = { ...next[stepNum], status: data.done ? 'done' : 'running', label: data.label || next[stepNum].label };
                  return next;
                });
              } catch {}
            }
            read();
          }).catch(() => {});
        }
        read();
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        setError('Could not connect to scanner. Please verify backend server is running.');
        setPhase('error');
      });
  }, [repoUrl, cacheKey]);

  useEffect(() => {
    runScan();
    return () => { abortRef.current?.abort(); };
  }, [runScan]);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    abortRef.current?.abort();
    window.history.back();
  };

  if (phase === 'scan') {
    return (
      <div className="ar-scan-page">
        <div className="ar-scan-card">
          <div className="ar-scan-header">
            <div className="ar-scan-pulse" />
            <div>
              <h3 className="ar-scan-title">Scanning Repository</h3>
              <p className="ar-scan-repo">{repoName}</p>
            </div>
          </div>
          <div className="ar-steps-list">
            {SCAN_STEPS.map(s => {
              const st = steps[s.id] || { status: 'pending', label: s.label };
              return (
                <div key={s.id} className={`ar-step ${st.status}`}>
                  <div className="ar-step-icon">
                    {st.status === 'done' && <CheckCircle2 size={16} className="ar-icon-done" />}
                    {st.status === 'running' && <span className="ar-step-spinner" />}
                    {st.status === 'pending' && <span className="ar-step-dot" />}
                  </div>
                  <span className="ar-step-label">{st.label}</span>
                  {st.status === 'running' && <span className="ar-step-tag running">Scanning...</span>}
                  {st.status === 'done' && <span className="ar-step-tag done">Complete</span>}
                </div>
              );
            })}
          </div>
          <div className="ar-progress-bar-wrap">
            <div className="ar-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <div className="ar-progress-label">{progress}% completed</div>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="ar-scan-page">
        <div className="ar-scan-card ar-error-card">
          <ShieldAlert size={36} className="ar-error-icon" />
          <h2>Analysis Failed</h2>
          <p className="ar-error-msg">{error}</p>
          <div className="ar-error-btns">
            <button className="ar-btn-primary" onClick={runScan}>Retry Scan</button>
            <button className="ar-btn-ghost" onClick={handleBack}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  const meta = report?.meta || {};
  const metrics = report?.metrics || {};
  const languages = report?.languages || [];
  const contributors = report?.contributors || [];
  const dependencies = report?.dependencies || { prod: [], dev: [] };
  const stack = report?.stack || [];
  const routes = report?.routes || [];
  const security = report?.security || { score: 100, signals: [] };
  const performance = report?.performance || { largest: [], fileCount: 0, totalSize: 0 };
  const codeHealth = report?.codeHealth || {};
  const architecture = report?.architecture || [];
  const extBreakdown = report?.ext_breakdown || [];

  // Chart Data
  const langChartData = languages.map((l: any) => ({ name: l.name, value: l.bytes }));
  const extChartData = extBreakdown.slice(0, 6).map((e: any) => ({ name: e.ext, files: e.count }));
  const routeMethodsCount: Record<string, number> = {};
  routes.forEach((r: any) => {
    const m = r.method || 'GET';
    routeMethodsCount[m] = (routeMethodsCount[m] || 0) + 1;
  });
  const routeChartData = Object.entries(routeMethodsCount).map(([method, count]) => ({ method, count }));

  // Architecture Chart Data (Files per layer)
  const archChartData = architecture.map((l: any) => ({
    name: l.label,
    files: l.files?.length || 1
  }));

  // Executive Summary Variables
  const primaryLang = languages[0]?.name || 'Standard Web Stack';
  const mainFramework = stack.find((s: any) => ['Next.js', 'React', 'Vite', 'Node.js', 'Python', 'Go'].includes(s.name))?.name || 'Custom Framework';
  const totalWeightMb = (metrics.total_size_kb / 1024).toFixed(1);

  return (
    <div className="ar-report-page">
      {/* Sticky Navigation Topbar */}
      <header className="ar-topbar">
        <button className="ar-back-btn" onClick={handleBack}>
          <ArrowLeft size={14} /> <span className="ar-back-text">Back</span>
        </button>
        <div className="ar-topbar-title-wrap">
          <span className="ar-topbar-repo">{meta.name || repoName}</span>
          {meta.html_url && (
            <a href={meta.html_url} target="_blank" rel="noreferrer" className="ar-topbar-ext">
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        <div className="ar-topbar-badges">
          <span className="ar-badge"><Star size={12} /> {meta.stars?.toLocaleString() || 0}</span>
          <span className="ar-badge desktop-only"><GitFork size={12} /> {meta.forks?.toLocaleString() || 0}</span>
          <span className={`ar-badge-vis ${meta.private ? 'private' : 'public'}`}>
            {meta.private ? 'Private' : 'Public'}
          </span>
        </div>
      </header>

      {/* Touch-optimized Sticky Section Tabs Bar */}
      <nav className="ar-tabs-bar">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              className={`ar-tab-btn ${activeTab === s.id ? 'active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              <Icon size={14} /> <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Mobile-Optimized Body Document */}
      <main className="ar-report-body">

        {/* 0. 30-SECOND EXECUTIVE SUMMARY BANNER */}
        <section id="sec-summary" className="ar-card ar-summary-banner">
          <div className="ar-summary-head">
            <Sparkles size={20} className="ar-summary-sparkle" />
            <div>
              <h2>30-Second Executive Summary</h2>
              <p>Plain-English breakdown for recruiters, engineering leads & reviewers</p>
            </div>
          </div>

          <div className="ar-summary-bullets">
            <div className="ar-sum-item">
              <Check size={16} className="ar-sum-icon" />
              <div>
                <strong>Project Purpose:</strong> {meta.description ? meta.description : `${meta.name || repoName} is a software project built primarily with ${primaryLang}.`}
              </div>
            </div>
            <div className="ar-sum-item">
              <Check size={16} className="ar-sum-icon" />
              <div>
                <strong>Core Stack:</strong> Built on <span>{primaryLang}</span> and <span>{mainFramework}</span> with {metrics.total_files || 0} files across {metrics.total_dirs || 0} directories ({totalWeightMb} MB).
              </div>
            </div>
            <div className="ar-sum-item">
              <Check size={16} className="ar-sum-icon" />
              <div>
                <strong>Security & Quality Status:</strong> Security Rating is <span style={{ color: security.score >= 80 ? '#16a34a' : '#d97706' }}>{security.score}/100</span>. {codeHealth.hasTests ? 'Automated test suites detected.' : 'No automated test suite detected.'}
              </div>
            </div>
          </div>
        </section>

        {/* HERO CARD */}
        <section className="ar-card ar-hero-card">
          <div className="ar-hero-header">
            {meta.owner?.avatar_url && (
              <img src={meta.owner.avatar_url} alt={meta.owner.login} className="ar-hero-avatar" />
            )}
            <div className="ar-hero-title-area">
              <div className="ar-hero-name-row">
                <h1 className="ar-hero-title">{meta.name || repoName}</h1>
                <span className={`ar-visibility-tag ${meta.private ? 'private' : 'public'}`}>
                  {meta.private ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>
              {meta.description && <p className="ar-hero-desc">{meta.description}</p>}
              {meta.topics && meta.topics.length > 0 && (
                <div className="ar-topics-row">
                  {meta.topics.map((t: string, i: number) => (
                    <span key={i} className="ar-topic-chip">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ar-stat-grid">
            <div className="ar-stat-pill"><Star size={15} /> <strong>{meta.stars?.toLocaleString() || 0}</strong> <small>Stars</small></div>
            <div className="ar-stat-pill"><GitFork size={15} /> <strong>{meta.forks?.toLocaleString() || 0}</strong> <small>Forks</small></div>
            <div className="ar-stat-pill"><Eye size={15} /> <strong>{meta.watchers?.toLocaleString() || 0}</strong> <small>Watchers</small></div>
            <div className="ar-stat-pill"><AlertCircle size={15} /> <strong>{meta.open_issues?.toLocaleString() || 0}</strong> <small>Issues</small></div>
            <div className="ar-stat-pill"><FileCode size={15} /> <strong>{metrics.total_files || 0}</strong> <small>Files</small></div>
            <div className="ar-stat-pill"><HardDrive size={15} /> <strong>{totalWeightMb} MB</strong> <small>Size</small></div>
          </div>

          <div className="ar-meta-chips">
            {meta.license && <span className="ar-meta-chip"><Scale size={13} /> {meta.license}</span>}
            <span className="ar-meta-chip"><GitBranch size={13} /> Default: {meta.default_branch || 'main'}</span>
            <span className="ar-meta-chip"><Calendar size={13} /> Updated: {meta.updated_at ? new Date(meta.updated_at).toLocaleDateString() : 'Recent'}</span>
          </div>
        </section>

        {/* 1. OVERVIEW */}
        <section id="sec-overview" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Eye size={18} /></div>
            <div>
              <h2>Overview & Key Metrics</h2>
              <p>High-level repository statistics, security rating, and codebase scale</p>
            </div>
          </div>

          <div className="ar-grid-3">
            <div className="ar-metric-card">
              <span className="ar-metric-label">SECURITY RATING</span>
              <p className="ar-metric-val" style={{ color: security.score >= 80 ? '#16a34a' : security.score >= 60 ? '#d97706' : '#dc2626' }}>
                {security.score}/100
              </p>
              <p className="ar-metric-sub">{security.score >= 80 ? 'Well secured repository' : 'Audits recommended'}</p>
            </div>
            <div className="ar-metric-card">
              <span className="ar-metric-label">CODEBASE COMPLEXITY</span>
              <p className="ar-metric-val">
                {metrics.total_files > 500 ? 'High' : metrics.total_files > 100 ? 'Moderate' : 'Low'}
              </p>
              <p className="ar-metric-sub">{metrics.total_files || 0} total source files</p>
            </div>
            <div className="ar-metric-card">
              <span className="ar-metric-label">ONBOARDING TIME</span>
              <p className="ar-metric-val">
                {metrics.total_files > 1000 ? '1 - 2 Weeks' : metrics.total_files > 200 ? '3 - 5 Days' : '1 - 2 Days'}
              </p>
              <p className="ar-metric-sub">Based on structural density</p>
            </div>
          </div>

          {/* Overview Charts Row */}
          {langChartData.length > 0 && (
            <div className="ar-charts-row">
              <div className="ar-chart-box">
                <h4><PieIcon size={14} /> Language Distribution</h4>
                <div style={{ width: '100%', height: 210 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={langChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label>
                        {langChartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={getLangColor(entry.name) || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${(Number(value) / 1024).toFixed(1)} KB`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {extChartData.length > 0 && (
                <div className="ar-chart-box">
                  <h4><BarChart2 size={14} /> Top File Extensions</h4>
                  <div style={{ width: '100%', height: 210 }}>
                    <ResponsiveContainer>
                      <BarChart data={extChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="files" fill="#8c6b22" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          <AuditExplainCard
            detected={primaryLang ? `${primaryLang} Primary Stack` : 'Polyglot Repository'}
            explanation={`This project is primarily written in ${primaryLang}. Total weight is ${totalWeightMb} MB across ${metrics.total_dirs || 0} directories.`}
            whyItMatters="The main programming language determines runtime performance, build toolchains, and developer hiring requirements."
            recommendation="Review the tech stack breakdown and dependency graph before introducing new frameworks."
          />
        </section>

        {/* 2. ARCHITECTURE (STUNNING ENHANCED SECTION WITH FLOW PIPELINE & CHARTS) */}
        <section id="sec-architecture" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Layers size={18} /></div>
            <div>
              <h2>System Architecture & Layer Pipeline</h2>
              <p>Discovered software layers, module counts, and structural data flow pipeline</p>
            </div>
          </div>

          {/* Architectural Health Header Badge Row */}
          <div className="ar-arch-summary-row">
            <div className="ar-arch-pattern-badge">
              <Sparkles size={14} />
              <span>Pattern: {architecture.length >= 3 ? 'Decoupled Multi-Tier System' : 'Single-Tier Application'}</span>
            </div>
            <div className="ar-arch-metric-chip">
              <strong>{architecture.length}</strong> Layers Discovered
            </div>
            <div className="ar-arch-metric-chip">
              <strong>{architecture.reduce((acc: number, l: any) => acc + (l.files?.length || 0), 0)}</strong> Core System Modules
            </div>
          </div>

          {/* Data Flow Direction Pipeline */}
          {architecture.length > 0 && (
            <div className="ar-flow-pipeline">
              {architecture.map((layer: any, idx: number) => (
                <React.Fragment key={idx}>
                  <div className="ar-flow-step" style={{ borderColor: layer.type === 'frontend' ? '#2563eb' : layer.type === 'backend' ? '#16a34a' : layer.type === 'database' ? '#7c3aed' : '#8c6b22' }}>
                    <span className="ar-flow-num">0{idx + 1}</span>
                    <span className="ar-flow-title">{layer.label}</span>
                    <small className="ar-flow-count">{layer.files?.length || 1} Modules</small>
                  </div>
                  {idx < architecture.length - 1 && (
                    <div className="ar-flow-arrow"><ArrowRight size={16} /></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Layer Module Distribution Bar Chart */}
          {archChartData.length > 0 && (
            <div className="ar-chart-box" style={{ marginBottom: 20 }}>
              <h4><BarChart2 size={14} /> Source Module Distribution Across Layers</h4>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer>
                  <BarChart data={archChartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11, fill: '#3f3f46' }} />
                    <Tooltip />
                    <Bar dataKey="files" fill="#8c6b22" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Layer Cards Grid */}
          {architecture.length > 0 ? (() => {
            const totalArchFiles = architecture.reduce((acc: number, l: any) => acc + (l.files?.length || 1), 0);
            return (
              <div className="ar-arch-grid">
                {architecture.map((layer: any, idx: number) => {
                  const layerFiles = layer.files?.length || 1;
                  const pct = totalArchFiles > 0 ? Math.round((layerFiles / totalArchFiles) * 100) : 0;
                  const layerColor = layer.type === 'frontend' ? '#2563eb' : layer.type === 'backend' ? '#16a34a' : layer.type === 'database' ? '#7c3aed' : layer.type === 'testing' ? '#dc2626' : '#8c6b22';

                  return (
                    <div key={idx} className="ar-arch-card" style={{ borderLeftColor: layerColor }}>
                      <div className="ar-arch-top">
                        <div className="ar-arch-title-group">
                          <h3>{layer.label}</h3>
                          <p className="ar-arch-desc">{layer.description}</p>
                        </div>
                        <ClockGauge percent={pct} color={layerColor} size={48} />
                      </div>
                      {layer.files && layer.files.length > 0 && (
                        <div className="ar-arch-files">
                          <small>Key Source Files ({layer.files.length}):</small>
                          {layer.files.map((f: string, i: number) => (
                            <div key={i} className="ar-arch-file-item" title={f}>
                              <File size={12} />
                              <span className="ar-arch-file-path">{f}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="ar-empty-box">Standard single-layer software structure.</div>
          )}

          <AuditExplainCard
            detected={`${architecture.length} architectural layers identified`}
            explanation="Layer detection categorizes directory patterns into Frontend UI, Backend API, Data Persistence, Auth, and Infra modules."
            whyItMatters="Decoupled layers prevent changes in display logic from breaking database persistence or business rules."
            recommendation="Keep boundary interfaces explicit between UI components and backend services to enable clean unit testing."
          />
        </section>

        {/* 3. LANGUAGES */}
        <section id="sec-languages" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Code size={18} /></div>
            <div>
              <h2>Language Composition</h2>
              <p>Byte count distribution and programming language percentages</p>
            </div>
          </div>

          {languages.length > 0 ? (
            <>
              <div className="ar-lang-bar">
                {languages.map((l: any, i: number) => (
                  <div
                    key={i}
                    className="ar-lang-seg"
                    style={{ width: `${l.percent}%`, backgroundColor: getLangColor(l.name) }}
                    title={`${l.name}: ${l.percent}%`}
                  />
                ))}
              </div>
              <div className="ar-lang-list">
                {languages.map((l: any, i: number) => (
                  <div key={i} className="ar-lang-item">
                    <span className="ar-lang-dot" style={{ backgroundColor: getLangColor(l.name) }} />
                    <span className="ar-lang-name">{l.name}</span>
                    <span className="ar-lang-pct">{l.percent}%</span>
                    <span className="ar-lang-bytes">{(l.bytes / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="ar-empty-box">No language breakdown available.</div>
          )}
        </section>

        {/* 4. FILE TREE */}
        <section id="sec-tree" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Folder size={18} /></div>
            <div>
              <h2>Directory & File Structure</h2>
              <p>Annotated file tree with touch-friendly folder exploration</p>
            </div>
          </div>

          {report.tree && report.tree.length > 0 ? (
            <div className="ar-tree-box">
              {report.tree.map((node: any, idx: number) => (
                <TreeNode key={idx} node={node} />
              ))}
            </div>
          ) : (
            <div className="ar-empty-box">File tree unavailable.</div>
          )}
        </section>

        {/* 5. DEPENDENCIES */}
        <section id="sec-dependencies" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Code size={18} /></div>
            <div>
              <h2>Package Dependencies</h2>
              <p>Manifest breakdown ({dependencies.type || 'Package Manager'})</p>
            </div>
          </div>

          {/* Smooth Label-Free Dependency Ratio Bar */}
          <div className="ar-dep-summary-box">
            <div className="ar-dep-summary-top">
              <span className="ar-dep-sum-title">Package Distribution Ratio</span>
              <div className="ar-dep-badges">
                <span className="ar-dep-badge prod">Production: <strong>{dependencies.prod?.length || 0}</strong></span>
                <span className="ar-dep-badge dev">Development: <strong>{dependencies.dev?.length || 0}</strong></span>
              </div>
            </div>
            {((dependencies.prod?.length || 0) + (dependencies.dev?.length || 0)) > 0 && (
              <div className="ar-dep-ratio-bar-wrap">
                <div
                  className="ar-dep-ratio-seg prod"
                  style={{ width: `${((dependencies.prod?.length || 0) / ((dependencies.prod?.length || 0) + (dependencies.dev?.length || 0))) * 100}%` }}
                  title={`Production: ${dependencies.prod?.length || 0}`}
                />
                <div
                  className="ar-dep-ratio-seg dev"
                  style={{ width: `${((dependencies.dev?.length || 0) / ((dependencies.prod?.length || 0) + (dependencies.dev?.length || 0))) * 100}%` }}
                  title={`Development: ${dependencies.dev?.length || 0}`}
                />
              </div>
            )}
          </div>

          <div className="ar-dep-cols">
            <div>
              <h3 className="ar-dep-heading">Production ({dependencies.prod?.length || 0})</h3>
              <div className="ar-dep-grid">
                {dependencies.prod && dependencies.prod.length > 0 ? (
                  dependencies.prod.map((d: any, i: number) => (
                    <div key={i} className="ar-dep-pill prod" title={`${d.name} (${d.version})`}>
                      <span className="ar-dep-name">{d.name}</span>
                      <span className="ar-dep-ver">{d.version}</span>
                    </div>
                  ))
                ) : (
                  <p className="ar-empty-text">No production packages.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="ar-dep-heading">Development ({dependencies.dev?.length || 0})</h3>
              <div className="ar-dep-grid">
                {dependencies.dev && dependencies.dev.length > 0 ? (
                  dependencies.dev.map((d: any, i: number) => (
                    <div key={i} className="ar-dep-pill dev" title={`${d.name} (${d.version})`}>
                      <span className="ar-dep-name">{d.name}</span>
                      <span className="ar-dep-ver">{d.version}</span>
                    </div>
                  ))
                ) : (
                  <p className="ar-empty-text">No dev packages.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 6. API ROUTES */}
        <section id="sec-routes" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Globe size={18} /></div>
            <div>
              <h2>Discovered API Routes & Endpoints</h2>
              <p>Automatically extracted HTTP endpoints and page routes</p>
            </div>
          </div>

          {routeChartData.length > 0 && (
            <div className="ar-chart-box" style={{ marginBottom: 20 }}>
              <h4><BarChart2 size={14} /> HTTP Methods Distribution</h4>
              <div style={{ width: '100%', height: 160 }}>
                <ResponsiveContainer>
                  <BarChart data={routeChartData}>
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {routes.length > 0 ? (
            <div className="ar-routes-table">
              {routes.map((r: any, idx: number) => (
                <div key={idx} className="ar-routes-tr">
                  <div className="ar-route-main">
                    <span className={`ar-method-tag ${r.method?.toLowerCase() || 'get'}`}>
                      {r.method || 'GET'}
                    </span>
                    <span className="ar-route-path">{r.path}</span>
                  </div>
                  <div className="ar-route-meta">
                    <span className="ar-route-type">{r.type}</span>
                    <span className="ar-route-file">{r.file}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ar-empty-box">No endpoint routes automatically detected.</div>
          )}
        </section>

        {/* 7. SECURITY AUDIT */}
        <section id="sec-security" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><ShieldCheck size={18} /></div>
            <div>
              <h2>Security & Vulnerability Audit</h2>
              <p>Automated static security analysis & issue detection</p>
            </div>
          </div>

          <div className="ar-security-score-banner">
            <div className="ar-score-circle" style={{ borderColor: security.score >= 80 ? '#16a34a' : security.score >= 60 ? '#d97706' : '#dc2626' }}>
              <span>{security.score}</span>
              <small>/100</small>
            </div>
            <div>
              <h3>Security Health Score</h3>
              <p>{security.score >= 80 ? 'Excellent security hygiene.' : 'Action items detected in security posture.'}</p>
            </div>
          </div>

          {security.signals && security.signals.length > 0 ? (
            <div className="ar-signals-list">
              {security.signals.map((sig: any, idx: number) => (
                <div key={idx} className={`ar-signal-card ${sig.severity}`}>
                  <div className="ar-signal-header">
                    <span className={`ar-sev-badge ${sig.severity}`}>{sig.severity}</span>
                    <span className="ar-signal-title">{sig.title}</span>
                  </div>
                  <p className="ar-signal-exp">{sig.explanation}</p>
                  <p className="ar-signal-rec"><strong>Fix Recommendation:</strong> {sig.recommendation}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="ar-empty-box">No security vulnerabilities detected.</div>
          )}
        </section>

        {/* 8. PERFORMANCE */}
        <section id="sec-performance" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Zap size={18} /></div>
            <div>
              <h2>Performance & Asset Weight</h2>
              <p>File weight distribution and bundle footprint analysis</p>
            </div>
          </div>

          <div className="ar-grid-3">
            <div className="ar-metric-card">
              <span className="ar-metric-label">TOTAL REPO WEIGHT</span>
              <p className="ar-metric-val">{totalWeightMb} MB</p>
            </div>
            <div className="ar-metric-card">
              <span className="ar-metric-label">AVG FILE WEIGHT</span>
              <p className="ar-metric-val">{performance.avgSize || 0} B</p>
            </div>
            <div className="ar-metric-card">
              <span className="ar-metric-label">IMAGE ASSETS</span>
              <p className="ar-metric-val">{performance.imageFiles || 0} Files</p>
            </div>
          </div>

          {performance.largest && performance.largest.length > 0 && (
            <div className="ar-largest-files">
              <h3>Heaviest Source Files (Top 10)</h3>
              {performance.largest.map((f: any, i: number) => (
                <div key={i} className="ar-perf-row">
                  <span className="ar-perf-path">{f.path}</span>
                  <div className="ar-perf-bar-bg">
                    <div
                      className="ar-perf-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(10, (f.size / performance.largest[0].size) * 100))}%` }}
                    />
                  </div>
                  <span className="ar-perf-size">{(f.size / 1024).toFixed(1)} KB</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 9. CODE HEALTH */}
        <section id="sec-health" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Activity size={18} /></div>
            <div>
              <h2>Code Health & Quality Signals</h2>
              <p>Tooling presence, test hygiene, and structural metrics</p>
            </div>
          </div>

          <div className="ar-health-signals">
            <div className={`ar-health-chip ${codeHealth.hasTypeScript ? 'pass' : 'fail'}`}>
              {codeHealth.hasTypeScript ? '✓ TypeScript Configured' : '○ JavaScript (Untyped)'}
            </div>
            <div className={`ar-health-chip ${codeHealth.hasTests ? 'pass' : 'fail'}`}>
              {codeHealth.hasTests ? '✓ Automated Tests Present' : '✗ No Test Suite Found'}
            </div>
            <div className={`ar-health-chip ${codeHealth.hasLinting ? 'pass' : 'fail'}`}>
              {codeHealth.hasLinting ? '✓ Linter Configured' : '○ No Linter Config'}
            </div>
            <div className={`ar-health-chip ${codeHealth.hasDocumentation ? 'pass' : 'fail'}`}>
              {codeHealth.hasDocumentation ? '✓ Documentation Loaded' : '○ No README Found'}
            </div>
          </div>
        </section>

        {/* 10. TECH STACK */}
        <section id="sec-stack" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Cpu size={18} /></div>
            <div>
              <h2>Detected Tech Stack</h2>
              <p>Frameworks, databases, build tools, and dev infrastructure</p>
            </div>
          </div>

          {stack.length > 0 ? (
            <div className="ar-stack-grid">
              {stack.map((s: any, idx: number) => (
                <div key={idx} className="ar-stack-card" style={{ borderColor: `${s.color}40` }}>
                  <div className="ar-stack-icon-wrap" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                    <span>{s.icon}</span>
                  </div>
                  <div>
                    <h3 className="ar-stack-name">{s.name}</h3>
                    <p className="ar-stack-purpose">{s.purpose}</p>
                    {s.configFile && <small className="ar-stack-config">Config: {s.configFile}</small>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ar-empty-box">No specific technology stack rules matched.</div>
          )}
        </section>

        {/* 11. CONTRIBUTORS */}
        <section id="sec-contributors" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Users size={18} /></div>
            <div>
              <h2>Top Project Contributors</h2>
              <p>Leading contributors by committed code frequency</p>
            </div>
          </div>

          {contributors.length > 0 ? (
            <div className="ar-contrib-grid">
              {contributors.map((c: any, idx: number) => (
                <a key={idx} href={c.html_url} target="_blank" rel="noreferrer" className="ar-contrib-card">
                  <span className="ar-contrib-rank">#{idx + 1}</span>
                  <img src={c.avatar_url} alt={c.login} className="ar-contrib-avatar" />
                  <span className="ar-contrib-login">{c.login}</span>
                  <span className="ar-contrib-commits">{c.contributions} commits</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="ar-empty-box">No contributor records returned.</div>
          )}
        </section>

        {/* 12. README */}
        <section id="sec-readme" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><BookOpen size={18} /></div>
            <div>
              <h2>Repository Documentation (README)</h2>
              <p>Project overview, getting started guide, and usage instructions</p>
            </div>
          </div>

          {report.readme ? (
            <div
              className="ar-md-body"
              dangerouslySetInnerHTML={{ __html: processReadmeHtml(report.readme) }}
            />
          ) : (
            <div className="ar-empty-box">No README file detected in repository root.</div>
          )}
        </section>

        {/* 13. TIMELINE */}
        <section id="sec-timeline" className="ar-card">
          <div className="ar-section-head">
            <div className="ar-head-icon"><Clock size={18} /></div>
            <div>
              <h2>Repository Lifecycle & Timeline</h2>
              <p>Historical milestones and repository commit frequency</p>
            </div>
          </div>

          <div className="ar-timeline-list">
            <div className="ar-tl-item">
              <div className="ar-tl-dot created" />
              <div className="ar-tl-content">
                <span className="ar-tl-date">{meta.created_at ? new Date(meta.created_at).toLocaleDateString() : 'Initial'}</span>
                <h4>Repository Created</h4>
                <p>{meta.owner?.login || 'Maintainer'} initialized {meta.name || repoName}</p>
              </div>
            </div>
            <div className="ar-tl-item">
              <div className="ar-tl-dot update" />
              <div className="ar-tl-content">
                <span className="ar-tl-date">{meta.pushed_at ? new Date(meta.pushed_at).toLocaleDateString() : 'Recent'}</span>
                <h4>Latest Push Activity</h4>
                <p>Recent commits pushed to branch {meta.default_branch || 'main'}</p>
              </div>
            </div>
            {contributors.length > 0 && (
              <div className="ar-tl-item">
                <div className="ar-tl-dot contrib" />
                <div className="ar-tl-content">
                  <span className="ar-tl-date">{contributors.length} Team Members</span>
                  <h4>Active Contributors</h4>
                  <p>Top author: {contributors[0]?.login} ({contributors[0]?.contributions} commits)</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
