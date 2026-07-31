import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderTree, ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader.tsx';
import { InsightBox } from '../shared/InsightBox.tsx';

const FOLDER_EXPLANATIONS: Record<string, { purpose: string; color: string }> = {
  'app': { purpose: 'Application routes and layouts (Next.js App Router)', color: '#2563eb' },
  'pages': { purpose: 'Page-level route components', color: '#2563eb' },
  'components': { purpose: 'Reusable UI components shared across pages', color: '#16a34a' },
  'src': { purpose: 'Main source code directory', color: '#7c3aed' },
  'api': { purpose: 'Backend API routes and handlers', color: '#d97706' },
  'routes': { purpose: 'Application route definitions', color: '#d97706' },
  'controllers': { purpose: 'Request handlers and business logic orchestration', color: '#d97706' },
  'services': { purpose: 'Reusable business logic and data access', color: '#059669' },
  'lib': { purpose: 'Shared utility functions and helpers', color: '#6b7280' },
  'utils': { purpose: 'Utility functions', color: '#6b7280' },
  'hooks': { purpose: 'Custom React hooks', color: '#7c3aed' },
  'store': { purpose: 'Global state management', color: '#7c3aed' },
  'context': { purpose: 'React context providers', color: '#7c3aed' },
  'types': { purpose: 'TypeScript type definitions', color: '#3178c6' },
  'styles': { purpose: 'Global stylesheets and design tokens', color: '#c026d3' },
  'public': { purpose: 'Static assets served directly', color: '#6b7280' },
  'assets': { purpose: 'Images, fonts, and static resources', color: '#6b7280' },
  'tests': { purpose: 'Automated test suites', color: '#dc2626' },
  '__tests__': { purpose: 'Jest test suites', color: '#dc2626' },
  'prisma': { purpose: 'Database schema and migrations (Prisma ORM)', color: '#5a67d8' },
  'migrations': { purpose: 'Database migration history', color: '#5a67d8' },
  'middleware': { purpose: 'Request/response middleware chain', color: '#d97706' },
  'auth': { purpose: 'Authentication and authorization logic', color: '#d97706' },
  'config': { purpose: 'Application configuration files', color: '#6b7280' },
  '.github': { purpose: 'GitHub Actions workflows and templates', color: '#2088ff' },
  'docker': { purpose: 'Docker configuration and compose files', color: '#2496ed' },
};

const TreeNode = ({ node, level = 0 }: { node: any; level?: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDir = node.type === 'directory';
  const folderInfo = FOLDER_EXPLANATIONS[node.name] || { purpose: 'Project module', color: '#9ca3af' };

  if (level > 1 && !isOpen && isDir) {
    return (
      <div style={{ paddingLeft: `${level * 20}px`, padding: '4px 0', display: 'flex', alignItems: 'center' }}>
        <Folder size={16} color={folderInfo.color} style={{ marginRight: '8px' }} />
        <span>{node.name}</span>
      </div>
    );
  }

  return (
    <div>
      <div 
        style={{ 
          paddingLeft: `${level * 20}px`, 
          padding: '8px 0',
          display: 'flex', 
          alignItems: 'center',
          cursor: isDir ? 'pointer' : 'default',
          borderBottom: level === 0 ? '1px solid #f3f4f6' : 'none'
        }}
        onClick={() => isDir && setIsOpen(!isOpen)}
      >
        <span style={{ width: '20px', display: 'flex', alignItems: 'center' }}>
          {isDir && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </span>
        
        {isDir ? (
          <Folder size={16} color={folderInfo.color} style={{ marginRight: '8px' }} />
        ) : (
          <File size={16} color="#6b7280" style={{ marginRight: '8px' }} />
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: isDir && level === 0 ? 'bold' : 'normal' }}>{node.name}</span>
            {isDir && level === 0 && (
              <span style={{ 
                backgroundColor: `${folderInfo.color}20`, 
                color: folderInfo.color,
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {node.children?.length || 0} items
              </span>
            )}
          </div>
          {isDir && level === 0 && (
            <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {folderInfo.purpose}
            </span>
          )}
        </div>
      </div>

      {isOpen && isDir && node.children && (
        <div>
          {node.children.map((child: any, idx: number) => (
            <TreeNode key={idx} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderStructure = ({ report }: { report: any }) => {
  const tree = report?.tree || [];
  
  return (
    <motion.div 
      className="rp-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <SectionHeader 
        icon={FolderTree} 
        title="Folder Structure" 
        description="Repository layout and the purpose of each directory" 
      />

      <div className="rp-card" data-lenis-prevent style={{ maxHeight: '680px', overflowY: 'auto' }}>
        {tree.length === 0 ? (
          <p>No folder structure available.</p>
        ) : (
          <div>
            {tree.map((node: any, idx: number) => (
              <TreeNode key={idx} node={node} level={0} />
            ))}
          </div>
        )}
      </div>

      <InsightBox>
        The repository contains {report?.metrics?.total_dirs || 0} directories and {report?.metrics?.total_files || 0} files. {report?.codeHealth?.hasTypeScript ? 'TypeScript is used throughout, providing type safety.' : ''}
      </InsightBox>
    </motion.div>
  );
};

export default FolderStructure;
