/**
 * REAL Analytics Data Service Tests
 * Tests actual business logic, data transformation, and API integration
 */

import { analyticsDataService } from '../analyticsDataService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AnalyticsDataService - Real Business Logic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsDataService.clearCache();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real Data Processing and Transformation', () => {
    it('should correctly transform CRM API data to LiveUsersData format', async () => {
      const mockCRMResponse = {
        engagement_metrics: {
          daily_active_users: 1500,
          content_interactions: 3200
        },
        user_demographics: {
          total_users: 2000
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCRMResponse
      });

      const result = await analyticsDataService.getLiveUsersData();

      // Validate real business logic
      expect(result.currentUsers).toBe(1500);
      expect(result.timeSeriesData).toHaveLength(31); // 30 minutes + current
      expect(result.deviceBreakdown).toHaveLength(3);
      expect(result.topPages).toHaveLength(5);

      // Validate data transformation logic
      const totalDevicePercentage = result.deviceBreakdown.reduce((sum, device) => sum + device.value, 0);
      expect(totalDevicePercentage).toBe(100); // Should sum to 100%

      // Validate time series data generation
      result.timeSeriesData.forEach((point, index) => {
        expect(point.time).toMatch(/^\d{1,2}:\d{2}$/); // HH:MM format
        expect(point.users).toBeGreaterThan(1050); // 70% of 1500
        expect(point.users).toBeLessThan(1950); // 130% of 1500
        
        if (index > 0) {
          // Time should be chronological
          const currentTime = new Date(`2024-01-01 ${point.time}`);
          const previousTime = new Date(`2024-01-01 ${result.timeSeriesData[index - 1].time}`);
          expect(currentTime.getTime()).toBeGreaterThanOrEqual(previousTime.getTime());
        }
      });

      // Validate top pages calculation
      const totalPageUsers = result.topPages.reduce((sum, page) => sum + page.users, 0);
      expect(totalPageUsers).toBeLessThanOrEqual(result.currentUsers);
      
      result.topPages.forEach(page => {
        expect(page.percentage).toBeGreaterThan(0);
        expect(page.percentage).toBeLessThanOrEqual(100);
        expect(page.users).toBe(Math.floor(result.currentUsers * (page.percentage / 100)));
      });
    });

    it('should handle edge cases in data transformation', async () => {
      const edgeCaseData = {
        engagement_metrics: {
          daily_active_users: 0,
          content_interactions: 0
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => edgeCaseData
      });

      const result = await analyticsDataService.getLiveUsersData();

      expect(result.currentUsers).toBe(0);
      expect(result.timeSeriesData.every(point => point.users >= 0)).toBe(true);
      expect(result.topPages.every(page => page.users >= 0)).toBe(true);
    });

    it('should implement proper caching mechanism', async () => {
      const mockData = {
        engagement_metrics: { daily_active_users: 100 }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      // First call
      await analyticsDataService.getLiveUsersData();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call within cache period should use cache
      await analyticsDataService.getLiveUsersData();
      expect(fetch).toHaveBeenCalledTimes(1); // Still 1, used cache

      // Clear cache and call again
      analyticsDataService.clearCache();
      await analyticsDataService.getLiveUsersData();
      expect(fetch).toHaveBeenCalledTimes(2); // Now 2, cache was cleared
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network failures gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(analyticsDataService.getLiveUsersData()).rejects.toThrow('Network error');

      // Should log the error
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch /school-analytics:',
        expect.any(Error)
      );
    });

    it('should handle malformed API responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'data' })
      });

      const result = await analyticsDataService.getLiveUsersData();
      
      // Should handle missing data gracefully
      expect(result.currentUsers).toBe(0);
      expect(result.timeSeriesData).toHaveLength(31);
      expect(result.deviceBreakdown).toHaveLength(3);
      expect(result.topPages).toHaveLength(5);
    });

    it('should handle HTTP error responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(analyticsDataService.getLiveUsersData()).rejects.toThrow('HTTP 500: Internal Server Error');

      // Should log the error
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch /school-analytics:',
        expect.any(Error)
      );
    });
  });

  describe('Performance and Optimization', () => {
    it('should complete data processing within reasonable time', async () => {
      const mockData = {
        engagement_metrics: { daily_active_users: 10000 }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const startTime = performance.now();
      await analyticsDataService.getLiveUsersData();
      const endTime = performance.now();

      // Should complete within 100ms for data processing
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should generate consistent data for same input', async () => {
      const mockData = {
        engagement_metrics: { daily_active_users: 1000 }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      const result1 = await analyticsDataService.getLiveUsersData();
      analyticsDataService.clearCache();
      const result2 = await analyticsDataService.getLiveUsersData();

      // Core data should be consistent
      expect(result1.currentUsers).toBe(result2.currentUsers);
      expect(result1.deviceBreakdown).toEqual(result2.deviceBreakdown);
      expect(result1.topPages.map(p => ({ page: p.page, percentage: p.percentage })))
        .toEqual(result2.topPages.map(p => ({ page: p.page, percentage: p.percentage })));
    });
  });
});
