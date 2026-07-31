import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SectionHeader } from '../shared/SectionHeader.tsx';
import { ExplainCard } from '../shared/ExplainCard.tsx';

export const Dependencies = ({ report }: { report: any }) => {
  const prodDeps = report?.dependencies?.prod || [];
  const devDeps = report?.dependencies?.dev || [];
  const manifestType = report?.dependencies?.type || 'unknown manifest';

  const chartData = [
    { name: 'Production', count: prodDeps.length, fill: '#16a34a' },
    { name: 'Development', count: devDeps.length, fill: '#6b7280' }
  ];

  return (
    <motion.div 
      className="rp-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <SectionHeader 
        icon={Package} 
        title="Dependencies" 
        description="External packages this project depends on" 
      />

      <div className="rp-grid-2">
        <div className="rp-card">
          <h3 className="rp-card-title">Dependency Breakdown</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <ExplainCard
          detected={`${prodDeps.length} production, ${devDeps.length} dev dependencies via ${manifestType}`}
          explanation="Production dependencies are shipped to end users. Dev dependencies are only used during development and build."
          whyItMatters="Large production dependency trees increase bundle size, attack surface, and maintenance burden."
          recommendation={prodDeps.length > 50 ? 'Consider auditing dependencies — 50+ production packages may include unused or redundant libraries.' : 'Dependency count looks manageable. Run npm audit regularly to check for vulnerabilities.'}
        />
      </div>

      <div className="rp-grid-2" style={{ marginTop: '24px' }}>
        <div className="rp-card">
          <h3 className="rp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
            Production Dependencies ({prodDeps.length})
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {prodDeps.length === 0 ? (
              <p className="rp-text-sm" style={{ color: '#6b7280' }}>No dependency manifest detected (package.json, requirements.txt, go.mod, pubspec.yaml)</p>
            ) : (
              prodDeps.map((dep: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderLeft: '4px solid #16a34a', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{typeof dep === 'string' ? dep : dep.name}</span>
                  <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{typeof dep === 'string' ? '*' : dep.version}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rp-card">
          <h3 className="rp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6b7280' }}></span>
            Development Dependencies ({devDeps.length})
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {devDeps.length === 0 ? (
              <p className="rp-text-sm" style={{ color: '#6b7280' }}>No dev dependencies found</p>
            ) : (
              devDeps.map((dep: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', border: '1px solid #e5e7eb', borderLeft: '4px solid #6b7280', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{typeof dep === 'string' ? dep : dep.name}</span>
                  <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{typeof dep === 'string' ? '*' : dep.version}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dependencies;
