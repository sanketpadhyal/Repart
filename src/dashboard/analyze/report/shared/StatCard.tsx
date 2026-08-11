import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  explanation: string;
  accent?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, explanation, accent = '#2563eb', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay }}
    className="rp-stat-card"
  >
    <div className="rp-stat-icon" style={{ background: accent + '14', color: accent }}>
      <Icon size={16} />
    </div>
    <div className="rp-stat-content">
      <p className="rp-stat-title">{title}</p>
      <p className="rp-stat-value">{value || '—'}</p>
      <p className="rp-stat-explanation">{explanation}</p>
    </div>
  </motion.div>
);

export { StatCard };
export default StatCard;
