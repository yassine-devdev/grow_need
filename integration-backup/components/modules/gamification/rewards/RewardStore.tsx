import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../../marketplace/ProductCard';
import './RewardStore.css';

const mockRewards: Product[] = [
    { id: 'rew-1', title: 'School Hoodie', category: 'Apparel', price: '500', image: 'https://images.unsplash.com/photo-1556156649-7c4d5a1a3a3a33?q=80&w=800&auto=format&fit=crop' },
    { id: 'rew-2', title: 'Free Lunch Pass', category: 'Perks', price: '100', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop' },
    { id: 'rew-3', title: '1-Hour Tutoring', category: 'Services', price: '250', image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800&auto=format&fit=crop' },
    { id: 'rew-4', title: 'Library Late Fee Waiver', category: 'Perks', price: '50', image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop' },
];

const RewardStore: React.FC = () => {
    return (
        <div className="reward-store-container">
            <div className="gamification-header">
                <div>
                    <h2 className="font-orbitron text-3xl font-bold text-white">Reward Store</h2>
                    <p className="text-gray-400">Spend your EduCoins on cool items and perks!</p>
                </div>
            </div>

            <div className="mp-content-grid">
                {mockRewards.map(item => (
                    <ProductCard 
                        key={item.id} 
                        product={{...item, price: `${item.price} EC`}} 
                        actionText="Redeem"
                    />
                ))}
            </div>
        </div>
    );
};

export default RewardStore;