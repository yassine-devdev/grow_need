
import React from 'react';
import '../shared.css';
import { Icons } from '../../../icons';

const FinancialOversight: React.FC = () => {
  return (
    <div className="school-hub-content-pane">
        <div className="text-cyan-400 mb-4 opacity-50">
            <Icons.FinancialOversight size={64}/>
        </div>
        <h2 className="font-orbitron text-4xl font-bold text-white mb-2">Financial Oversight</h2>
        <p className="text-gray-400">Administration / Financial Oversight</p>
        <div className="content-container-bordered mt-6 w-full max-w-lg h-64 bg-black/20 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">A dashboard for financial oversight would be displayed here.</p>
        </div>
    </div>
  );
};

export default FinancialOversight;
