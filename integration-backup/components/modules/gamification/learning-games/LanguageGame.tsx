
import React, { useState } from 'react';
import { Icons } from '../../../icons';
import './LanguageGame.css';
import VocabularyVoyage from './vocabulary-voyage/VocabularyVoyage';
import GrammarQuest from './grammar-quest/GrammarQuest';

type Game = 'menu' | 'vocabulary' | 'grammar';

interface GameCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ icon, title, description, onClick }) => (
    <button className="game-selection-card" onClick={onClick}>
        <div className="game-card-icon">{icon}</div>
        <h3 className="game-card-title">{title}</h3>
        <p className="game-card-description">{description}</p>
        <div className="game-card-footer">
            <span>Play Now</span>
            <Icons.ChevronRight size={20} />
        </div>
    </button>
);

const LanguageGame: React.FC = () => {
    const [activeGame, setActiveGame] = useState<Game>('menu');

    const renderContent = () => {
        switch (activeGame) {
            case 'vocabulary':
                return <VocabularyVoyage onBack={() => setActiveGame('menu')} />;
            case 'grammar':
                return <GrammarQuest onBack={() => setActiveGame('menu')} />;
            default:
                return (
                    <div className="language-game-menu">
                        <div className="language-game-menu-header">
                            <div className="learning-game-header-icon"><Icons.LanguageGame size={64} /></div>
                            <div>
                                <h2 className="font-orbitron text-3xl font-bold text-white">Language Games</h2>
                                <p className="text-gray-400">Select a game to start learning!</p>
                            </div>
                        </div>
                        <div className="game-selection-grid">
                            <GameCard 
                                icon={<Icons.VocabularyVoyage size={48} />}
                                title="Vocabulary Voyage"
                                description="Match words to their definitions in this challenging AI-powered quiz."
                                onClick={() => setActiveGame('vocabulary')}
                            />
                            <GameCard 
                                icon={<Icons.GrammarQuest size={48} />}
                                title="Grammar Quest"
                                description="Test your grammar skills with sentence structure puzzles. (Coming Soon)"
                                onClick={() => setActiveGame('grammar')}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="language-game-container">
            {renderContent()}
        </div>
    );
};

export default LanguageGame;