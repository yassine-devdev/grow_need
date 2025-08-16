import React, { useEffect } from 'react';
import { AppContextProvider, useAppContext } from './hooks/useAppContext';
import { AIProviderWrapper } from './components/common/AIProviderWrapper';
import GlobalHeader from './components/layout/GlobalHeader';
import MainNavigationSidebar from './components/layout/MainNavigationSidebar';
import ContextualSidebar from './components/layout/ContextualSidebar';
import BottomDock from './components/layout/BottomDock';
import { APP_MODULES, OVERLAY_APPS } from './constants';
import CartOverlay from './components/overlays/CartOverlay';
import { applyTheme, applyDesign } from './components/modules/settings/theme-utils';
import { secureStorage } from './utils/secureStorage';

const AppContent: React.FC = () => {
  const { activeModule, activeOverlay, closeOverlay, minimizeOverlay, isCartOpen, isRtl } = useAppContext();

  useEffect(() => {
    // Migrate legacy storage items and cleanup old data
    secureStorage.migrateLegacyItems();
    secureStorage.cleanup();

    // Load theme from secure storage
    const savedTheme = secureStorage.getItem('aura-theme');
    if (savedTheme) {
      try {
        applyTheme(savedTheme);
      } catch (e) {
        console.error("Failed to apply saved theme", e);
        secureStorage.removeItem('aura-theme');
      }
    }

    // Load design from secure storage
    const savedDesign = secureStorage.getItem('aura-design');
    if (savedDesign) {
      try {
        applyDesign(savedDesign);
      } catch (e) {
        console.error("Failed to apply saved design", e);
        secureStorage.removeItem('aura-design');
      }
    }
  }, []);

  const ActiveModuleComponent = APP_MODULES.find(m => m.id === activeModule)?.component || (() => null);
  const ActiveOverlayComponent = OVERLAY_APPS.find(o => o.id === activeOverlay)?.component || null;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="h-screen w-screen main-background text-gray-200 font-sans overflow-hidden flex flex-col">
      
      <div className="relative z-10 flex flex-col h-full">
        <GlobalHeader />

        {/* This main row contains both sidebars and the content, sitting between header and footer */}
        <main className={`flex-1 flex overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`}>
          <ContextualSidebar />

          {/* Main Content Area */}
          <div className="flex-1 p-4 overflow-hidden">
            <ActiveModuleComponent />
          </div>

          <MainNavigationSidebar />
        </main>
        
        <BottomDock />
      </div>

      {/* Render overlay if active */}
      {ActiveOverlayComponent && activeOverlay && (
         <ActiveOverlayComponent
            onClose={() => closeOverlay(activeOverlay)}
            onMinimize={() => minimizeOverlay(activeOverlay)}
         />
      )}
      {isCartOpen && <CartOverlay />}
    </div>
  );
};

const App: React.FC = () => (
  <AIProviderWrapper config={{
    autoConnect: true,
    preferEnhanced: true,
    enableFeatureFlags: process.env.NODE_ENV === 'development'
  }}>
    <AppContextProvider>
      <AppContent />
    </AppContextProvider>
  </AIProviderWrapper>
);

export default App;
