import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertOctagon, AlertTriangle, Info } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader.tsx';
import ExplainCard from '../shared/ExplainCard.tsx';

export default function Security({ report }: { report: any }) {
  const security = report?.security || { score: 100, signals: [] };
  const score = security.score ?? 100;
  const signals = security.signals || [];

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'rp-text-green';
    if (s >= 60) return 'rp-text-yellow';
    return 'rp-text-red';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Well secured';
    if (s >= 60) return 'Needs attention';
    return 'Critical issues detected';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <AlertOctagon className="rp-icon-red" />;
      case 'warning': return <AlertTriangle className="rp-icon-yellow" />;
      default: return <Info className="rp-icon-blue" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rp-section">
      <SectionHeader icon={Shield} title="Security Audit" description="Automated security signal detection and recommendations" />
      
      <div className="rp-security-score rp-card">
        <h2 className={`rp-score-large ${getScoreColor(score)}`}>{score}<span className="rp-score-max">/100</span></h2>
        <p className="rp-bold">Security Score</p>
        <p className="rp-text-muted">{getScoreLabel(score)}</p>
      </div>

      {security.criticalLeaks && security.criticalLeaks.length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ color: '#dc2626', fontSize: '14px', fontWeight: 800, margin: '0 0 4px 0' }}>🚨 CRITICAL FILE LEAKS IDENTIFIED</h3>
          {security.criticalLeaks.map((leak: any, i: number) => (
            <div key={i} style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', padding: '14px 18px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertOctagon style={{ color: '#dc2626' }} size={18} />
                <strong style={{ color: '#991b1b', fontSize: '14px' }}>{leak.leakType}</strong>
                <span className="rp-badge rp-severity-critical" style={{ marginLeft: 'auto' }}>CRITICAL</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d' }}>
                File leaking secret credentials: <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', color: '#991b1b' }}>{leak.file}</code>
              </p>
              <div className="rp-recommendation-box" style={{ marginTop: '8px', background: '#ffffff', borderColor: '#fca5a5' }}>
                {leak.recommendation}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rp-signals-list">
        {signals.length > 0 ? (
          signals.map((signal: any, i: number) => (
            <div key={i} className="rp-signal-card">
              <div className="rp-signal-header">
                {getSeverityIcon(signal.severity)}
                <span className={`rp-badge rp-severity-${signal.severity?.toLowerCase()}`}>{signal.severity}</span>
                <span className="rp-bold">{signal.title}</span>
              </div>
              <p>{signal.explanation}</p>
              <div className="rp-recommendation-box">{signal.recommendation}</div>
            </div>
          ))
        ) : (
          <div className="rp-card rp-success-card">No security issues detected. The repository follows good security practices.</div>
        )}
      </div>

      <ExplainCard 
        detected={`Security score: ${score}/100`}
        explanation="This score is calculated by checking for common security signals: exposed .env files, missing security middleware, no rate limiting, CORS configuration, and authentication patterns."
        whyItMatters="Security issues in open repositories can expose credentials, allow unauthorized access, or enable injection attacks."
        recommendation="Address critical issues first, then warnings. Info items are best practices worth following."
      />
    </motion.div>
  );
}
