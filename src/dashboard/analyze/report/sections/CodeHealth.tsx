import React from 'react';
import { motion } from 'framer-motion';
import { Activity, File, Folder, FileCode, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../shared/SectionHeader.tsx';
import ExplainCard from '../shared/ExplainCard.tsx';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export default function CodeHealth({ report }: { report: any }) {
  const health = report?.codeHealth || {};
  const breakdown = report?.ext_breakdown || [];
  
  const hasTs = !!health.hasTypeScript;
  const hasTests = !!health.hasTests;
  const hasLinting = !!health.hasLinting;
  const hasDoc = !!health.hasDocumentation;

  const topExt = breakdown.slice(0, 8);
  const totalExt = breakdown.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0) || 1;

  const getStatus = (active: boolean, labelYes: string, labelNo: string) => {
    return active 
      ? <div className="rp-health-badge rp-health-good"><CheckCircle size={16}/> {labelYes}</div>
      : <div className="rp-health-badge rp-health-neutral"><XCircle size={16}/> {labelNo}</div>;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rp-section">
      <SectionHeader icon={Activity} title="Code Health" description="Structural quality signals and maintainability indicators" />
      
      <div className="rp-health-signals">
        {getStatus(hasTs, 'TypeScript', 'TypeScript')}
        {hasTests 
          ? <div className="rp-health-badge rp-health-good"><CheckCircle size={16}/> Tests</div>
          : <div className="rp-health-badge rp-health-bad"><XCircle size={16}/> Tests</div>
        }
        {getStatus(hasLinting, 'Linting', 'Linting')}
        {getStatus(hasDoc, 'README', 'README')}
        {getStatus(hasTs, 'Type-safe', 'Untyped')}
      </div>

      <div className="rp-grid-3">
        <div className="rp-stat-mini"><File size={16}/> Total Files: {health.totalFiles || 0}</div>
        <div className="rp-stat-mini"><Folder size={16}/> Total Dirs: {health.totalDirs || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> Components: {health.components || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> Hooks: {health.hooks || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> Test Files: {health.tests || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> Config Files: {health.configFiles || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> TS Files: {health.tsFiles || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> JS Files: {health.jsFiles || 0}</div>
        <div className="rp-stat-mini"><FileCode size={16}/> CSS Files: {health.cssFiles || 0}</div>
      </div>

      <div className="rp-card rp-grid-2">
        <div className="rp-chart-container" style={{ height: 250 }}>
          {breakdown.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topExt} dataKey="count" nameKey="ext" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
                  {topExt.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="rp-ext-table">
          <table className="rp-table">
            <tbody>
              {topExt.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="rp-mono">{item.ext}</td>
                  <td>{item.count}</td>
                  <td>{Math.round((item.count / totalExt) * 100)}%</td>
                  <td style={{ width: '40%' }}>
                    <div className="rp-bar-bg">
                      <div className="rp-bar-fill" style={{ width: `${(item.count / totalExt) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExplainCard 
        detected={`${health.totalFiles || 0} files — ${hasTs ? 'TypeScript' : 'JavaScript'} project`}
        explanation="Code health measures the structural quality of the codebase — test coverage signals, linting configuration, type safety, and documentation."
        whyItMatters="Healthy codebases are easier to maintain, onboard contributors to, and extend safely."
        recommendation={`${!hasTests ? 'Add a testing framework (Jest, Vitest). ' : ''}${!hasLinting ? 'Add ESLint + Prettier for consistent code style. ' : ''}${!hasTs ? 'Consider migrating to TypeScript for better IDE support and fewer runtime errors.' : 'TypeScript is configured — maintain strict mode for maximum benefit.'}`}
      />
    </motion.div>
  );
}
