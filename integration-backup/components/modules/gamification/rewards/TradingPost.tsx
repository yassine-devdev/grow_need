import React from 'react';
import { Icons } from '../../../icons';
import '../GamificationContentPlaceholder.css';

const TradingPost: React.FC = () => {
  return (
    <div className="gamification-placeholder-container">
        <div className="gamification-header">
            <div className="gamification-header-icon"><Icons.TradingPost size={64} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Trading Post</h2>
                <p className="text-gray-400">Rewards / Trading Post</p>
            </div>
        </div>
        
        <div className="gamification-content-area">
            <p className="text-gray-500">The peer-to-peer Trading Post is coming soon!</p>
        </div>
    </div>
  );
};

export default TradingPost;