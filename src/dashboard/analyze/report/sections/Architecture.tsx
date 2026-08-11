import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, X } from 'lucide-react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SectionHeader } from '../shared/SectionHeader.tsx';
import { ExplainCard } from '../shared/ExplainCard.tsx';

export const Architecture = ({ report }: { report: any }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const archLayers = report?.architecture || [];

  const NODE_STYLES: Record<string, string> = {
    frontend: '#2563eb',
    backend: '#16a34a',
    database: '#7c3aed',
    auth: '#d97706',
    infra: '#6b7280',
    testing: '#dc2626',
  };

  const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
    frontend: { x: 300, y: 0 },
    backend: { x: 300, y: 120 },
    database: { x: 300, y: 240 },
    auth: { x: 600, y: 120 },
    infra: { x: 0, y: 240 },
    testing: { x: 600, y: 240 },
  };

  const nodes = archLayers.map((layer: any) => ({
    id: layer.id,
    type: 'default',
    position: NODE_POSITIONS[layer.type] || { x: 300, y: 120 },
    data: { 
      label: layer.label,
      description: layer.description,
      files: layer.files || []
    },
    style: {
      border: `2px solid ${NODE_STYLES[layer.type] || '#000'}`,
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: '#fff',
      fontWeight: 'bold',
    }
  }));

  const edges = [];
  const hasFrontend = archLayers.some((l: any) => l.type === 'frontend');
  const hasBackend = archLayers.some((l: any) => l.type === 'backend');
  const hasDatabase = archLayers.some((l: any) => l.type === 'database');
  const hasAuth = archLayers.some((l: any) => l.type === 'auth');

  if (hasFrontend && hasBackend) {
    edges.push({ id: 'e-front-back', source: archLayers.find((l:any)=>l.type==='frontend')?.id, target: archLayers.find((l:any)=>l.type==='backend')?.id, animated: true });
  }
  if (hasBackend && hasDatabase) {
    edges.push({ id: 'e-back-db', source: archLayers.find((l:any)=>l.type==='backend')?.id, target: archLayers.find((l:any)=>l.type==='database')?.id, animated: true });
  }
  if (hasBackend && hasAuth) {
    edges.push({ id: 'e-back-auth', source: archLayers.find((l:any)=>l.type==='backend')?.id, target: archLayers.find((l:any)=>l.type==='auth')?.id, animated: true });
  }

  const handleNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
  };

  return (
    <motion.div 
      className="rp-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <SectionHeader 
        icon={Network} 
        title="Architecture" 
        description="How the codebase is structured across layers" 
      />

      {archLayers.length === 0 ? (
        <div className="rp-card">
          <p>Architecture could not be fully detected. The repository may use a non-standard structure.</p>
        </div>
      ) : (
        <div className="rp-card" style={{ height: '400px', position: 'relative' }}>
          <ReactFlow 
            nodes={nodes} 
            edges={edges}
            onNodeClick={handleNodeClick}
            fitView
          >
            <Background color="#ccc" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {selectedNode && (
            <motion.div 
              className="rp-side-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                height: '100%',
                width: '300px',
                backgroundColor: 'white',
                borderLeft: '1px solid #e5e7eb',
                padding: '20px',
                boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="rp-card-title" style={{ margin: 0 }}>{selectedNode.data.label}</h3>
                <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <p className="rp-text-sm" style={{ marginBottom: '16px' }}>{selectedNode.data.description}</p>
              <h4 className="rp-text-sm font-semibold">Files involved</h4>
              <ul className="rp-text-sm" style={{ paddingLeft: '20px', marginTop: '8px' }}>
                {selectedNode.data.files.slice(0, 5).map((file: string, idx: number) => (
                  <li key={idx} style={{ wordBreak: 'break-all' }}>{file}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      )}

      <ExplainCard
        detected={`${archLayers.length} architectural layers detected`}
        explanation="The architecture graph maps the major layers of the codebase — frontend UI, backend API, database, and supporting services."
        whyItMatters="Understanding architectural layers helps you navigate unfamiliar codebases faster and identify where to make changes."
        recommendation="Clicking any node reveals the files and responsibilities of that layer."
      />
    </motion.div>
  );
};

export default Architecture;
