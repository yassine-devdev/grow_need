
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Icons } from '../icons';
import { APP_MODULES } from '../../constants';
import GlassmorphicContainer from '../ui/GlassmorphicContainer';
import './global-header.css';
import '../ui/search-input.css';

const GlobalHeader: React.FC = () => {
  const { activeModule, cart, toggleCart } = useAppContext();
  const currentModule = APP_MODULES.find(m => m.id === activeModule);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <GlassmorphicContainer className="global-header-container px-4 flex items-center justify-between w-full shrink-0 global-header-container-bordered">
      <div className="flex items-center gap-4">
        <h1 className="font-orbitron font-bold text-gray-100 tracking-wider ms-2">
          {currentModule?.name || 'Dashboard'}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Icons.Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Global Search..."
            className="search-input-bordered"
          />
        </div>
        <button onClick={toggleCart} className="cart-button relative">
          <Icons.ShoppingCart size={22} />
          {itemCount > 0 && (
            <span className="cart-badge absolute top-[-4px] end-[-4px]">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </GlassmorphicContainer>
  );
};

export default GlobalHeader;