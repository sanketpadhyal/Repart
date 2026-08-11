import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle } from 'lucide-react';

interface ScanTerminalProps {
  repoUrl: string;
  steps: Record<number, { status: 'pending' | 'running' | 'done'; label: string }>;
  progress: number;
  repoName: string;
}

export default function ScanTerminal({ repoUrl, steps, progress, repoName }: ScanTerminalProps) {
  return (
    <div className="rp-scan-page">
      <div className="rp-scan-card">
        <div className="rp-scan-header">
          <div className="rp-scan-pulse"></div>
          <div>
            <h2 className="rp-scan-title">Analyzing Repository</h2>
            <p className="rp-scan-repo">{repoName || repoUrl}</p>
          </div>
        </div>
        
        <div className="rp-scan-steps">
          <AnimatePresence>
            {Object.entries(steps).map(([idx, step]) => (
              <motion.div 
                key={idx}
                className={`rp-scan-step ${step.status}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rp-scan-step-icon">
                  {step.status === 'done' && <Check size={16} color="#15803d" />}
                  {step.status === 'running' && <div className="rp-scan-step-spinner" />}
                  {step.status === 'pending' && <Circle size={14} color="#d1d5db" />}
                </div>
                <div className="rp-scan-step-label">{step.label}</div>
                <div className={`rp-scan-step-status ${step.status}`}>
                  {step.status === 'done' ? 'Done' : step.status === 'running' ? 'Running' : 'Waiting'}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div>
          <div className="rp-progress-wrap">
            <div 
              className="rp-progress-bar" 
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            ></div>
          </div>
          <div className="rp-progress-label">
            {Math.round(progress)}% Complete
          </div>
        </div>
      </div>
    </div>
  );
}
