import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardModule from '../DashboardModule';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Recharts components to avoid canvas issues
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => null,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
}));

describe('DashboardModule', () => {
  beforeEach(() => {
    // Reset fetch mock
    (fetch as jest.Mock).mockClear();
  });

  it('renders without crashing', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        engagement_metrics: {
          daily_active_users: 1284,
          content_interactions: 42,
        },
      }),
    });

    await act(async () => {
      render(<DashboardModule />);
    });
    
    expect(screen.getByText('School Dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    // Mock API call to be slow
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({}),
      }), 100))
    );

    await act(async () => {
      render(<DashboardModule />);
    });
    
    // Should show loading state initially
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    // Mock failed API response
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(<DashboardModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });

  it('displays dashboard metrics when data is loaded', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        engagement_metrics: {
          daily_active_users: 1284,
          content_interactions: 42,
        },
      }),
    });

    await act(async () => {
      render(<DashboardModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('1,284')).toBeInTheDocument(); // Total Students
      expect(screen.getByText('$48.2k')).toBeInTheDocument(); // Revenue
    });
  });

  it('renders charts when data is available', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        engagement_metrics: {
          daily_active_users: 1284,
          content_interactions: 42,
        },
      }),
    });

    await act(async () => {
      render(<DashboardModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('handles retry button click', async () => {
    // Mock initial failed API response
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          engagement_metrics: {
            daily_active_users: 1284,
            content_interactions: 42,
          },
        }),
      });

    await act(async () => {
      render(<DashboardModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Retry');
    
    await act(async () => {
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('1,284')).toBeInTheDocument();
    });
  });

  it('displays all stat cards with correct labels', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        engagement_metrics: {
          daily_active_users: 1284,
          content_interactions: 42,
        },
      }),
    });

    await act(async () => {
      render(<DashboardModule />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('New Enrollments')).toBeInTheDocument();
      expect(screen.getByText('Active Courses')).toBeInTheDocument();
    });
  });
});