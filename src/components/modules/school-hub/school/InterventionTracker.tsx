
import React from 'react';
import '../shared.css';
import { Icons } from '../../../icons';

const InterventionTracker: React.FC = () => {
  return (
    <div className="school-hub-content-pane">
        <div className="text-cyan-400 mb-4 opacity-50">
            <Icons.InterventionTracker size={64}/>
        </div>
        <h2 className="font-orbitron text-4xl font-bold text-white mb-2">Intervention & Program ROI Tracker</h2>
        <p className="text-gray-400">School / Intervention & Program ROI Tracker</p>
        <div className="content-container-bordered mt-6 w-full max-w-lg h-64 bg-black/20 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Content for Intervention & Program ROI Tracker would be displayed here.</p>
        </div>
    </div>
  );
};

export default InterventionTracker;
