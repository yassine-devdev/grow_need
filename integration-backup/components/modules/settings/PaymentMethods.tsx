
import React from 'react';
import { Icons } from '../../icons';
import SettingsPlaceholder from './SettingsPlaceholder';

const PaymentMethods: React.FC = () => {
  return (
    <SettingsPlaceholder 
        title="Payment Methods"
        description="Manage your saved payment methods for billing."
        icon={<Icons.Wallet size={40} className="text-cyan-400"/>}
    />
  );
};

export default PaymentMethods;