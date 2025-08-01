
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Notifications: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Notifications"
        description="Manage how you receive notifications."
        icon={<Icons.Bell size={40} className="text-cyan-400"/>}
    />
  );
};

export default Notifications;
