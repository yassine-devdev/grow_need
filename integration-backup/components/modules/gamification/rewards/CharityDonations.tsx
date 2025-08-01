import React from 'react';
import { Icons } from '../../../icons';
import './CharityDonations.css';

const mockCharities = [
    { id: 1, name: 'Books for All Foundation', description: 'Provides books to underprivileged children worldwide.', icon: Icons.Book, goal: 50000, current: 28500 },
    { id: 2, name: 'Clean Water Fund', description: 'Helps bring clean and safe drinking water to communities in need.', icon: Icons.Cloud, goal: 75000, current: 45000 },
    { id: 3, name: 'Tech in Schools Initiative', description: 'Funds technology and computer labs for under-resourced schools.', icon: Icons.Tech, goal: 100000, current: 65000 },
];

const CharityDonations: React.FC = () => {
    return (
        <div className="charity-container">
            <div className="gamification-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Charity Donations</h2>
                    <p className="text-gray-400">Use your EduCoins to make a real-world difference.</p>
                </div>
            </div>

            <div className="charity-list">
                {mockCharities.map(charity => {
                    const CharityIcon = charity.icon;
                    const progress = (charity.current / charity.goal) * 100;
                    return (
                        <div key={charity.id} className="charity-card">
                            <div className="charity-icon-wrapper"><CharityIcon size={24} /></div>
                            <div className="charity-details">
                                <h3 className="charity-name">{charity.name}</h3>
                                <p className="charity-description">{charity.description}</p>
                                <div className="charity-progress">
                                    <div className="charity-progress-bar-bg">
                                        <div className="charity-progress-bar-fg" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="charity-progress-text">{charity.current.toLocaleString()} / {charity.goal.toLocaleString()} EduCoins</p>
                                </div>
                            </div>
                            <button className="donate-button">Donate</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CharityDonations;