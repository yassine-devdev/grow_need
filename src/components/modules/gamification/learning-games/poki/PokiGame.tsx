
import React from 'react';
import { Icons } from '../../../../icons';
import './PokiGame.css';

const PokiGame: React.FC = () => {
  return (
    <div className="poki-game-container">
      <div className="poki-game-header">
        <div className="poki-game-header-icon">
          <Icons.PokiGame size={48} />
        </div>
        <div>
          <h2 className="font-orbitron text-3xl font-bold text-white">Poki Games</h2>
          <p className="text-gray-400">Learning Games / Poki / 2048</p>
        </div>
      </div>
      <div className="poki-game-iframe-wrapper">
        <iframe
          src="https://poki.com/en/g/2048"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          title="Poki Game - 2048"
        ></iframe>
      </div>
    </div>
  );
};

export default PokiGame;
