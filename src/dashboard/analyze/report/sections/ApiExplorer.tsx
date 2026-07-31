import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader.tsx';
import ExplainCard from '../shared/ExplainCard.tsx';
import InsightBox from '../shared/InsightBox.tsx';

export default function ApiExplorer({ report }: { report: any }) {
  const [expanded, setExpanded] = useState<number[]>([]);
  
  const routes = report?.routes || [];
  const apiRoutes = routes.filter((r: any) => r.type === 'API Route');

  const toggleRoute = (index: number) => {
    setExpanded(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return { color: '#16a34a', bg: '#f0fdf4' };
      case 'POST': return { color: '#2563eb', bg: '#eff6ff' };
      case 'PUT': return { color: '#d97706', bg: '#fffbeb' };
      case 'DELETE': return { color: '#dc2626', bg: '#fef2f2' };
      default: return { color: '#6b7280', bg: '#f9fafb' };
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="rp-section">
      <SectionHeader icon={Globe} title="API Explorer" description="Automatically discovered routes and endpoints" />
      
      {routes.length > 0 ? (
        <>
          <InsightBox>
            {routes.length} routes detected. {apiRoutes.length} are API endpoints.
          </InsightBox>
          <div className="rp-api-list">
            {routes.map((route: any, index: number) => {
              const isExpanded = expanded.includes(index);
              const methodColors = getMethodColor(route.method || 'ANY');
              return (
                <div key={index} className="rp-api-card" onClick={() => toggleRoute(index)}>
                  <div className="rp-api-header">
                    <span className="rp-badge" style={{ backgroundColor: methodColors.bg, color: methodColors.color }}>
                      {route.method || 'ANY'}
                    </span>
                    <span className="rp-mono rp-bold">{route.path}</span>
                    <span className="rp-text-small rp-text-gray">{route.type}</span>
                    <span className="rp-mono rp-text-small rp-text-muted">{route.file}</span>
                  </div>
                  {isExpanded && (
                    <div className="rp-api-details">
                      <p><strong>Authentication:</strong> Required if auth middleware detected, otherwise public</p>
                      <p><strong>Description:</strong> {route.path ? `Handles operations for ${route.path}` : 'Endpoint description'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="rp-empty-state">No routes detected automatically.</div>
          <ExplainCard 
            detected="No route files found"
            explanation="Route detection works for Next.js (app/, pages/), and common React patterns (pages/, routes/, views/)."
            whyItMatters="Route documentation helps new contributors understand the API surface."
            recommendation="Ensure routes follow standard directory conventions for automatic detection."
          />
        </>
      )}
    </motion.div>
  );
}
