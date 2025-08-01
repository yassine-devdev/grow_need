import React from 'react';
import { Icons } from '../../../icons';
import './Showcases.css';

const mockTrophies = [
  { id: 1, title: 'Quiz Master', icon: Icons.Sparkles, color: 'gold' },
  { id: 2, title: 'Science Explorer', icon: Icons.FlaskConical, color: 'silver' },
  { id: 3, title: 'AI Companion', icon: Icons.AIHelper, color: 'bronze' },
  { id: 4, title: 'Helping Hand', icon: Icons.CharityDonations, color: 'silver' },
];

const Showcases: React.FC = () => {
    return (
        <div className="showcases-container">
            <div className="gamification-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Trophy Showcases</h2>
                    <p className="text-gray-400">Display your most prized awards and achievements.</p>
                </div>
            </div>

            <div className="showcase-area">
                <div className="shelf">
                    {mockTrophies.map(trophy => {
                         const TrophyIcon = trophy.icon;
                        return (
                             <div key={trophy.id} className="trophy-item-wrapper">
                                <div className={`trophy-base ${trophy.color}-base`}></div>
                                <div className={`trophy-top ${trophy.color}-top`}>
                                    <TrophyIcon size={32} />
                                </div>
                                <p className="trophy-title">{trophy.title}</p>
                            </div>
                        );
                    })}
                </div>
                 <div className="shelf">
                    {/* Placeholder for more trophies */}
                </div>
            </div>
        </div>
    );
};

export default Showcases;