import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, description, badge }) => (
  <div className="rp-section-header">
    <div className="rp-section-icon"><Icon size={18} /></div>
    <div className="rp-section-header-text">
      <div className="rp-section-title-row">
        <h2 className="rp-section-title">{title}</h2>
        {badge && <span className="rp-section-badge">{badge}</span>}
      </div>
      <p className="rp-section-description">{description}</p>
    </div>
  </div>
);

export { SectionHeader };
export default SectionHeader;
