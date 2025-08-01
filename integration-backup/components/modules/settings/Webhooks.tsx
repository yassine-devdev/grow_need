
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Webhooks: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Webhooks"
        description="Send event data to external URLs."
        icon={<Icons.Webhook size={40} className="text-cyan-400"/>}
    />
  );
};

export default Webhooks;