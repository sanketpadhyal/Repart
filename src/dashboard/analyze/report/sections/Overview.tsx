import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Star, GitFork, Eye, AlertCircle, FileCode, Scale, HardDrive, GitBranch, Lock, Calendar, User } from 'lucide-react';
import { StatCard } from '../shared/StatCard.tsx';
import { ExplainCard } from '../shared/ExplainCard.tsx';
import { SectionHeader } from '../shared/SectionHeader.tsx';
import { InsightBox } from '../shared/InsightBox.tsx';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Overview = ({ report }: { report: any }) => {
  const meta = report?.meta || {};
  const metrics = report?.metrics || {};
  const languages = report?.languages || [];
  const primaryLang = languages[0]?.name || 'Unknown';
  
  const sizeText = metrics.total_size_kb > 1024 
    ? `${(metrics.total_size_kb / 1024).toFixed(1)} MB` 
    : `${metrics.total_size_kb || 0} KB`;

  const pieData = languages.map((lang: any) => ({
    name: lang.name,
    value: lang.value
  }));

  const langExplanation = primaryLang === 'TypeScript' 
    ? 'TypeScript adds static typing which reduces runtime errors.' 
    : primaryLang === 'Python' 
      ? 'Python is commonly used for backend services, ML, and scripting.' 
      : 'This language drives the core application logic.';

  return (
    <motion.div 
      className="rp-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <SectionHeader 
        icon={Eye} 
        title="Overview & Key Metrics" 
        description="High-level repository statistics, security rating, and codebase scale" 
      />

      {report?.security?.criticalLeaks && report.security.criticalLeaks.length > 0 && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1.5px solid #fca5a5',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 800, fontSize: '15px' }}>
            <AlertCircle size={20} />
            <span>CRITICAL SECURITY LEAK DETECTED</span>
          </div>
          {report.security.criticalLeaks.map((leak: any, idx: number) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>
              <strong style={{ color: '#dc2626' }}>{leak.leakType}:</strong> <code style={{ background: '#fee2e2', padding: '2px 6px', borderRadius: '4px', color: '#991b1b' }}>{leak.file}</code>
              <p style={{ margin: '4px 0 0 0', color: '#7f1d1d', fontSize: '12px' }}>{leak.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      <div className="rp-grid-4">
        <StatCard title="Repository identifier" value={meta.name || 'Unknown'} icon={FileCode} />
        <StatCard title="Project maintainer" value={meta.owner?.login || 'Unknown'} icon={User} />
        <StatCard title="Community interest signal" value={meta.stars || 0} icon={Star} />
        <StatCard title="Derivative projects" value={meta.forks || 0} icon={GitFork} />
        <StatCard title="Active work items" value={meta.open_issues || 0} icon={AlertCircle} />
        <StatCard title="Dominant programming language" value={primaryLang} icon={FileCode} />
        <StatCard title="Usage rights" value={meta.license || 'Not specified'} icon={Scale} />
        <StatCard title="Repository footprint" value={sizeText} icon={HardDrive} />
        <StatCard title="Codebase size signal" value={metrics.total_files || 0} icon={FileCode} />
        <StatCard title="Primary development branch" value={meta.default_branch || 'main'} icon={GitBranch} />
        <StatCard title="Repository access level" value={meta.visibility || 'Unknown'} icon={Lock} />
        <StatCard title="Recent activity indicator" value={meta.updated_at ? new Date(meta.updated_at).toLocaleDateString() : 'Unknown'} icon={Calendar} />
      </div>

      <div className="rp-grid-2">
        <div className="rp-card" style={{ height: '300px' }}>
          <h3 className="rp-card-title">Language Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ExplainCard
          detected={primaryLang}
          explanation={`This repository is primarily written in ${primaryLang}. ${langExplanation}`}
          whyItMatters="The primary language determines the toolchain, hiring requirements, and runtime behavior."
          recommendation="Ensure all contributors are familiar with this language and its ecosystem conventions."
        />
      </div>

      <InsightBox>
        {`${metrics.total_files || 0} files across ${metrics.total_dirs || 0} directories. ${report?.codeHealth?.hasTests ? 'Test files detected — good coverage hygiene.' : 'No test files detected — consider adding a testing framework.'}`}
      </InsightBox>
    </motion.div>
  );
};

export default Overview;
