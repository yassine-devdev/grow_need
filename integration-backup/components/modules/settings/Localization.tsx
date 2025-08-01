
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const Localization: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Localization"
        description="Set your school's language, timezone, and currency."
        icon={<Icons.Globe size={40} className="text-cyan-400"/>}
    />
  );
};

export default Localization;