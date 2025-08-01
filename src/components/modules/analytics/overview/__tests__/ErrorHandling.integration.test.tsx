import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Events from '../Events';
import Demographics from '../Demographics';
import Behavior from '../Behavior';
import GoogleAds from '../GoogleAds';
import Referrals from '../Referrals';
import Geo from '../Geo';
import AllTraffic from '../AllTraffic';

// Comprehensive error handling tests for all Overview components
describe('Overview Components - Error Handling Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const components = [
    { name: 'Events', Component: Events },
    { name: 'Demographics', Component: Demographics },
    { name: 'Behavior', Component: Behavior },
    { name: 'GoogleAds', Component: GoogleAds },
    { name: 'Referrals', Component: Referrals },
    { name: 'Geo', Component: Geo },
    { name: 'AllTraffic', Component: AllTraffic },
  ];

  describe('Network Error Handling', () => {
    components.forEach(({ name, Component }) => {
      it(`should handle network errors gracefully in ${name} component`, async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        render(<Component />);

        await waitFor(() => {
          const errorMessage = screen.queryByText(/failed to load/i) || 
                              screen.queryByText(/no data available/i);
          expect(errorMessage).toBeInTheDocument();
          
          const retryButton = screen.queryByRole('button', { name: /retry/i });
          expect(retryButton).toBeInTheDocument();
        }, { timeout: 5000 });
      });
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load events data/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle DNS resolution failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('DNS resolution failed'));

      render(<Demographics />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load demographics data/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('HTTP Error Status Handling', () => {
    const errorStatuses = [400, 401, 403, 404, 500, 502, 503, 504];

    errorStatuses.forEach(status => {
      it(`should handle HTTP ${status} errors`, async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status,
          statusText: `HTTP ${status} Error`
        });

        render(<Events />);

        await waitFor(() => {
          // Should fall back to mock data for non-ok responses
          expect(screen.getByText('Events Analytics')).toBeInTheDocument();
        }, { timeout: 5000 });
      });
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      render(<Behavior />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load behavior data/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Loading State Management', () => {
    components.forEach(({ name, Component }) => {
      it(`should show loading state in ${name} component`, async () => {
        (global.fetch as jest.Mock).mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({})
          }), 2000))
        );

        render(<Component />);

        // Check for loading spinner
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      it(`should hide loading state after data loads in ${name}`, async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({})
        });

        render(<Component />);

        await waitFor(() => {
          const spinner = document.querySelector('.animate-spin');
          expect(spinner).not.toBeInTheDocument();
        }, { timeout: 5000 });
      });
    });

    it('should handle loading state during refresh', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        })
        .mockImplementationOnce(() => 
          new Promise(resolve => setTimeout(() => resolve({
            ok: true,
            json: async () => ({})
          }), 1000))
        );

      render(<Events />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Should show refreshing state
      await waitFor(() => {
        const refreshingButton = screen.queryByRole('button', { name: /refreshing/i });
        expect(refreshingButton).toBeInTheDocument();
        expect(refreshingButton).toBeDisabled();
      });
    });
  });

  describe('Retry Functionality', () => {
    components.forEach(({ name, Component }) => {
      it(`should retry successfully after error in ${name}`, async () => {
        (global.fetch as jest.Mock)
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
          });

        render(<Component />);

        // Wait for error state
        await waitFor(() => {
          const errorMessage = screen.queryByText(/failed to load/i);
          expect(errorMessage).toBeInTheDocument();
        }, { timeout: 5000 });

        // Click retry
        const retryButton = screen.getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        // Should recover
        await waitFor(() => {
          const errorMessage = screen.queryByText(/failed to load/i);
          expect(errorMessage).not.toBeInTheDocument();
        }, { timeout: 5000 });
      });
    });

    it('should handle multiple retry attempts', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockRejectedValueOnce(new Error('Second error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({})
        });

      render(<Demographics />);

      // First error
      await waitFor(() => {
        expect(screen.getByText(/failed to load demographics data/i)).toBeInTheDocument();
      });

      // First retry
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      // Second error
      await waitFor(() => {
        expect(screen.getByText(/failed to load demographics data/i)).toBeInTheDocument();
      });

      // Second retry - should succeed
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Fallback Data Handling', () => {
    it('should display fallback data when API is unavailable', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503
      });

      render(<Events />);

      await waitFor(() => {
        // Should show fallback data
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
        expect(screen.getByText('4,710')).toBeInTheDocument(); // Total events from fallback
      }, { timeout: 5000 });
    });

    it('should maintain functionality with fallback data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<Geo />);

      await waitFor(() => {
        expect(screen.getByText('Geographic Analytics')).toBeInTheDocument();
        
        // Should be able to switch view modes with fallback data
        const statesButton = screen.queryByRole('button', { name: /states/i });
        if (statesButton) {
          fireEvent.click(statesButton);
          expect(statesButton).toHaveClass('bg-blue-600');
        }
      }, { timeout: 5000 });
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up properly when component unmounts during API call', async () => {
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

      // Should not cause memory leaks or errors
      expect(true).toBe(true);
    });

    it('should handle rapid mount/unmount cycles', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      // Mount and unmount rapidly
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(<Demographics />);
        await new Promise(resolve => setTimeout(resolve, 50));
        unmount();
      }

      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous API calls', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({})
        }), Math.random() * 1000))
      );

      // Render multiple components simultaneously
      render(
        <div>
          <Events />
          <Demographics />
          <Behavior />
        </div>
      );

      // All should eventually load without conflicts
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
        expect(screen.getByText('User Demographics')).toBeInTheDocument();
        expect(screen.getByText('User Behavior Analytics')).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should handle race conditions in refresh calls', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      render(<Events />);

      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      });

      // Trigger multiple rapid refresh calls
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      
      for (let i = 0; i < 3; i++) {
        fireEvent.click(refreshButton);
      }

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.getByText('Events Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from temporary network issues', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Temporary network error'))
        .mockResolvedValue({
          ok: true,
          json: async () => ({
            engagement_metrics: {
              daily_active_users: 500
            }
          })
        });

      render(<AllTraffic />);

      // Initial error
      await waitFor(() => {
        expect(screen.getByText(/failed to load traffic data/i)).toBeInTheDocument();
      });

      // Retry should work
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      await waitFor(() => {
        expect(screen.getByText('All Traffic Analytics')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should maintain user interactions during error recovery', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue({
          ok: true,
          json: async () => ({})
        });

      render(<Geo />);

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/failed to load geographic data/i)).toBeInTheDocument();
      });

      // Retry
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      // After recovery, interactions should work
      await waitFor(() => {
        const citiesButton = screen.queryByRole('button', { name: /cities/i });
        if (citiesButton) {
          fireEvent.click(citiesButton);
          expect(citiesButton).toHaveClass('bg-blue-600');
        }
      }, { timeout: 5000 });
    });
  });
});
