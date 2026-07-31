import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ExternalLink, Star, GitFork, LayoutDashboard, Network, 
  FolderTree, Package, Globe, Shield, Zap, Activity, Cpu, Clock 
} from 'lucide-react';
import './report.css';

// Lazy load or import sections directly - assuming they exist
// Replace these with actual imports if files are already generated
import Overview from './sections/Overview.tsx';
import Architecture from './sections/Architecture.tsx';
import FolderStructure from './sections/FolderStructure.tsx';
import Dependencies from './sections/Dependencies.tsx';
import ApiExplorer from './sections/ApiExplorer.tsx';
import Security from './sections/Security.tsx';
import Performance from './sections/Performance.tsx';
import CodeHealth from './sections/CodeHealth.tsx';
import Technologies from './sections/Technologies.tsx';
import Timeline from './sections/Timeline.tsx';

interface ReportShellProps {
  report: any;
  repoName: string;
  onBack: () => void;
}

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'architecture', label: 'Architecture', icon: Network },
  { id: 'folders', label: 'Folder Structure', icon: FolderTree },
  { id: 'dependencies', label: 'Dependencies', icon: Package },
  { id: 'api', label: 'API Explorer', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'health', label: 'Code Health', icon: Activity },
  { id: 'technologies', label: 'Technologies', icon: Cpu },
  { id: 'timeline', label: 'Timeline', icon: Clock },
];

export default function ReportShell({ report, repoName, onBack }: ReportShellProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const meta = report?.meta || {};

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <Overview report={report} />;
      case 'architecture': return <Architecture report={report} />;
      case 'folders': return <FolderStructure report={report} />;
      case 'dependencies': return <Dependencies report={report} />;
      case 'api': return <ApiExplorer report={report} />;
      case 'security': return <Security report={report} />;
      case 'performance': return <Performance report={report} />;
      case 'health': return <CodeHealth report={report} />;
      case 'technologies': return <Technologies report={report} />;
      case 'timeline': return <Timeline report={report} />;
      default: return <Overview report={report} />;
    }
  };

  const handleOpenGitHub = () => {
    if (meta.html_url) {
      window.open(meta.html_url, '_blank');
    }
  };

  return (
    <div className="rp-shell">
      {/* Topbar */}
      <div className="rp-topbar">
        <button onClick={onBack} className="rp-topbar-back">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="rp-topbar-title">{repoName}</div>
        
        {meta.html_url && (
          <button 
            onClick={handleOpenGitHub} 
            className="rp-topbar-back" 
            style={{ padding: '4px 8px', border: 'none' }}
            title="Open in GitHub"
          >
            <ExternalLink size={16} />
          </button>
        )}

        <div className="rp-topbar-badges">
          {meta.stars !== undefined && (
            <div className="rp-badge">
              <Star size={12} /> {meta.stars.toLocaleString()}
            </div>
          )}
          {meta.forks !== undefined && (
            <div className="rp-badge">
              <GitFork size={12} /> {meta.forks.toLocaleString()}
            </div>
          )}
          {meta.visibility && (
            <div className="rp-badge" style={{ textTransform: 'capitalize' }}>
              {meta.visibility}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="rp-mobile-tabs" data-lenis-prevent>
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`rp-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap', width: 'auto', borderRadius: 0 }}
            >
              <Icon size={16} /> {item.label}
            </button>
          )
        })}
      </div>

      <div className="rp-shell-body">
        {/* Sidebar */}
        <div className="rp-sidebar" data-lenis-prevent>
          <div className="rp-sidebar-section-label">Report Sections</div>
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`rp-sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} /> {item.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="rp-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
