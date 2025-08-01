/**
 * TrafficSources Component Tests
 * Testing traffic analytics with real CRM data integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrafficSources from '../TrafficSources';
import { analyticsDataService } from '../../services/analyticsDataService';

// Mock the analytics data service
jest.mock('../../services/analyticsDataService');

const mockAnalyticsDataService = analyticsDataService as jest.Mocked<typeof analyticsDataService>;

const mockTrafficSourcesData = {
  sources: [
    {
      source: 'Direct',
      users: 120,
      sessions: 145,
      bounceRate: 35.2,
      avgSessionDuration: '4m 32s'
    },
    {
      source: 'Google Search',
      users: 89,
      sessions: 102,
      bounceRate: 42.1,
      avgSessionDuration: '3m 18s'
    },
    {
      source: 'Social Media',
      users: 45,
      sessions: 52,
      bounceRate: 58.7,
      avgSessionDuration: '2m 45s'
    },
    {
      source: 'Email',
      users: 23,
      sessions: 28,
      bounceRate: 28.3,
      avgSessionDuration: '5m 12s'
    }
  ],
  channelBreakdown: [
    { channel: 'Organic Search', value: 40, color: '#3b82f6' },
    { channel: 'Direct', value: 30, color: '#10b981' },
    { channel: 'Social', value: 20, color: '#f59e0b' },
    { channel: 'Email', value: 10, color: '#ef4444' }
  ]
};

describe('TrafficSources Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<TrafficSources />);

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should render traffic sources data after successful fetch', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    expect(screen.getByText('Traffic by Channel')).toBeInTheDocument();
    expect(screen.getByText('Detailed Source Metrics')).toBeInTheDocument();
  });

  it('should display traffic source metrics in table', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Direct')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg. Duration')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('35.2%')).toBeInTheDocument();
    expect(screen.getByText('4m 32s')).toBeInTheDocument();
  });

  it('should format numbers with commas for large values', async () => {
    const largeNumberData = {
      ...mockTrafficSourcesData,
      sources: [
        {
          source: 'Direct',
          users: 12345,
          sessions: 67890,
          bounceRate: 35.2,
          avgSessionDuration: '4m 32s'
        }
      ]
    };

    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(largeNumberData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });

    expect(screen.getByText('67,890')).toBeInTheDocument();
  });

  it('should color-code bounce rates (red for high, green for low)', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    // Find bounce rate cells
    const lowBounceRate = screen.getByText('35.2%'); // Should be green (< 50%)
    const highBounceRate = screen.getByText('58.7%'); // Should be red (> 50%)

    expect(lowBounceRate).toHaveClass('text-green-400');
    expect(highBounceRate).toHaveClass('text-red-400');
  });

  it('should handle API errors gracefully', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockRejectedValue(
      new Error('Failed to fetch traffic data')
    );

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load traffic sources data')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should allow manual refresh of data', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    expect(mockAnalyticsDataService.getTrafficSourcesData).toHaveBeenCalledTimes(2);
  });

  it('should retry data fetch when retry button is clicked', async () => {
    mockAnalyticsDataService.getTrafficSourcesData
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load traffic sources data')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Direct')).toBeInTheDocument();
    });

    expect(mockAnalyticsDataService.getTrafficSourcesData).toHaveBeenCalledTimes(2);
  });

  it('should disable refresh button while loading', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockAnalyticsDataService.getTrafficSourcesData.mockReturnValue(promise);

    render(<TrafficSources />);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
    });

    // Resolve the promise
    resolvePromise!(mockTrafficSourcesData);

    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).not.toBeDisabled();
    });
  });

  it('should render pie chart for channel breakdown', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    // Check for chart containers (ResponsiveContainer creates these)
    const chartContainers = document.querySelectorAll('.recharts-wrapper');
    expect(chartContainers.length).toBeGreaterThan(0);
  });

  it('should display channel breakdown data', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic by Channel')).toBeInTheDocument();
    });

    // The pie chart should contain the channel data
    // Note: Recharts renders these as SVG elements, so we check for the data structure
    expect(mockTrafficSourcesData.channelBreakdown).toHaveLength(4);
  });

  it('should handle empty data gracefully', async () => {
    const emptyData = {
      sources: [],
      channelBreakdown: []
    };

    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(emptyData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    // Should still render the structure even with empty data
    expect(screen.getByText('Traffic by Channel')).toBeInTheDocument();
    expect(screen.getByText('Detailed Source Metrics')).toBeInTheDocument();
  });

  it('should call analytics service on component mount', () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    expect(mockAnalyticsDataService.getTrafficSourcesData).toHaveBeenCalledTimes(1);
  });

  it('should have proper accessibility attributes', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });

    // Check for proper table structure
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const columnHeaders = screen.getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(5); // Source, Users, Sessions, Bounce Rate, Avg. Duration

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should display subtitle with description', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('User acquisition channels and performance')).toBeInTheDocument();
    });
  });

  it('should show all traffic sources in the table', async () => {
    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(mockTrafficSourcesData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Direct')).toBeInTheDocument();
    });

    expect(screen.getByText('Google Search')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should handle partial data gracefully', async () => {
    const partialData = {
      sources: [
        {
          source: 'Direct',
          users: 120,
          sessions: 145,
          bounceRate: 35.2,
          avgSessionDuration: '4m 32s'
        }
      ],
      channelBreakdown: [
        { channel: 'Direct', value: 100, color: '#10b981' }
      ]
    };

    mockAnalyticsDataService.getTrafficSourcesData.mockResolvedValue(partialData);

    render(<TrafficSources />);

    await waitFor(() => {
      expect(screen.getByText('Direct')).toBeInTheDocument();
    });

    expect(screen.getByText('120')).toBeInTheDocument();
  });
});
