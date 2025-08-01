import React from 'react';
import { Icons } from '../../../icons';
import './LearningChallenges.css';

const challenges = [
  { 
    id: 1, 
    title: 'Daily Quiz Battle', 
    description: 'Fight & be the 1st of 1000', 
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop',
    icon: Icons.Swords
  },
  { 
    id: 2, 
    title: 'Weekly Tournament', 
    description: 'Prize Pool: 10,000 EduCoins', 
    image: 'https://images.unsplash.com/photo-1579546929662-7241265162f2?q=80&w=800&auto=format&fit=crop',
    icon: Icons.Trophy
  },
  { 
    id: 3, 
    title: 'Referral Program', 
    description: 'Invite friends & earn 10%', 
    image: 'https://images.unsplash.com/photo-1634902379023-e8568b6b156b?q=80&w=800&auto=format&fit=crop',
    icon: Icons.UserPlus
  },
  { 
    id: 4, 
    title: 'Free Balance', 
    description: '+500 EC on first deposit', 
    image: 'https://images.unsplash.com/photo-1543335899-23a5155f3032?q=80&w=800&auto=format&fit=crop',
    icon: Icons.EduCoinWallet
  },
];

const ChallengeCard = ({ challenge }) => {
    const ChallengeIcon = challenge.icon;
    return (
        <div className="challenge-card">
            <img src={challenge.image} alt={challenge.title} className="challenge-card-bg" />
            <div className="challenge-card-overlay"></div>
            <div className="challenge-card-content">
                <div className="challenge-card-icon"><ChallengeIcon size={32} /></div>
                <div>
                    <h3 className="challenge-card-title">{challenge.title}</h3>
                    <p className="challenge-card-desc">{challenge.description}</p>
                </div>
                <div className="challenge-card-arrow">
                    <Icons.ChevronRight size={24} />
                </div>
            </div>
        </div>
    );
};

const LearningChallenges: React.FC = () => {
  return (
    <div className="learning-challenges-container">
        <div className="challenges-grid">
            {challenges.map(c => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
    </div>
  );
};

export default LearningChallenges;
