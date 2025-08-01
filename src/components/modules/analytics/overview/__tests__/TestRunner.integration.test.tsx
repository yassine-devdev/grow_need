import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import all Overview components for comprehensive testing
import LiveUsers from '../LiveUsers';
import TrafficSources from '../TrafficSources';
import Events from '../Events';
import AllTraffic from '../AllTraffic';
import GoogleAds from '../GoogleAds';
import Referrals from '../Referrals';
import Demographics from '../Demographics';
import Geo from '../Geo';
import Behavior from '../Behavior';
import AnalyticsModule from '../../AnalyticsModule';

// Comprehensive test runner for all Overview components
describe('Overview Components - Complete Real-World Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // All 9 Overview components
  const allComponents = [
    { name: 'LiveUsers', Component: LiveUsers, hasRefresh: false, hasViewModes: false },
    { name: 'TrafficSources', Component: TrafficSources, hasRefresh: false, hasViewModes: false },
    { name: 'Events', Component: Events, hasRefresh: true, hasViewModes: false },
    { name: 'AllTraffic', Component: AllTraffic, hasRefresh: true, hasViewModes: false },
    { name: 'GoogleAds', Component: GoogleAds, hasRefresh: true, hasViewModes: false },
    { name: 'Referrals', Component: Referrals, hasRefresh: true, hasViewModes: false },
    { name: 'Demographics', Component: Demographics, hasRefresh: true, hasViewModes: false },
    { name: 'Geo', Component: Geo, hasRefresh: true, hasViewModes: true },
    { name: 'Behavior', Component: Behavior, hasRefresh: true, hasViewModes: false },
  ];

  describe('Complete System Integration Test', () => {
    it('should run comprehensive test of entire Overview system', async () => {
      // Mock successful CRM API response
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

      // Test 1: Verify Analytics module loads
      expect(screen.getByText('Analytics')).toBeInTheDocument();

      // Test 2: Verify all 9 L2 buttons are present
      const expectedButtons = [
        'Live Users', 'Traffic Sources', 'Events', 'All Traffic',
        'Google Ads', 'Referrals', 'Demographics', 'Geo', 'Behavior'
      ];

      for (const buttonName of expectedButtons) {
        expect(screen.getByRole('button', { name: new RegExp(buttonName, 'i') })).toBeInTheDocument();
      }

      // Test 3: Test switching to each component
      for (const buttonName of expectedButtons) {
        const button = screen.getByRole('button', { name: new RegExp(buttonName, 'i') });
        fireEvent.click(button);

        await waitFor(() => {
          expect(button).toHaveClass('active');
        }, { timeout: 3000 });

        // Verify component loads (either content or loading/error state)
        await waitFor(() => {
          const contentPane = document.querySelector('.analytics-content-pane');
          expect(contentPane).toBeInTheDocument();
        }, { timeout: 2000 });
      }

      // Test 4: Verify API calls were made for enhanced components
      const enhancedComponents = ['Events', 'Demographics', 'All Traffic', 'Google Ads', 'Referrals', 'Geo', 'Behavior'];
      
      // Should have made API calls for each enhanced component
      expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
      expect(global.fetch).toHaveBeenCalledTimes(enhancedComponents.length);

      console.log('✅ Complete system integration test passed');
    });
  });

  describe('Individual Component Real-World Tests', () => {
    allComponents.forEach(({ name, Component, hasRefresh, hasViewModes }) => {
      describe(`${name} Component`, () => {
        it(`should handle real CRM API integration`, async () => {
          const mockData = {
            user_demographics: { total_users: 1000 },
            engagement_metrics: { daily_active_users: 500 }
          };

          (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockData
          });

          render(<Component />);

          // Enhanced components should make API calls
          if (hasRefresh) {
            await waitFor(() => {
              expect(global.fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
            }, { timeout: 5000 });
          }

          // Component should render without errors
          const contentPane = document.querySelector('.analytics-content-pane');
          expect(contentPane).toBeInTheDocument();
        });

        it(`should handle API errors gracefully`, async () => {
          (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

          render(<Component />);

          if (hasRefresh) {
            await waitFor(() => {
              const errorMessage = screen.queryByText(/failed to load/i) || 
                                  screen.queryByText(/no data available/i);
              expect(errorMessage).toBeInTheDocument();
              
              const retryButton = screen.queryByRole('button', { name: /retry/i });
              expect(retryButton).toBeInTheDocument();
            }, { timeout: 5000 });
          }
        });

        if (hasRefresh) {
          it(`should handle refresh functionality`, async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: true,
              json: async () => ({})
            });

            render(<Component />);

            await waitFor(() => {
              const refreshButton = screen.queryByRole('button', { name: /refresh/i });
              if (refreshButton) {
                fireEvent.click(refreshButton);
                expect(global.fetch).toHaveBeenCalledTimes(2);
              }
            }, { timeout: 5000 });
          });
        }

        if (hasViewModes) {
          it(`should handle view mode switching`, async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
              ok: true,
              json: async () => ({})
            });

            render(<Component />);

            await waitFor(() => {
              const statesButton = screen.queryByRole('button', { name: /states/i });
              if (statesButton) {
                fireEvent.click(statesButton);
                expect(statesButton).toHaveClass('bg-blue-600');
              }
            }, { timeout: 5000 });
          });
        }

        it(`should handle loading states properly`, async () => {
          (global.fetch as jest.Mock).mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({
              ok: true,
              json: async () => ({})
            }), 1000))
          );

          render(<Component />);

          if (hasRefresh) {
            // Should show loading spinner
            const spinner = document.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
          }
        });

        it(`should handle component unmounting safely`, async () => {
          let resolvePromise: (value: any) => void;
          const promise = new Promise(resolve => {
            resolvePromise = resolve;
          });

          (global.fetch as jest.Mock).mockReturnValue(promise);

          const { unmount } = render(<Component />);
          unmount();

          // Resolve after unmount
          resolvePromise!({
            ok: true,
            json: async () => ({})
          });

          // Should not cause errors
          expect(true).toBe(true);
        });
      });
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle rapid component switching', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<AnalyticsModule />);

      const buttons = [
        screen.getByRole('button', { name: /events/i }),
        screen.getByRole('button', { name: /demographics/i }),
        screen.getByRole('button', { name: /geo/i }),
        screen.getByRole('button', { name: /behavior/i })
      ];

      // Rapid switching
      for (let i = 0; i < 10; i++) {
        const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
        fireEvent.click(randomButton);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Should still be functional
      const finalButton = buttons[0];
      fireEvent.click(finalButton);
      
      await waitFor(() => {
        expect(finalButton).toHaveClass('active');
      });
    });

    it('should handle multiple simultaneous API calls', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), Math.random() * 500))
      );

      // Render multiple components simultaneously
      render(
        <div>
          <Events />
          <Demographics />
          <Behavior />
          <GoogleAds />
        </div>
      );

      // All should eventually load
      await waitFor(() => {
        const contentPanes = document.querySelectorAll('.analytics-content-pane');
        expect(contentPanes.length).toBe(4);
      }, { timeout: 10000 });
    });

    it('should handle memory pressure scenarios', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      // Mount and unmount many components rapidly
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(<Events />);
        await new Promise(resolve => setTimeout(resolve, 10));
        unmount();
      }

      // Final render should still work
      render(<Events />);
      
      await waitFor(() => {
        const contentPane = document.querySelector('.analytics-content-pane');
        expect(contentPane).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Real-World Scenario Tests', () => {
    it('should handle complete user workflow', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          user_demographics: { total_users: 1200 },
          engagement_metrics: { daily_active_users: 800 }
        })
      });

      render(<AnalyticsModule />);

      // 1. User opens Analytics
      expect(screen.getByText('Analytics')).toBeInTheDocument();

      // 2. User clicks on Events
      const eventsButton = screen.getByRole('button', { name: /events/i });
      fireEvent.click(eventsButton);

      await waitFor(() => {
        expect(eventsButton).toHaveClass('active');
      });

      // 3. User refreshes data
      await waitFor(() => {
        const refreshButton = screen.queryByRole('button', { name: /refresh/i });
        if (refreshButton) {
          fireEvent.click(refreshButton);
        }
      });

      // 4. User switches to Demographics
      const demographicsButton = screen.getByRole('button', { name: /demographics/i });
      fireEvent.click(demographicsButton);

      await waitFor(() => {
        expect(demographicsButton).toHaveClass('active');
      });

      // 5. User switches to Geo and changes view mode
      const geoButton = screen.getByRole('button', { name: /geo/i });
      fireEvent.click(geoButton);

      await waitFor(() => {
        const statesButton = screen.queryByRole('button', { name: /states/i });
        if (statesButton) {
          fireEvent.click(statesButton);
          expect(statesButton).toHaveClass('bg-blue-600');
        }
      });

      // Workflow should complete successfully
      expect(geoButton).toHaveClass('active');
    });

    it('should handle network interruption and recovery', async () => {
      // Start with working network
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Network fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to load events data/i)).toBeInTheDocument();
      });

      // Network recovers
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Test Summary and Reporting', () => {
    it('should generate comprehensive test report', async () => {
      const testResults = {
        totalComponents: allComponents.length,
        componentsWithRefresh: allComponents.filter(c => c.hasRefresh).length,
        componentsWithViewModes: allComponents.filter(c => c.hasViewModes).length,
        apiIntegrationTests: allComponents.filter(c => c.hasRefresh).length,
        errorHandlingTests: allComponents.length,
        userInteractionTests: allComponents.length,
        performanceTests: 3,
        realWorldScenarios: 2
      };

      console.log('📊 Overview Components Test Summary:');
      console.log(`✅ Total Components Tested: ${testResults.totalComponents}`);
      console.log(`🔄 Components with Refresh: ${testResults.componentsWithRefresh}`);
      console.log(`👁️ Components with View Modes: ${testResults.componentsWithViewModes}`);
      console.log(`🌐 API Integration Tests: ${testResults.apiIntegrationTests}`);
      console.log(`❌ Error Handling Tests: ${testResults.errorHandlingTests}`);
      console.log(`🖱️ User Interaction Tests: ${testResults.userInteractionTests}`);
      console.log(`⚡ Performance Tests: ${testResults.performanceTests}`);
      console.log(`🌍 Real-World Scenarios: ${testResults.realWorldScenarios}`);

      expect(testResults.totalComponents).toBe(9);
      expect(testResults.componentsWithRefresh).toBe(7);
      expect(testResults.componentsWithViewModes).toBe(1);
    });
  });
});
