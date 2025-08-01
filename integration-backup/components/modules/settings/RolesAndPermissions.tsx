
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const RolesAndPermissions: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Roles & Permissions"
        description="Define what users can see and do."
        icon={<Icons.UserCog size={40} className="text-cyan-400"/>}
    />
  );
};

export default RolesAndPermissions;