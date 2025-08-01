// Test utilities for React Testing Library
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppContextProvider } from '../hooks/useAppContext';
import { AppModuleId, OverlayId } from '../types';

// Mock data for testing - matching actual AppContext structure
export const mockAppContextValue = {
  // Module state
  activeModule: AppModuleId.Dashboard,
  setActiveModule: jest.fn(),

  // Sidebar state
  isContextualSidebarOpen: false,
  toggleContextualSidebar: jest.fn(),
  isMainSidebarOpen: true,
  toggleMainSidebar: jest.fn(),

  // Overlay management
  openOverlays: [] as OverlayId[],
  activeOverlay: null as OverlayId | null,
  launchOverlay: jest.fn(),
  closeOverlay: jest.fn(),
  minimizeOverlay: jest.fn(),
  restoreOverlay: jest.fn(),

  // Cart state
  cart: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateCartItemQuantity: jest.fn(),
  clearCart: jest.fn(),
  isCartOpen: false,
  toggleCart: jest.fn(),

  // RTL support
  isRtl: false,
  toggleRtl: jest.fn(),
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppContextProvider>
      {children}
    </AppContextProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Mock factories for common objects
export const createMockModule = (overrides = {}) => ({
  id: 'test-module',
  name: 'Test Module',
  icon: 'TestIcon',
  description: 'Test module description',
  component: () => <div>Test Component</div>,
  ...overrides,
});

export const createMockOverlay = (overrides = {}) => ({
  id: 'test-overlay',
  name: 'Test Overlay',
  icon: 'TestIcon',
  description: 'Test overlay description',
  component: () => <div>Test Overlay</div>,
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: 'test-item',
  name: 'Test Item',
  price: 10.99,
  category: 'test',
  description: 'Test item description',
  ...overrides,
});

// Mock AI response for testing
export const createMockAIResponse = (overrides = {}) => ({
  id: 'test-response',
  content: 'Test AI response content',
  timestamp: new Date().toISOString(),
  role: 'assistant' as const,
  ...overrides,
});

// Mock chat session for testing
export const createMockChatSession = (overrides = {}) => ({
  sendMessage: jest.fn(),
  sendMessageStream: jest.fn(),
  getHistory: jest.fn().mockReturnValue([]),
  ...overrides,
});

// Helper functions for testing
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Custom matchers
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

// Test data generators
export const generateTestId = (prefix: string = 'test') =>
  `${prefix}-${Math.random().toString(36).substring(2, 11)}`;

export const generateMockProps = (component: string, overrides = {}) => {
  const baseProps = {
    'data-testid': generateTestId(component),
    ...overrides,
  };
  
  return baseProps;
};
