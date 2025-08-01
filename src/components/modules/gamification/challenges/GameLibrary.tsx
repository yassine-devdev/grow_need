import React from 'react';
import { Icons } from '../../../icons';
import './GameLibrary.css';

const popularGames = [
  { id: 1, title: 'Hammer Vulcan', category: 'Logic', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/b111a81158a141527027b01341a029fe.png' },
  { id: 2, title: 'Viking Fury', category: 'Strategy', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/1273956349a37a5f3e5828785055b809.png' },
  { id: 3, title: 'Fat Drac', category: 'Adventure', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/510a300a12b694a110332857e49f6946.png' },
  { id: 4, title: 'Chicken Drop', category: 'Arcade', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/f80b2a37d6e4b600933758b29c546b7a.png' },
  { id: 5, title: 'Dino Polis', category: 'Puzzle', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/30349acb1793a388a1e8e24c965c276f.png' },
  { id: 6, title: 'Pirate Hunter', category: 'Action', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/9a6c9d51963f45a331908f514f489f66.png' },
];

const newReleases = [
  { id: 7, title: 'Aztec Bonanza', category: 'Adventure', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/582d95b542f7c07b46944634e5659346.png' },
  { id: 8, title: 'Rabbits Rabbits', category: 'Arcade', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/23e956e171b3e51a66050e68d3c26703.png' },
  { id: 9, title: 'Mighty Masks', category: 'Strategy', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/387a6a438883597d312953289945a0bc.png' },
  { id: 10, title: 'Dog House', category: 'Logic', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/3c7a036e492e768815152331578f7000.png' },
  { id: 11, title: 'Knight King', category: 'Action', image: 'https://img.poki.com/cdn-cgi/image/quality=78,width=314,height=314,fit=cover,f=auto/f3a093b137d532a4e4171220a2e58c69.png' },
];

const GameCard = ({ game }) => (
    <div className="game-lib-card">
        <img src={game.image} alt={game.title} className="game-lib-card-img" />
        <div className="game-lib-card-overlay">
            <h4 className="game-lib-card-title">{game.title}</h4>
            <p className="game-lib-card-category">{game.category}</p>
        </div>
        <button className="game-lib-play-btn"><Icons.PlayCircle size={32} /></button>
    </div>
);

const GameLibrary: React.FC = () => {
  return (
    <div className="game-library-container">
        <section className="game-lib-section">
            <div className="game-lib-section-header">
                <Icons.Sparkles size={24} className="text-green-400" />
                <h3>Popular Games</h3>
            </div>
            <div className="game-lib-carousel">
                {popularGames.map(game => <GameCard key={game.id} game={game} />)}
            </div>
        </section>
        <section className="game-lib-section">
            <div className="game-lib-section-header">
                 <Icons.Award size={24} className="text-green-400" />
                <h3>New Releases</h3>
            </div>
            <div className="game-lib-carousel">
                 {newReleases.map(game => <GameCard key={game.id} game={game} />)}
            </div>
        </section>
    </div>
  );
};

export default GameLibrary;
