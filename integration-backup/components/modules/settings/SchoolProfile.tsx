
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const SchoolProfile: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="School Profile"
        description="Manage your school's public information."
        icon={<Icons.School size={40} className="text-cyan-400"/>}
    />
  );
};

export default SchoolProfile;
