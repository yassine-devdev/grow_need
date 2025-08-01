
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const AuditLog: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Audit Log"
        description="Track important activities within your account."
        icon={<Icons.History size={40} className="text-cyan-400"/>}
    />
  );
};

export default AuditLog;
