
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const ConnectedApps: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Connected Apps"
        description="Integrate with your favorite third-party services."
        icon={<Icons.Puzzle size={40} className="text-cyan-400"/>}
    />
  );
};

export default ConnectedApps;