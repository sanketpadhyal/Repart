import React from 'react';
import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader.tsx';
import ExplainCard from '../shared/ExplainCard.tsx';

interface TechItem {
  name: string;
  icon?: string;
  color?: string;
  purpose: string;
  configFile?: string;
}

const GROUPS = [
  { id: 'frontend', label: 'Frontend', matches: ['Next.js', 'React', 'Vite', 'Tailwind', 'Vue', 'Svelte', 'TailwindCSS'] },
  { id: 'backend', label: 'Backend', matches: ['Node.js', 'Express', 'Python', 'Go', 'Rust', 'Java', 'Django', 'Flask'] },
  { id: 'database', label: 'Database', matches: ['PostgreSQL', 'MongoDB', 'Prisma', 'Drizzle', 'Redis', 'Supabase', 'Firebase'] },
  { id: 'devops', label: 'DevOps', matches: ['Docker', 'GitHub Actions', 'Vercel', 'Netlify'] },
  { id: 'quality', label: 'Quality', matches: ['Testing', 'ESLint', 'TypeScript', 'Jest', 'Mocha'] },
];

export default function Technologies({ report }: { report: any }) {
  const stack: TechItem[] = report?.stack || [];

  const groupedStack: Record<string, TechItem[]> = {
    frontend: [],
    backend: [],
    database: [],
    devops: [],
    quality: [],
    other: []
  };

  stack.forEach(tech => {
    let matched = false;
    for (const group of GROUPS) {
      if (group.matches.some(m => tech.name.toLowerCase().includes(m.toLowerCase()))) {
        groupedStack[group.id].push(tech);
        matched = true;
        break;
      }
    }
    if (!matched) groupedStack.other.push(tech);
  });

  const activeGroups = GROUPS.filter(g => groupedStack[g.id].length > 0)
    .concat(groupedStack.other.length > 0 ? [{ id: 'other', label: 'Other', matches: [] }] : []);

  return (
    <div>
      <SectionHeader 
        icon={Cpu} 
        title="Technologies" 
        description="Detected frameworks, libraries, and tooling" 
      />

      <div style={{ marginBottom: 24 }}>
        <ExplainCard
          detected={stack.length > 0 ? stack.map(t => t.name).join(', ') : 'Unknown'}
          explanation="Technologies are detected by scanning configuration files and directory structure. No code is executed."
          whyItMatters="Knowing the tech stack upfront tells you what knowledge is required to contribute and what the operational requirements are."
          recommendation="Ensure all technologies have documented setup instructions in the README."
        />
      </div>

      {stack.length === 0 ? (
        <div className="rp-card" style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
          Technology stack could not be automatically detected.
        </div>
      ) : (
        activeGroups.map(group => (
          <div key={group.id} style={{ marginBottom: 24 }}>
            <div className="rp-group-header">{group.label}</div>
            <div className="rp-grid-4">
              {groupedStack[group.id].map((tech, i) => (
                <motion.div
                  key={tech.name}
                  className="rp-tech-card"
                  style={{ 
                    borderColor: tech.color ? `${tech.color}30` : '#e5e7eb',
                    backgroundColor: tech.color ? `${tech.color}05` : '#fff'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <div className="rp-tech-icon" style={{ color: tech.color || '#374151' }}>
                    {tech.icon || '📦'}
                  </div>
                  <div>
                    <div className="rp-tech-name">{tech.name}</div>
                    <div className="rp-tech-purpose">{tech.purpose}</div>
                  </div>
                  {tech.configFile && (
                    <div className="rp-tech-config">{tech.configFile}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
