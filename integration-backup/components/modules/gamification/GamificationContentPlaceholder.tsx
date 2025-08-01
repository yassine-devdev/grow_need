
import React from 'react';
import { Icons } from '../../icons';
import './GamificationContentPlaceholder.css';

interface GamificationContentPlaceholderProps {
    title: string;
    breadcrumbs: string;
    icon: React.ReactNode;
}

const GamificationContentPlaceholder: React.FC<GamificationContentPlaceholderProps> = ({ title, breadcrumbs, icon }) => {
  return (
    <div className="gamification-placeholder-container">
        <div className="gamification-header">
            <div className="gamification-header-icon">{icon}</div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">{breadcrumbs}</p>
            </div>
        </div>
        
        <div className="gamification-content-area">
            <p className="text-gray-500">Content for {title} will be displayed here.</p>
        </div>
    </div>
  );
};

export default GamificationContentPlaceholder;