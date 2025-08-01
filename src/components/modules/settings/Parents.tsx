
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Parents: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Parents"
        description="Manage parent user accounts."
        icon={<Icons.Users size={40} className="text-cyan-400"/>}
    />
  );
};

export default Parents;
