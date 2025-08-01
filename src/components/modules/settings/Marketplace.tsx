
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Marketplace: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Marketplace"
        description="Configure settings for your school's marketplace."
        icon={<Icons.Store size={40} className="text-cyan-400"/>}
    />
  );
};

export default Marketplace;
