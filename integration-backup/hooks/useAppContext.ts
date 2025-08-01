import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AppModuleId, OverlayId, Product, CartItem } from '../types';

interface AppContextType {
  activeModule: AppModuleId;
  setActiveModule: (module: AppModuleId) => void;
  isContextualSidebarOpen: boolean;
  toggleContextualSidebar: () => void;
  isMainSidebarOpen: boolean;
  toggleMainSidebar: () => void;
  
  // Overlay management
  openOverlays: OverlayId[];
  activeOverlay: OverlayId | null;
  launchOverlay: (id: OverlayId) => void;
  closeOverlay: (id: OverlayId) => void;
  minimizeOverlay: (id: OverlayId) => void;
  restoreOverlay: (id: OverlayId) => void;

  // Cart management
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateCartItemQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;

  // RTL management
  isRtl: boolean;
  toggleRtl: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModuleId>(AppModuleId.Dashboard);
  const [isContextualSidebarOpen, setIsContextualSidebarOpen] = useState(false);
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
  const [openOverlays, setOpenOverlays] = useState<OverlayId[]>([]);
  const [activeOverlay, setActiveOverlay] = useState<OverlayId | null>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // RTL state
  const [isRtl, setIsRtl] = useState(false);

  const toggleContextualSidebar = useCallback(() => setIsContextualSidebarOpen(prev => !prev), []);
  const toggleMainSidebar = useCallback(() => setIsMainSidebarOpen(prev => !prev), []);
  const toggleRtl = useCallback(() => setIsRtl(prev => !prev), []);
  
  const launchOverlay = useCallback((id: OverlayId) => {
    setOpenOverlays(prev => prev.includes(id) ? prev : [...prev, id]);
    setActiveOverlay(id);
  }, []);
  const closeOverlay = useCallback((id: OverlayId) => {
    setOpenOverlays(prev => prev.filter(o => o !== id));
    if (activeOverlay === id) setActiveOverlay(null);
  }, [activeOverlay]);
  const minimizeOverlay = useCallback((id: OverlayId) => {
    if (activeOverlay === id) setActiveOverlay(null);
  }, [activeOverlay]);
  const restoreOverlay = useCallback((id: OverlayId) => setActiveOverlay(id), []);
  
  // Cart functions
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  
  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);
  
  const removeFromCart = useCallback((productId: string | number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateCartItemQuantity = useCallback((productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const contextValue = useMemo(() => ({
    activeModule,
    setActiveModule,
    isContextualSidebarOpen,
    toggleContextualSidebar,
    isMainSidebarOpen,
    toggleMainSidebar,
    openOverlays,
    activeOverlay,
    launchOverlay,
    closeOverlay,
    minimizeOverlay,
    restoreOverlay,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isCartOpen,
    toggleCart,
    isRtl,
    toggleRtl,
  }), [activeModule, isContextualSidebarOpen, isMainSidebarOpen, openOverlays, activeOverlay, cart, isCartOpen, isRtl, launchOverlay, closeOverlay, minimizeOverlay, restoreOverlay, addToCart, removeFromCart, updateCartItemQuantity, clearCart, toggleCart, toggleContextualSidebar, toggleMainSidebar, toggleRtl]);

  return React.createElement(AppContext.Provider, { value: contextValue }, children);
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
