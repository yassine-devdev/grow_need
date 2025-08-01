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
  confidence: 0.95,
  ...overrides,
});

// Mock chat session for testing
export const createMockChatSession = (overrides = {}) => ({
  sendMessage: jest.fn(),
  sendMessageStream: jest.fn(),
  getHistory: jest.fn().mockReturnValue([]),
  clearHistory: jest.fn(),
  isTyping: false,
  ...overrides,
});

// Mock CRM data factories
export const createMockStudent = (overrides = {}) => ({
  id: generateTestId('student'),
  name: 'John Doe',
  email: 'john.doe@example.com',
  grade: '10th',
  dateEnrolled: '2024-01-15',
  status: 'active',
  courses: ['Math', 'Science'],
  gpa: 3.8,
  ...overrides,
});

export const createMockTeacher = (overrides = {}) => ({
  id: generateTestId('teacher'),
  name: 'Jane Smith',
  email: 'jane.smith@school.edu',
  department: 'Mathematics',
  dateHired: '2020-08-01',
  status: 'active',
  courses: ['Algebra', 'Calculus'],
  ...overrides,
});

export const createMockParent = (overrides = {}) => ({
  id: generateTestId('parent'),
  name: 'Robert Doe',
  email: 'robert.doe@example.com',
  phone: '555-0123',
  students: ['student-1'],
  emergencyContact: true,
  ...overrides,
});

// Mock API responses
export const createMockAPIResponse = (data: any, overrides = {}) => ({
  ok: true,
  status: 200,
  json: async () => data,
  text: async () => JSON.stringify(data),
  ...overrides,
});

export const createMockAPIError = (status = 500, message = 'Server Error') => ({
  ok: false,
  status,
  statusText: message,
  json: async () => ({ error: message }),
  text: async () => message,
});

// Mock analytics data
export const createMockAnalyticsData = (overrides = {}) => ({
  totalStudents: 1284,
  totalTeachers: 45,
  totalParents: 850,
  activeUsers: 1150,
  engagementRate: 85,
  revenueGrowth: 12.5,
  enrollmentGrowth: 8.3,
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

export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  return localStorageMock;
};

export const mockFetch = (responses: any[] = []) => {
  const fetchMock = jest.fn();
  
  responses.forEach((response, index) => {
    if (response instanceof Error) {
      fetchMock.mockRejectedValueOnce(response);
    } else {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => response,
        ...response,
      });
    }
  });

  global.fetch = fetchMock;
  return fetchMock;
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

export const expectAPICallToHaveBeenMade = (url: string, options = {}) => {
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(url),
    expect.objectContaining(options)
  );
};

export const expectLoadingStateToBeShown = (container: HTMLElement) => {
  expect(container.querySelector('[data-testid*="loading"], .loading, .spinner')).toBeInTheDocument();
};

export const expectErrorStateToBeShown = (container: HTMLElement) => {
  expect(container.querySelector('[data-testid*="error"], .error, .alert-error')).toBeInTheDocument();
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

// Utility for testing async operations
export const waitForAsyncOperations = () => {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
};

// AI-specific test utilities
export const createMockAIConversation = (messages: Array<{ role: 'user' | 'assistant', content: string }> = []) => ({
  id: generateTestId('conversation'),
  messages: messages.map((msg, index) => ({
    id: `msg-${index}`,
    ...msg,
    timestamp: new Date().toISOString(),
  })),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const simulateAITyping = async (duration = 1000) => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

// Form testing utilities
export const fillForm = async (fields: Record<string, string>, user: any) => {
  for (const [fieldName, value] of Object.entries(fields)) {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

export const submitForm = async (formTestId: string, user: any) => {
  const form = document.querySelector(`[data-testid="${formTestId}"]`);
  const submitButton = form?.querySelector('button[type="submit"]') || form?.querySelector('button:last-child');
  if (submitButton) {
    await user.click(submitButton);
  }
};
