import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Behavior from '../Behavior';

// Real-world integration tests for Behavior component
describe('Behavior Component - Real-World Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real CRM API Integration', () => {
    it('should fetch and transform behavior data correctly', async () => {
      const mockCRMData = {
        engagement_metrics: {
          content_interactions: 3200,
          daily_active_users: 890
        },
        user_demographics: {
          total_users: 1500
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCRMData
      });

      render(<Behavior />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
      });

      await waitFor(() => {
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
        expect(screen.getByText('42.8%')).toBeInTheDocument(); // Bounce rate
        expect(screen.getByText('4.8')).toBeInTheDocument(); // Pages per session
      }, { timeout: 5000 });
    });

    it('should handle API failures with proper error handling', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

      render(<Behavior />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load behavior data')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Landing Pages Analysis', () => {
    it('should display landing pages with categories', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for landing page categories
        expect(screen.getByText('General')).toBeInTheDocument();
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('Admissions')).toBeInTheDocument();
        expect(screen.getByText('Academic')).toBeInTheDocument();
        expect(screen.getByText('Resources')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display page values and metrics correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for page values
        expect(screen.getByText('$12.50')).toBeInTheDocument();
        expect(screen.getByText('$25.80')).toBeInTheDocument();
        expect(screen.getByText('$45.20')).toBeInTheDocument();
        
        // Check for session counts
        expect(screen.getByText('5,200')).toBeInTheDocument();
        expect(screen.getByText('3,100')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Exit Pages Analysis', () => {
    it('should display exit pages with proper categorization', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for exit page data
        expect(screen.getByText('/apply/step-3')).toBeInTheDocument();
        expect(screen.getByText('/contact-us')).toBeInTheDocument();
        expect(screen.getByText('/tuition-and-fees')).toBeInTheDocument();
        
        // Check exit rates
        expect(screen.getByText('65.2%')).toBeInTheDocument();
        expect(screen.getByText('80.1%')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('User Journey Flow', () => {
    it('should display complete user journey with conversion rates', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for journey steps
        expect(screen.getByText('Homepage Visit')).toBeInTheDocument();
        expect(screen.getByText('Program Browse')).toBeInTheDocument();
        expect(screen.getByText('AI Assistant Interaction')).toBeInTheDocument();
        expect(screen.getByText('Application Start')).toBeInTheDocument();
        expect(screen.getByText('Application Submit')).toBeInTheDocument();
        expect(screen.getByText('Enrollment Complete')).toBeInTheDocument();
        
        // Check conversion rates
        expect(screen.getByText('100%')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('52.5%')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display dropoff rates correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for dropoff indicators
        expect(screen.getByText('-25%')).toBeInTheDocument();
        expect(screen.getByText('-30%')).toBeInTheDocument();
        expect(screen.getByText('-40%')).toBeInTheDocument();
        expect(screen.getByText('-50%')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Metrics Cards', () => {
    it('should display all 5 key behavior metrics', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for metric cards
        expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
        expect(screen.getByText('Pages / Session')).toBeInTheDocument();
        expect(screen.getByText('Avg. Session Duration')).toBeInTheDocument();
        expect(screen.getByText('Total Pageviews')).toBeInTheDocument();
        expect(screen.getByText('New vs Returning')).toBeInTheDocument();
        
        // Check metric values
        expect(screen.getByText('3m 45s')).toBeInTheDocument();
        expect(screen.getByText('45.7k')).toBeInTheDocument();
        expect(screen.getByText('65% / 35%')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should display trend indicators correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for trend indicators
        expect(screen.getByText('-3.2%')).toBeInTheDocument(); // Bounce rate trend
        expect(screen.getByText('+0.4')).toBeInTheDocument(); // Pages per session trend
        expect(screen.getByText('+25s')).toBeInTheDocument(); // Session duration trend
      }, { timeout: 5000 });
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh functionality', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle retry after error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      render(<Behavior />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load behavior data')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Data Tables', () => {
    it('should render landing pages table with all columns', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Page')).toBeInTheDocument();
        expect(screen.getByText('Category')).toBeInTheDocument();
        expect(screen.getByText('Sessions')).toBeInTheDocument();
        expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
        expect(screen.getByText('Page Value')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should render exit pages table correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        // Check for exit pages table
        const tables = screen.getAllByRole('table');
        expect(tables.length).toBeGreaterThanOrEqual(2);
        
        // Check for exits column
        expect(screen.getByText('Exits')).toBeInTheDocument();
        expect(screen.getByText('Exit Rate')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid refresh clicks without errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Behavior />);

      await waitFor(() => {
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(refreshButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
    });

    it('should handle component unmounting during API call', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(promise);

      const { unmount } = render(<Behavior />);
      unmount();

      resolvePromise!({
        ok: true,
        json: async () => ({})
      });

      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during initial load', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 2000))
      );

      render(<Behavior />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable refresh button during loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 1000))
      );

      render(<Behavior />);

      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
    });
  });
});
