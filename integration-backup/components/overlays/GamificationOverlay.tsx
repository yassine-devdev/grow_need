import React, { useState, useMemo } from 'react';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import { Icons } from '../icons';
import './GamificationOverlay.css';
import '../ui/search-input.css';

// Import all gamification components
import Badges from '../modules/gamification/achievements/Badges';
import Certificates from '../modules/gamification/achievements/Certificates';
import Showcases from '../modules/gamification/achievements/Showcases';

import EduCoinWallet from '../modules/gamification/rewards/EduCoinWallet';
import RewardStore from '../modules/gamification/rewards/RewardStore';
import TradingPost from '../modules/gamification/rewards/TradingPost';
import CharityDonations from '../modules/gamification/rewards/CharityDonations';

import GameLibrary from '../modules/gamification/challenges/GameLibrary';
import LearningChallenges from '../modules/gamification/challenges/LearningChallenges';

import Leaderboards from '../modules/gamification/community/Leaderboards';

import LanguageGame from '../modules/gamification/learning-games/LanguageGame';
import MathGame from '../modules/gamification/learning-games/MathGame';
import ScienceGame from '../modules/gamification/learning-games/ScienceGame';
import PokiGame from '../modules/gamification/learning-games/poki/PokiGame';

type L1Tab = 'Achievements' | 'Rewards' | 'Challenges' | 'Community' | 'Learning Games';

interface L2Item {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

const gamificationData: Record<L1Tab, L2Item[]> = {
  Achievements: [
    { id: 'achievements.badges', name: 'Badges', icon: Icons.Badges, component: Badges },
    { id: 'achievements.certificates', name: 'Certificates', icon: Icons.Certificates, component: Certificates },
    { id: 'achievements.showcases', name: 'Showcases', icon: Icons.Showcases, component: Showcases },
  ],
  Rewards: [
    { id: 'rewards.wallet', name: 'EduCoin Wallet', icon: Icons.EduCoinWallet, component: EduCoinWallet },
    { id: 'rewards.store', name: 'Reward Store', icon: Icons.RewardStore, component: RewardStore },
    { id: 'rewards.trading', name: 'Trading Post', icon: Icons.TradingPost, component: TradingPost },
    { id: 'rewards.charity', name: 'Charity Donations', icon: Icons.CharityDonations, component: CharityDonations },
  ],
  Challenges: [
    { id: 'challenges.library', name: 'Game Library', icon: Icons.GameLibrary, component: GameLibrary },
    { id: 'challenges.learning', name: 'Learning Challenges', icon: Icons.LearningChallenges, component: LearningChallenges },
  ],
  Community: [
    { id: 'community.leaderboards', name: 'Leaderboards', icon: Icons.Leaderboards, component: Leaderboards },
  ],
  'Learning Games': [
    { id: 'learning.language', name: 'Language', icon: Icons.LanguageGame, component: LanguageGame },
    { id: 'learning.math', name: 'Math', icon: Icons.MathGame, component: MathGame },
    { id: 'learning.science', name: 'Science', icon: Icons.ScienceGame, component: ScienceGame },
    { id: 'learning.poki', name: 'Poki', icon: Icons.PokiGame, component: PokiGame },
  ],
};

const L1_TABS: { id: L1Tab; name: string; icon: React.ElementType }[] = [
    { id: 'Learning Games', name: 'Learning Games', icon: Icons.GameLibrary },
    { id: 'Achievements', name: 'Achievements', icon: Icons.Badges },
    { id: 'Rewards', name: 'Rewards', icon: Icons.RewardStore },
    { id: 'Challenges', name: 'Challenges', icon: Icons.LearningChallenges },
    { id: 'Community', name: 'Community', icon: Icons.Leaderboards },
];

interface GamificationOverlayProps {
  onClose: () => void;
  onMinimize: () => void;
}

const GamificationOverlay: React.FC<GamificationOverlayProps> = ({ onClose, onMinimize }) => {
  const [activeL1, setActiveL1] = useState<L1Tab>('Achievements');
  const [activeL2Id, setActiveL2Id] = useState<string>(gamificationData['Achievements'][0].id);

  const handleL1Click = (tabId: L1Tab) => {
    setActiveL1(tabId);
    setActiveL2Id(gamificationData[tabId][0].id);
  };
  
  const l2Items = useMemo(() => gamificationData[activeL1], [activeL1]);

  const ActiveComponent = useMemo(() => {
    return l2Items.find(item => item.id === activeL2Id)?.component || null;
  }, [l2Items, activeL2Id]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <GlassmorphicContainer className="gamification-overlay-bordered w-full h-full rounded-2xl flex flex-col overflow-hidden">
        <header className="gamification-header">
          <div className="gamification-l1-nav">
            {L1_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleL1Click(tab.id)}
                className={`gamification-l1-btn ${activeL1 === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="flex-grow flex justify-center">
            <div className="relative w-72">
              <Icons.Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search Games & Achievements..."
                className="search-input-bordered"
              />
            </div>
          </div>
          <div className="gamification-window-controls">
            <button onClick={onMinimize} className="gamification-control-btn" aria-label="Minimize">
                <Icons.Minimize size={20} />
            </button>
            <button onClick={onClose} className="gamification-control-btn close" aria-label="Close">
                <Icons.Close size={20} />
            </button>
          </div>
        </header>
        <div className="gamification-body">
            <div className="gamification-l2-sidebar">
                {l2Items.map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => setActiveL2Id(item.id)}
                                className={`gamification-l2-button ${activeL2Id === item.id ? 'active' : ''}`}
                                aria-label={item.name}
                            >
                                <Icon size={24} />
                            </button>
                            <div className="nav-tooltip-bordered absolute left-full ml-4 top-1/2 -translate-y-1/2">
                                {item.name}
                            </div>
                        </div>
                    );
                })}
            </div>
            <main className="gamification-content-pane">
                {ActiveComponent ? <ActiveComponent /> : null}
            </main>
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default GamificationOverlay;