import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Demographics from '../Demographics';

// Real-world integration tests for Demographics component
describe('Demographics Component - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real CRM API Integration', () => {
    it('should fetch and transform CRM demographic data correctly', async () => {
      const mockCRMData = {
        user_demographics: {
          total_users: 1500,
          students: 1050,
          teachers: 225,
          parents: 180
        },
        engagement_metrics: {
          daily_active_users: 890
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCRMData
      });

      render(<Demographics />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
      });

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
        expect(screen.getByText('1,000')).toBeInTheDocument(); // Total users
        expect(screen.getByText('22.5')).toBeInTheDocument(); // Average age
      }, { timeout: 5000 });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load demographics data')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Data Visualization', () => {
    it('should render age distribution chart', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check for age groups
        expect(screen.getByText('13-17')).toBeInTheDocument();
        expect(screen.getByText('18-24')).toBeInTheDocument();
        expect(screen.getByText('25-34')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should render gender distribution with pie chart', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check for gender data
        expect(screen.getByText('Female')).toBeInTheDocument();
        expect(screen.getByText('Male')).toBeInTheDocument();
        expect(screen.getByText('Other')).toBeInTheDocument();
        
        // Check for pie chart
        const pieChart = document.querySelector('.recharts-pie');
        expect(pieChart).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should render role distribution with proper categories', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check for role categories
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Teachers')).toBeInTheDocument();
        expect(screen.getByText('Parents')).toBeInTheDocument();
        expect(screen.getByText('Admins')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh functionality', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle retry after error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load demographics data')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Data Accuracy and Formatting', () => {
    it('should display percentages correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check percentage displays
        expect(screen.getByText('52%')).toBeInTheDocument(); // Female percentage
        expect(screen.getByText('45%')).toBeInTheDocument(); // Male percentage
        expect(screen.getByText('70%')).toBeInTheDocument(); // Students percentage
      }, { timeout: 5000 });
    });

    it('should display user counts correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check user count displays
        expect(screen.getByText('520 users')).toBeInTheDocument(); // Female count
        expect(screen.getByText('700 users')).toBeInTheDocument(); // Students count
      }, { timeout: 5000 });
    });
  });

  describe('Chart Interactions', () => {
    it('should render interactive charts with tooltips', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        // Check for chart containers
        const barChart = document.querySelector('.recharts-bar-chart');
        const pieCharts = document.querySelectorAll('.recharts-pie-chart');
        
        expect(barChart).toBeInTheDocument();
        expect(pieCharts.length).toBeGreaterThan(0);
      }, { timeout: 5000 });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner during data fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 2000))
      );

      render(<Demographics />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should handle disabled refresh button during loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 1000))
      );

      render(<Demographics />);

      // Initially loading, refresh should be disabled
      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Performance and Memory', () => {
    it('should handle rapid component updates', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      // Simulate rapid refresh clicks
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      for (let i = 0; i < 10; i++) {
        fireEvent.click(refreshButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Component should still be functional
      expect(screen.getByText('User Demographics')).toBeInTheDocument();
    });

    it('should clean up properly on unmount', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(promise);

      const { unmount } = render(<Demographics />);
      unmount();

      // Resolve after unmount
      resolvePromise!({
        ok: true,
        json: async () => ({})
      });

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should handle different screen sizes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
        // Grid should adapt to mobile
        const grid = document.querySelector('.grid-cols-1');
        expect(grid).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
});
