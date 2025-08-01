
import React from 'react';
import { Icons } from '../../../../icons';
import '../learning-game-placeholder.css';

const GrammarQuest: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
  return (
    <div className="learning-game-placeholder-container">
        <div className="learning-game-header">
            <div className="learning-game-header-icon"><Icons.GrammarQuest size={64} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Grammar Quest</h2>
                <p className="text-gray-400">Learning Games / Language / Grammar</p>
            </div>
        </div>
        
        <div className="learning-game-content-area">
            <Icons.Wand2 size={64} className="text-gray-600 mb-4" />
            <p className="text-gray-500">The interactive "Grammar Quest" game is coming soon!</p>
        </div>
        <button className="game-button back-button self-center" onClick={onBack}>
            <Icons.ChevronLeft size={20}/> Back to Menu
        </button>
    </div>
  );
};

export default GrammarQuest;
