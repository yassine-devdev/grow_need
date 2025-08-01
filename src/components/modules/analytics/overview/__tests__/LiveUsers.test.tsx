/**
 * LiveUsers Component Tests
 * Testing real data integration and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiveUsers from '../LiveUsers';
import { analyticsDataService } from '../../services/analyticsDataService';

// Mock the analytics data service
jest.mock('../../services/analyticsDataService');

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart" className="recharts-wrapper">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container" className="recharts-wrapper">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart" className="recharts-wrapper">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Cell: () => <div data-testid="cell" />
}));

const mockAnalyticsDataService = analyticsDataService as jest.Mocked<typeof analyticsDataService>;

const mockLiveUsersData = {
  currentUsers: 1284,
  timeSeriesData: [
    { time: '10:00', users: 120 },
    { time: '10:01', users: 125 },
    { time: '10:02', users: 130 }
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

describe('LiveUsers Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockAnalyticsDataService.getLiveUsersData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<LiveUsers />);

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render live users data after successful fetch', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Live Users')).toBeInTheDocument();
    });

    expect(screen.getByText('1,284')).toBeInTheDocument();
    expect(screen.getByText('LIVE')).toBeInTheDocument();
    expect(screen.getByText('Device Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Users in last 30 minutes')).toBeInTheDocument();
    expect(screen.getByText('Top Active Pages')).toBeInTheDocument();
  });

  it('should display device breakdown correctly', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Device Breakdown')).toBeInTheDocument();
    });

    // Check for chart components (mocked) - there should be multiple responsive containers
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2); // One for device breakdown, one for time series
  });

  it('should display top pages with user counts and percentages', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('/dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('385')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('/ai-assistant')).toBeInTheDocument();
    expect(screen.getByText('321')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockRejectedValue(
      new Error('Failed to fetch data')
    );

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load live users data')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should allow manual refresh of data', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Live Users')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(2);
  });

  it('should retry data fetch when retry button is clicked', async () => {
    mockAnalyticsDataService.getLiveUsersData
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load live users data')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('1,284')).toBeInTheDocument();
    });

    expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(2);
  });

  it('should format large numbers with commas', async () => {
    const largeNumberData = {
      ...mockLiveUsersData,
      currentUsers: 12345,
      topPages: [
        { page: '/dashboard', users: 1234, percentage: 30 }
      ]
    };

    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(largeNumberData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should display current timestamp in header', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });

    // Check that timestamp is in reasonable format
    const timestampElement = screen.getByText(/Updated:/);
    expect(timestampElement.textContent).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);
  });

  it('should disable refresh button while loading', async () => {
    // First, let the component load normally
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText('Live Users')).toBeInTheDocument();
    });

    // Now set up a delayed promise for the refresh
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockAnalyticsDataService.getLiveUsersData.mockReturnValue(promise);

    // Click the refresh button
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Check that button is disabled and shows "Refreshing..."
    await waitFor(() => {
      const refreshingButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshingButton).toBeDisabled();
    });

    // Resolve the promise
    resolvePromise!(mockLiveUsersData);

    // Check that button is enabled again
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('should render chart components', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Live Users')).toBeInTheDocument();
    });

    // Check for chart containers (ResponsiveContainer creates these)
    const chartContainers = document.querySelectorAll('.recharts-wrapper');
    expect(chartContainers.length).toBeGreaterThan(0);
  });

  it('should handle empty data gracefully', async () => {
    const emptyData = {
      currentUsers: 0,
      timeSeriesData: [],
      deviceBreakdown: [],
      topPages: []
    };

    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(emptyData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    // Should still render the structure even with empty data
    expect(screen.getByText('Live Users')).toBeInTheDocument();
    expect(screen.getByText('Device Breakdown')).toBeInTheDocument();
  });

  it('should call analytics service on component mount', () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', async () => {
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    await waitFor(() => {
      expect(screen.getByText('Live Users')).toBeInTheDocument();
    });

    // Check for proper table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(3); // Page, Users, %

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should update data automatically every 30 seconds', async () => {
    jest.useFakeTimers();
    mockAnalyticsDataService.getLiveUsersData.mockResolvedValue(mockLiveUsersData);

    render(<LiveUsers />);

    // Initial call
    expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(1);

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(mockAnalyticsDataService.getLiveUsersData).toHaveBeenCalledTimes(2);
    });

    jest.useRealTimers();
  });
});
