
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Students: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Students"
        description="Manage student user accounts."
        icon={<Icons.Students size={40} className="text-cyan-400"/>}
    />
  );
};

export default Students;
