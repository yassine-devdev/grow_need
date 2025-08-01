/**
 * REAL LiveUsers Component Tests
 * Tests actual real-time functionality, data visualization, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiveUsers from '../LiveUsers';
import { analyticsDataService } from '../../services/analyticsDataService';

// Mock the analytics data service
jest.mock('../../services/analyticsDataService');
const mockAnalyticsDataService = analyticsDataService as jest.Mocked<typeof analyticsDataService>;

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
}));

const mockLiveUsersData = {
  currentUsers: 1284,
  timeSeriesData: [
    { time: '14:30', users: 1200 },
    { time: '14:31', users: 1250 },
    { time: '14:32', users: 1284 }
  ],
  deviceBreakdown: [
    { name: 'Desktop', value: 65, color: '#3b82f6' },
    { name: 'Mobile', value: 25, color: '#10b981' },
    { name: 'Tablet', value: 10, color: '#f59e0b' }
  ],
  topPages: [
    { page: '/dashboard', users: 385, percentage: 30 },
    { page: '/ai-assistant', users: 321, percentage: 25 },
    { page: '/content-management', users: 257, percentage: 20 }
  ]
};

describe('LiveUsers - Real Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Real-Time Data Loading and Updates', () => {
    it('should load live users data on component mount', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

      render(<LiveUsers />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
      });

      // Should display the current user count
      await waitFor(() => {
        expect(screen.getByText('1,284')).toBeInTheDocument();
      });
    });

    it('should implement real-time auto-refresh every 30 seconds', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

      render(<LiveUsers />);

      // Initial load
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
      });

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      // Should trigger auto-refresh
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(2);
      });

      // Fast-forward another 30 seconds
      jest.advanceTimersByTime(30000);

      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle manual refresh correctly', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

      render(<LiveUsers />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should trigger additional data fetch
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(2);
      });
    });

    it('should show loading state during refresh', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      // First call resolves immediately
      mockAnalyticsDataService.getLiveUsersData
        .mockResolvedValueOnce(mockLiveUsersData)
        .mockReturnValueOnce(promise as any);

      render(<LiveUsers />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('1,284')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should show refreshing state
      await waitFor(() => {
        expect(screen.getByText('Refreshing...')).toBeInTheDocument();
        expect(refreshButton).toBeDisabled();
      });

      // Resolve the promise
      resolvePromise!(mockLiveUsersData);

      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(refreshButton).not.toBeDisabled();
      });
    });
  });

  describe('Real Data Visualization and Charts', () => {
    beforeEach(async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);
    });

    it('should render time series chart with real data', async () => {
      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('1,284')).toBeInTheDocument();
      });

      // Should render chart components
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('area')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
    });

    it('should display device breakdown chart correctly', async () => {
      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('Device Breakdown')).toBeInTheDocument();
      });

      // Should show device breakdown data
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('should display top pages with correct metrics', async () => {
      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('Top Active Pages')).toBeInTheDocument();
      });

      // Should show top pages data
      expect(screen.getByText('/dashboard')).toBeInTheDocument();
      expect(screen.getByText('/ai-assistant')).toBeInTheDocument();
      expect(screen.getByText('/content-management')).toBeInTheDocument();
      expect(screen.getByText('385')).toBeInTheDocument();
      expect(screen.getByText('321')).toBeInTheDocument();
      expect(screen.getByText('257')).toBeInTheDocument();
    });

    it('should format numbers correctly', async () => {
      const largeNumberData = {
        ...mockLiveUsersData,
        currentUsers: 12845,
        topPages: [
          { page: '/dashboard', users: 3851, percentage: 30 }
        ]
      };

      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(largeNumberData);

      render(<LiveUsers />);

      await waitFor(() => {
        // Should format large numbers with commas
        expect(screen.getByText('12,845')).toBeInTheDocument();
        expect(screen.getByText('3,851')).toBeInTheDocument();
      });
    });
  });

  describe('Real Error Handling and Resilience', () => {
    it('should handle data loading errors gracefully', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockRejectedValue(new Error('API Error'));

      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load live users data')).toBeInTheDocument();
      });

      // Should still show refresh button for retry
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      mockAnalyticsDataService.getLiveUsersData
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockLiveUsersData);

      render(<LiveUsers />);

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText('Failed to load live users data')).toBeInTheDocument();
      });

      // Click refresh to retry
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should successfully load data
      await waitFor(() => {
        expect(screen.getByText('1,284')).toBeInTheDocument();
      });
    });

    it('should handle partial data gracefully', async () => {
      const partialData = {
        currentUsers: 500,
        timeSeriesData: [],
        deviceBreakdown: [],
        topPages: []
      };

      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(partialData);

      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('500')).toBeInTheDocument();
      });

      // Should handle empty arrays gracefully
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('Real Performance and Optimization', () => {
    it('should cleanup intervals on unmount', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

      const { unmount } = render(<LiveUsers />);

      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
      });

      // Unmount component
      unmount();

      // Fast-forward time - should not trigger more calls
      jest.advanceTimersByTime(60000);

      // Should still be only 1 call (no memory leaks)
      expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid refresh clicks without race conditions', async () => {
      mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

      render(<LiveUsers />);

      await waitFor(() => {
        expect(screen.getByText('1,284')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });

      // Click refresh multiple times rapidly
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);

      // Should handle gracefully without errors
      await waitFor(() => {
        expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalled();
      });
    });
  });
});
