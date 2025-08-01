
import React from 'react';
import '../shared.css';
import { Icons } from '../../../icons';

const StudyGroups: React.FC = () => {
  return (
    <div className="school-hub-content-pane">
        <div className="text-cyan-400 mb-4 opacity-50">
            <Icons.Users size={64}/>
        </div>
        <h2 className="font-orbitron text-4xl font-bold text-white mb-2">Study Groups</h2>
        <p className="text-gray-400">Student / Study Group Formation & Collaboration</p>
        <div className="content-container-bordered mt-6 w-full max-w-lg h-64 bg-black/20 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Content for Study Groups would be displayed here.</p>
        </div>
    </div>
  );
};

export default StudyGroups;
