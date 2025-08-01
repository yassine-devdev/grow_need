
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const PasswordPolicy: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Password Policy"
        description="Define password requirements for all users."
        icon={<Icons.BookLock size={40} className="text-cyan-400"/>}
    />
  );
};

export default PasswordPolicy;