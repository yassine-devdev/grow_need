
import React from 'react';
import { Icons } from '../../../icons';
import './learning-game-placeholder.css';

interface LearningGamePlaceholderProps {
    title: string;
    breadcrumbs: string;
    icon: React.ReactNode;
}

const LearningGamePlaceholder: React.FC<LearningGamePlaceholderProps> = ({ title, breadcrumbs, icon }) => {
  return (
    <div className="learning-game-placeholder-container">
        <div className="learning-game-header">
            <div className="learning-game-header-icon">{icon}</div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">{breadcrumbs}</p>
            </div>
        </div>
        
        <div className="learning-game-content-area">
            <Icons.GameLibrary size={64} className="text-gray-600 mb-4" />
            <p className="text-gray-500">The interactive learning game for "{title}" would be here.</p>
        </div>
    </div>
  );
};

export default LearningGamePlaceholder;
