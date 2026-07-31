import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import SectionHeader from '../shared/SectionHeader.tsx';
import ExplainCard from '../shared/ExplainCard.tsx';
import StatCard from '../shared/StatCard.tsx';

export default function Performance({ report }: { report: any }) {
  const perf = report?.performance || {};
  const largest = perf.largest || [];
  
  const totalSize = perf.totalSize || 0;
  const formattedSize = totalSize > 1024 * 1024 ? `${(totalSize / 1024 / 1024).toFixed(1)} MB` : `${(totalSize / 1024).toFixed(0)} KB`;
  
  const topLargest = largest.slice(0, 10);
  const chartData = largest.slice(0, 8).map((f: any) => ({
    name: f.path?.split('/').pop() || f.path || '—',
    sizeKB: Math.round(f.size / 1024) || 0
  }));
  
  const maxFile = largest[0]?.size || 1;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rp-section">
      <SectionHeader icon={Zap} title="Performance" description="File sizes, bundle signals, and optimization opportunities" />
      
      <div className="rp-grid-4">
        <StatCard label="Total Size" value={formattedSize} explanation="Total uncompressed repository size" />
        <StatCard label="Largest File" value={largest[0]?.path?.split('/').pop() || '—'} explanation="The single heaviest file in the codebase" />
        <StatCard label="Avg File Size" value={`${perf.avgSize || 0} bytes`} explanation="Average file weight" />
        <StatCard label="Image Assets" value={`${perf.imageFiles || 0} files`} explanation="Unoptimized images can significantly impact load time" />
      </div>

      <div className="rp-card">
        <h3>Top Largest Files</h3>
        {chartData.length > 0 && (
          <div className="rp-chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sizeKB" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rp-table-container">
          <table className="rp-table">
            <tbody>
              {topLargest.map((file: any, i: number) => (
                <tr key={i}>
                  <td className="rp-mono">{file.path?.split('/').slice(-2).join('/') || file.path}</td>
                  <td className="rp-text-right">{((file.size || 0) / 1024).toFixed(1)} KB</td>
                  <td><span className="rp-badge">{file.ext}</span></td>
                  <td style={{ width: '40%' }}>
                    <div className="rp-bar-bg">
                      <div className="rp-bar-fill" style={{ width: `${((file.size || 0) / maxFile) * 100}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`rp-card ${perf.hasLazyRoutes ? 'rp-success-card' : 'rp-warning-card'}`}>
        {perf.hasLazyRoutes 
          ? '✓ Lazy loading detected — dynamic imports improve initial load time'
          : '⚠ No lazy loading detected — consider dynamic imports for large route components'
        }
      </div>

      <ExplainCard 
        detected={`${perf.fileCount || 0} files, ${formattedSize} total`}
        explanation="Performance analysis examines file sizes, image assets, and code splitting patterns."
        whyItMatters="Large files increase build time. Unoptimized images increase page weight. Missing lazy loading hurts initial load time."
        recommendation="Aim for average file size under 10KB. Optimize images with WebP format. Use dynamic imports for routes."
      />
    </motion.div>
  );
}
