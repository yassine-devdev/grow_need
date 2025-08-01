
import React from 'react';
import { Icons } from '../../icons';
import './shared.css';
import './SettingsPlaceholder.css';

interface SettingsPlaceholderProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const SettingsPlaceholder: React.FC<SettingsPlaceholderProps> = ({ title, description, icon }) => {
  return (
    <div className="settings-pane-container">
        <div className="settings-header">
            {icon}
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">{title}</h2>
                <p className="text-gray-400">{description}</p>
            </div>
        </div>
        
        <div className="settings-placeholder-content">
            <p className="text-gray-500">Settings for {title} will be available here.</p>
        </div>
    </div>
  );
};

export default SettingsPlaceholder;
