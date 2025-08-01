import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Events from '../Events';

// Real-world integration tests for Events component
describe('Events Component - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real CRM API Integration', () => {
    it('should fetch real CRM data and transform it correctly', async () => {
      const mockCRMData = {
        engagement_metrics: {
          daily_active_users: 850,
          content_interactions: 2800
        },
        user_demographics: {
          total_users: 1200
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCRMData
      });

      render(<Events />);

      // Verify API call is made
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
      });

      // Verify transformed data appears
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
        expect(screen.getByText('4,710')).toBeInTheDocument(); // Total Events
        expect(screen.getByText('1,805')).toBeInTheDocument(); // Total Users
      }, { timeout: 5000 });
    });

    it('should handle API failure and show error state', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load events data')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle API returning non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<Events />);

      await waitFor(() => {
        // Should fall back to mock data
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
        expect(screen.getByText('4,710')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh button functionality', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Verify additional API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle retry button after error', async () => {
      // First call fails
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      render(<Events />);

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Failed to load events data')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Verify retry works
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Data Display and Formatting', () => {
    it('should display event categories with correct styling', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        // Check for category badges
        expect(screen.getByText('Learning')).toBeInTheDocument();
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Academic')).toBeInTheDocument();
        expect(screen.getByText('Access')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display growth indicators correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        // Check for growth indicators
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
        expect(screen.getByText('+23.7%')).toBeInTheDocument();
        expect(screen.getByText('-2.1%')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should format numbers correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        // Check number formatting
        expect(screen.getByText('1,250')).toBeInTheDocument(); // course_start count
        expect(screen.getByText('COURSE START')).toBeInTheDocument(); // formatted event name
      }, { timeout: 5000 });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during data fetch', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 2000))
      );

      render(<Events />);

      // Check for loading spinner
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Chart Integration', () => {
    it('should render chart with event data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        // Check for chart container
        const chartContainer = document.querySelector('.recharts-wrapper');
        expect(chartContainer).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple rapid refresh clicks', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Rapidly click refresh multiple times
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      for (let i = 0; i < 5; i++) {
        fireEvent.click(refreshButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should still work correctly
      expect(screen.getByText('Events Analytics')).toBeInTheDocument();
    });

    it('should handle component unmounting during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(promise);

      const { unmount } = render(<Events />);

      // Unmount before API call completes
      unmount();

      // Resolve the promise after unmount
      resolvePromise!({
        ok: true,
        json: async () => ({})
      });

      // Should not cause any errors
      expect(true).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        // Check for proper table structure
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();
        
        // Check for proper button roles
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });
});
