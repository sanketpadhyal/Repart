import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface InsightBoxProps {
  insight: string;
}

const InsightBox: React.FC<InsightBoxProps> = ({ insight }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    className="rp-insight-box"
  >
    <Info size={14} className="rp-insight-icon" />
    <p className="rp-insight-text">{insight}</p>
  </motion.div>
);

export { InsightBox };
export default InsightBox;
