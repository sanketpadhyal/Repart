import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader.tsx';

export default function Timeline({ report }: { report: any }) {
  const meta = report?.meta || {};
  const contributors = report?.contributors || [];
  
  const events = [];

  if (meta.created_at) {
    events.push({
      date: meta.created_at,
      title: 'Repository Created',
      description: `${meta.owner?.login || 'User'} created ${meta.name || 'repository'}`,
      type: 'created',
      color: '#3b82f6'
    });
  }

  if (contributors.length > 0 && meta.created_at) {
    const names = contributors.slice(0, 3).map((c: any) => c.login).join(', ');
    const more = contributors.length > 3 ? ' and more' : '';
    events.push({
      date: meta.created_at, 
      title: `${contributors.length} Contributors`,
      description: `${names}${more}`,
      type: 'contributors',
      color: '#a855f7'
    });
  }

  if (meta.stars > 100 && meta.updated_at) {
    events.push({
      date: meta.updated_at,
      title: `${meta.stars.toLocaleString()} Stars`,
      description: 'Strong community adoption',
      type: 'milestone',
      color: '#eab308'
    });
  }

  if (meta.pushed_at) {
    events.push({
      date: meta.pushed_at,
      title: 'Latest Commit',
      description: 'Most recent push to the repository',
      type: 'commit',
      color: '#22c55e'
    });
  }

  if (meta.updated_at) {
    events.push({
      date: meta.updated_at,
      title: 'Last Updated',
      description: 'Repository metadata last changed',
      type: 'update',
      color: '#9ca3af'
    });
  }

  // Sort by date descending
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Deduplicate dates if needed, or just show them nicely formatted
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div>
      <SectionHeader 
        icon={Clock} 
        title="Timeline" 
        description="Repository history and milestones" 
      />

      <div className="rp-card">
        <div className="rp-timeline">
          {events.map((event, i) => (
            <motion.div
              key={i}
              className="rp-timeline-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <div 
                className="rp-timeline-dot" 
                style={{ backgroundColor: event.color }}
              />
              <div>
                <div className="rp-timeline-date">{formatDate(event.date)}</div>
                <div className="rp-timeline-title">{event.title}</div>
                <div className="rp-timeline-desc">{event.description}</div>
              </div>
            </motion.div>
          ))}
          {events.length === 0 && (
            <div style={{ color: '#6b7280', fontSize: 13 }}>No timeline events found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
