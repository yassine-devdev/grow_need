
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const TwoFactorAuth: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Two-Factor Authentication"
        description="Add an extra layer of security to user accounts."
        icon={<Icons.Smartphone size={40} className="text-cyan-400"/>}
    />
  );
};

export default TwoFactorAuth;
