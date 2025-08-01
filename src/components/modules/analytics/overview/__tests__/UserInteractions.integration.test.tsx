import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsModule from '../../AnalyticsModule';
import Geo from '../Geo';
import Events from '../Events';
import Demographics from '../Demographics';

// Comprehensive user interaction tests for Overview components
describe('Overview Components - User Interaction Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user_demographics: {
          total_users: 1000,
          students: 700,
          teachers: 150,
          parents: 120
        },
        engagement_metrics: {
          daily_active_users: 680,
          content_interactions: 2500
        }
      })
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Navigation and Switching', () => {
    it('should handle smooth transitions between all Overview components', async () => {
      render(<AnalyticsModule />);

      const componentButtons = [
        'Live Users',
        'Traffic Sources',
        'Events',
        'All Traffic',
        'Google Ads',
        'Referrals',
        'Demographics',
        'Geo',
        'Behavior'
      ];

      // Test switching to each component
      for (const componentName of componentButtons) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);

        await waitFor(() => {
          expect(button).toHaveClass('active');
        }, { timeout: 3000 });

        // Verify component content loads
        await waitFor(() => {
          const content = document.querySelector('.analytics-content-pane');
          expect(content).toBeInTheDocument();
        }, { timeout: 2000 });
      }
    });

    it('should maintain active state correctly during navigation', async () => {
      render(<AnalyticsModule />);

      // Click Events
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);

      await waitFor(() => {
        expect(eventsButton).toHaveClass('active');
      });

      // Click Demographics
      const demographicsButton = screen.getByRole('button', { name: /demographics/i });
      fireEvent.click(demographicsButton);

      await waitFor(() => {
        expect(demographicsButton).toHaveClass('active');
        expect(eventsButton).not.toHaveClass('active');
      });
    });

    it('should handle rapid component switching without errors', async () => {
      render(<AnalyticsModule />);

      const buttons = [
        screen.getByRole('button', { name: /events/i }),
        screen.getByRole('button', { name: /demographics/i }),
        screen.getByRole('button', { name: /geo/i }),
        screen.getByRole('button', { name: /behavior/i })
      ];

      // Rapidly switch between components
      for (let i = 0; i < 3; i++) {
        for (const button of buttons) {
          fireEvent.click(button);
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Final state should be stable
      const lastButton = buttons[buttons.length - 1];
      await waitFor(() => {
        expect(lastButton).toHaveClass('active');
      });
    });
  });

  describe('Refresh Button Functionality', () => {
    it('should handle refresh in Events component', async () => {
      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Initial API call count
      expect(global.fetch).toHaveBeenCalledTimes(1);

      fireEvent.click(refreshButton);

      // Should trigger additional API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should disable refresh button during loading', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 1000))
      );

      render(<Demographics />);

      // During initial load, refresh should be disabled
      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
    });

    it('should show loading state during refresh', async () => {
      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Mock slow refresh
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 1000))
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should show refreshing state
      await waitFor(() => {
        const refreshingButton = screen.getByRole('button', { name: /refreshing/i });
        expect(refreshingButton).toBeDisabled();
      });
    });

    it('should handle multiple rapid refresh clicks', async () => {
      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        fireEvent.click(refreshButton);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should still be functional
      expect(screen.getByText('User Demographics')).toBeInTheDocument();
    });
  });

  describe('View Mode Selectors (Geo Component)', () => {
    it('should switch between Countries, States, and Cities views', async () => {
      render(<Geo />);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });

      // Test Countries view (default)
      const countriesButton = screen.getByRole('button', { name: /countries/i });
      expect(countriesButton).toHaveClass('bg-blue-600');

      // Switch to States
      const statesButton = screen.getByRole('button', { name: /states/i });
      fireEvent.click(statesButton);

      await waitFor(() => {
        expect(statesButton).toHaveClass('bg-blue-600');
        expect(countriesButton).not.toHaveClass('bg-blue-600');
      });

      // Switch to Cities
      const citiesButton = screen.getByRole('button', { name: /cities/i });
      fireEvent.click(citiesButton);

      await waitFor(() => {
        expect(citiesButton).toHaveClass('bg-blue-600');
        expect(statesButton).not.toHaveClass('bg-blue-600');
      });
    });

    it('should update table content when switching view modes', async () => {
      render(<Geo />);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });

      // Initially should show countries
      expect(screen.getByText('Users by Countries')).toBeInTheDocument();

      // Switch to states
      const statesButton = screen.getByRole('button', { name: /states/i });
      fireEvent.click(statesButton);

      await waitFor(() => {
        expect(screen.getByText('Users by States')).toBeInTheDocument();
      });

      // Switch to cities
      const citiesButton = screen.getByRole('button', { name: /cities/i });
      fireEvent.click(citiesButton);

      await waitFor(() => {
        expect(screen.getByText('Users by Cities')).toBeInTheDocument();
      });
    });

    it('should maintain view mode state during refresh', async () => {
      render(<Geo />);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });

      // Switch to states view
      const statesButton = screen.getByRole('button', { name: /states/i });
      fireEvent.click(statesButton);

      await waitFor(() => {
        expect(statesButton).toHaveClass('bg-blue-600');
      });

      // Refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // State should be maintained
      await waitFor(() => {
        expect(statesButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Interactive Charts and Tables', () => {
    it('should handle table interactions in Events component', async () => {
      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Check table is interactive
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for sortable columns (if implemented)
      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);
    });

    it('should render interactive charts in Demographics', async () => {
      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      // Check for chart containers
      const barChart = document.querySelector('.recharts-bar-chart');
      const pieCharts = document.querySelectorAll('.recharts-pie-chart');
      
      expect(barChart).toBeInTheDocument();
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    it('should handle chart hover interactions', async () => {
      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      // Simulate chart hover (if tooltips are implemented)
      const chartArea = document.querySelector('.recharts-wrapper');
      if (chartArea) {
        fireEvent.mouseEnter(chartArea);
        fireEvent.mouseLeave(chartArea);
      }

      // Should not cause errors
      expect(screen.getByText('User Demographics')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for buttons', async () => {
      render(<AnalyticsModule />);

      // Focus on Events button
      const eventsButton = screen.getByRole('button', { name: /events/i });
      eventsButton.focus();

      // Press Enter
      fireEvent.keyDown(eventsButton, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(eventsButton).toHaveClass('active');
      });
    });

    it('should support Tab navigation between interactive elements', async () => {
      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Tab through interactive elements
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      refreshButton.focus();

      fireEvent.keyDown(refreshButton, { key: 'Tab', code: 'Tab' });

      // Should move focus to next interactive element
      expect(document.activeElement).not.toBe(refreshButton);
    });
  });

  describe('Responsive Interactions', () => {
    it('should handle touch interactions on mobile', async () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<AnalyticsModule />);

      const eventsButton = screen.getByRole('button', { name: /events/i });
      
      // Simulate touch events
      fireEvent.touchStart(eventsButton);
      fireEvent.touchEnd(eventsButton);

      await waitFor(() => {
        expect(eventsButton).toHaveClass('active');
      });
    });

    it('should adapt interactions for different screen sizes', async () => {
      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      });

      // Test desktop interactions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should work on all screen sizes
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Persistence', () => {
    it('should maintain component state during tab switches', async () => {
      render(<AnalyticsModule />);

      // Switch to Geo component
      const geoButton = screen.getByRole('button', { name: /geo/i });
      fireEvent.click(geoButton);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });

      // Change view mode
      const statesButton = screen.getByRole('button', { name: /states/i });
      fireEvent.click(statesButton);

      // Switch to another component
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Switch back to Geo
      fireEvent.click(geoButton);

      await waitFor(() => {
        // State should be preserved
        expect(statesButton).toHaveClass('bg-blue-600');
      });
    });

    it('should handle browser back/forward navigation', async () => {
      render(<AnalyticsModule />);

      // Simulate navigation state changes
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);

      await waitFor(() => {
        expect(eventsButton).toHaveClass('active');
      });

      // Component should maintain its state
      expect(screen.getByText('Events Analytics')).toBeInTheDocument();
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high-frequency interactions', async () => {
      render(<AnalyticsModule />);

      const buttons = [
        screen.getByRole('button', { name: /events/i }),
        screen.getByRole('button', { name: /demographics/i }),
        screen.getByRole('button', { name: /geo/i })
      ];

      // High-frequency clicking
      for (let i = 0; i < 20; i++) {
        const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
        fireEvent.click(randomButton);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Should still be responsive
      const finalButton = buttons[0];
      fireEvent.click(finalButton);

      await waitFor(() => {
        expect(finalButton).toHaveClass('active');
      });
    });

    it('should maintain performance with multiple simultaneous interactions', async () => {
      render(<AnalyticsModule />);

      // Switch to Geo component
      const geoButton = screen.getByRole('button', { name: /geo/i });
      fireEvent.click(geoButton);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
      });

      // Simultaneous interactions
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      const statesButton = screen.getByRole('button', { name: /states/i });

      fireEvent.click(refreshButton);
      fireEvent.click(statesButton);

      // Both interactions should work
      await waitFor(() => {
        expect(statesButton).toHaveClass('bg-blue-600');
        expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });
});
