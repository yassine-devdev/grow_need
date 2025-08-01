
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Invoices: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Invoices"
        description="View and download your billing history."
        icon={<Icons.FileText size={40} className="text-cyan-400"/>}
    />
  );
};

export default Invoices;
