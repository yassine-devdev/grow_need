import React from 'react';
import { Icons } from '../../../icons';
import { Product } from '../../../../types';
import ProductCard from '../ProductCard';
import '../content-styles.css';

const mockContent: Product[] = [
    { id: 'serv-1', title: 'Guidance Counseling Session', category: 'Services', price: '0.00', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=800&auto=format&fit=crop' },
];

const Counseling: React.FC = () => {
  return (
    <div className="mp-placeholder-container">
        <div className="mp-header">
            <div className="mp-header-icon"><Icons.Heart size={48} /></div>
            <div>
                <h2 className="font-orbitron text-3xl font-bold text-white">Counseling</h2>
                <p className="text-gray-400">Services / Counseling</p>
            </div>
        </div>
        
        <div className="mp-filter-bar">
            <div className="mp-search-wrapper">
                <Icons.Search size={18} className="mp-search-icon" />
                <input type="text" placeholder={`Search in Counseling...`} className="mp-search-input" />
            </div>
            <div className="mp-filters">
                <select className="mp-filter-select">
                    <option>All Categories</option>
                </select>
                <select className="mp-filter-select">
                    <option>Sort by Price</option>
                </select>
            </div>
        </div>

        <div className="mp-content-grid">
            {mockContent.map(item => (
                <ProductCard 
                    key={item.id} 
                    product={{...item, price: "Free"}} 
                    actionText="Book Now" 
                    actionIcon={Icons.CalendarDays} 
                />
            ))}
        </div>
    </div>
  );
};

export default Counseling;