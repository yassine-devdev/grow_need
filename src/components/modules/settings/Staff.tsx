
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Staff: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Staff"
        description="Manage staff user accounts and permissions."
        icon={<Icons.Users size={40} className="text-cyan-400"/>}
    />
  );
};

export default Staff;
