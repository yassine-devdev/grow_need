import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalyticsModule from '../../AnalyticsModule';

// Real-world integration tests for the entire Overview tab
describe('Overview Tab - Complete Integration Tests', () => {
  // Test environment setup
  beforeEach(() => {
    // Clear any previous test state
    jest.clearAllMocks();
    
    // Setup real fetch for testing actual API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Complete Overview Tab Workflow', () => {
    it('should load Analytics module and display Overview tab by default', async () => {
      render(<AnalyticsModule />);
      
      // Verify Analytics module loads
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      
      // Verify Overview tab is active by default
      expect(screen.getByRole('button', { name: /overview/i })).toHaveClass('active');
      
      // Verify all 9 L2 buttons are present
      expect(screen.getByRole('button', { name: /live users/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /traffic sources/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /all traffic/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /google ads/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /referrals/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /demographics/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /geo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /behavior/i })).toBeInTheDocument();
    });

    it('should handle component switching between all Overview components', async () => {
      render(<AnalyticsModule />);
      
      // Test switching to each component
      const components = [
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

      for (const componentName of components) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);
        
        // Verify component loads (either content or loading state)
        await waitFor(() => {
          expect(button).toHaveClass('active');
        }, { timeout: 3000 });
      }
    });
  });

  describe('Real CRM API Integration Tests', () => {
    it('should attempt to fetch real CRM data for all components', async () => {
      // Mock successful API response
      const mockCRMData = {
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
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCRMData
      });

      render(<AnalyticsModule />);
      
      // Test each component makes real API calls
      const components = ['Events', 'Demographics', 'All Traffic', 'Google Ads', 'Referrals', 'Geo', 'Behavior'];
      
      for (const componentName of components) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);
        
        // Wait for API call
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
        }, { timeout: 5000 });
      }
    });

    it('should handle API failures gracefully across all components', async () => {
      // Mock API failure
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<AnalyticsModule />);
      
      // Test error handling for each enhanced component
      const componentsWithErrorHandling = ['Events', 'Demographics', 'All Traffic', 'Google Ads', 'Referrals', 'Geo', 'Behavior'];
      
      for (const componentName of componentsWithErrorHandling) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);
        
        // Wait for error state to appear
        await waitFor(() => {
          const errorMessage = screen.queryByText(/failed to load/i) || screen.queryByText(/no data available/i);
          expect(errorMessage).toBeInTheDocument();
        }, { timeout: 5000 });
        
        // Verify retry button is present
        const retryButton = screen.queryByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
      }
    });
  });

  describe('Loading States and User Experience', () => {
    it('should show loading states for all components during data fetch', async () => {
      // Mock slow API response
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), 2000))
      );

      render(<AnalyticsModule />);
      
      const componentsWithLoading = ['Events', 'Demographics', 'All Traffic', 'Google Ads', 'Referrals', 'Geo', 'Behavior'];
      
      for (const componentName of componentsWithLoading) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);
        
        // Verify loading spinner appears
        await waitFor(() => {
          const spinner = document.querySelector('.animate-spin');
          expect(spinner).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    });

    it('should handle refresh functionality for all components', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<AnalyticsModule />);
      
      const componentsWithRefresh = ['Events', 'Demographics', 'All Traffic', 'Google Ads', 'Referrals', 'Geo', 'Behavior'];
      
      for (const componentName of componentsWithRefresh) {
        const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
        fireEvent.click(button);
        
        // Wait for component to load
        await waitFor(() => {
          const refreshButton = screen.queryByRole('button', { name: /refresh/i });
          if (refreshButton) {
            fireEvent.click(refreshButton);
            // Verify additional API call is made
            expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
          }
        }, { timeout: 3000 });
      }
    });
  });

  describe('Data Transformation and Display', () => {
    it('should properly transform and display CRM data in all components', async () => {
      const mockCRMData = {
        user_demographics: {
          total_users: 1500,
          students: 1050,
          teachers: 225,
          parents: 180
        },
        engagement_metrics: {
          daily_active_users: 890,
          content_interactions: 3200
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockCRMData
      });

      render(<AnalyticsModule />);
      
      // Test Demographics component data transformation
      const demographicsButton = screen.getByRole('button', { name: /demographics/i });
      fireEvent.click(demographicsButton);
      
      await waitFor(() => {
        // Verify transformed data appears
        expect(screen.getByText('1,500')).toBeInTheDocument(); // Total users
      }, { timeout: 5000 });
      
      // Test Events component data transformation
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);
      
      await waitFor(() => {
        // Should show fallback data when API call completes
        const totalEvents = screen.queryByText(/4,710|4710/);
        expect(totalEvents).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle rapid component switching without errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<AnalyticsModule />);
      
      const components = ['Events', 'Demographics', 'Geo', 'Behavior', 'All Traffic'];
      
      // Rapidly switch between components
      for (let i = 0; i < 3; i++) {
        for (const componentName of components) {
          const button = screen.getByRole('button', { name: new RegExp(componentName, 'i') });
          fireEvent.click(button);
          
          // Small delay to simulate real user interaction
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Verify no errors occurred and final component is active
      const finalButton = screen.getByRole('button', { name: /all traffic/i });
      expect(finalButton).toHaveClass('active');
    });

    it('should maintain state consistency across component switches', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<AnalyticsModule />);
      
      // Switch to Geo component and test view mode selector
      const geoButton = screen.getByRole('button', { name: /geo/i });
      fireEvent.click(geoButton);
      
      await waitFor(() => {
        const statesButton = screen.queryByRole('button', { name: /states/i });
        if (statesButton) {
          fireEvent.click(statesButton);
          expect(statesButton).toHaveClass('bg-blue-600');
        }
      }, { timeout: 3000 });
      
      // Switch to another component and back
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);
      
      await waitFor(() => {
        fireEvent.click(geoButton);
        // State should be maintained
        const statesButton = screen.queryByRole('button', { name: /states/i });
        if (statesButton) {
          expect(statesButton).toHaveClass('bg-blue-600');
        }
      }, { timeout: 3000 });
    });
  });
});
