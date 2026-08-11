import React from 'react';
import { motion } from 'framer-motion';
import { Search, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface ExplainCardProps {
  detected: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
  delay?: number;
}

const ExplainCard: React.FC<ExplainCardProps> = ({ detected, explanation, whyItMatters, recommendation, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay }}
    className="rp-explain-card"
  >
    <div className="rp-explain-row">
      <div className="rp-explain-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Search size={13} /></div>
      <div>
        <p className="rp-explain-label">Detected</p>
        <p className="rp-explain-value">{detected}</p>
      </div>
    </div>
    <div className="rp-explain-row">
      <div className="rp-explain-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle size={13} /></div>
      <div>
        <p className="rp-explain-label">What this means</p>
        <p className="rp-explain-text">{explanation}</p>
      </div>
    </div>
    <div className="rp-explain-row">
      <div className="rp-explain-icon" style={{ background: '#fefce8', color: '#ca8a04' }}><AlertCircle size={13} /></div>
      <div>
        <p className="rp-explain-label">Why it matters</p>
        <p className="rp-explain-text">{whyItMatters}</p>
      </div>
    </div>
    <div className="rp-explain-row">
      <div className="rp-explain-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}><Lightbulb size={13} /></div>
      <div>
        <p className="rp-explain-label">Recommendation</p>
        <p className="rp-explain-text">{recommendation}</p>
      </div>
    </div>
  </motion.div>
);

export { ExplainCard };
export default ExplainCard;
