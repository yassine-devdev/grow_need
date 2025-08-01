
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const SubscriptionPlan: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Subscription Plan"
        description="Manage your subscription and view usage."
        icon={<Icons.CreditCard size={40} className="text-cyan-400"/>}
    />
  );
};

export default SubscriptionPlan;