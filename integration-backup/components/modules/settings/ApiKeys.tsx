
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const ApiKeys: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="API Keys"
        description="Manage API keys for external integrations."
        icon={<Icons.KeyRound size={40} className="text-cyan-400"/>}
    />
  );
};

export default ApiKeys;