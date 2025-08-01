/**
 * Analytics Data Service Tests
 * Comprehensive testing for real CRM data integration
 */

import { analyticsDataService } from '../analyticsDataService';

// Mock fetch globally
global.fetch = jest.fn();

describe('AnalyticsDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsDataService.clearCache();
  });

  describe('getLiveUsersData', () => {
    it('should fetch and transform live users data from CRM API', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 1284,
          content_interactions: 42
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await analyticsDataService.getLiveUsersData();

      expect(fetch).toHaveBeenCalledWith('/api/crm/school-analytics');
      expect(result.currentUsers).toBe(1284);
      expect(result.timeSeriesData).toHaveLength(31);
      expect(result.deviceBreakdown).toHaveLength(3);
      expect(result.topPages).toHaveLength(5);
      expect(result.topPages[0].page).toBe('/dashboard');
    });

    it('should return mock data when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await analyticsDataService.getLiveUsersData();

      expect(result.currentUsers).toBe(158);
      expect(result.timeSeriesData).toHaveLength(31);
      expect(result.deviceBreakdown).toHaveLength(3);
      expect(result.topPages).toHaveLength(5);
    });

    it('should use cached data when available', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 1284
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      // First call
      await analyticsDataService.getLiveUsersData();
      
      // Second call should use cache
      await analyticsDataService.getLiveUsersData();

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getTrafficSourcesData', () => {
    it('should fetch and transform traffic sources data', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 500
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await analyticsDataService.getTrafficSourcesData();

      expect(result.sources).toHaveLength(4);
      expect(result.channelBreakdown).toHaveLength(4);
      expect(result.sources[0].source).toBe('Direct');
      expect(result.sources[0].users).toBe(200); // 40% of 500
    });

    it('should return mock data when API fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const result = await analyticsDataService.getTrafficSourcesData();

      expect(result.sources).toHaveLength(4);
      expect(result.channelBreakdown).toHaveLength(4);
      expect(result.sources[0].source).toBe('Direct');
    });
  });

  describe('getUserDemographicsData', () => {
    it('should fetch and transform user demographics data', async () => {
      const mockApiResponse = {
        stats: {
          total_teachers: 50,
          total_students: 950
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await analyticsDataService.getUserDemographicsData();

      expect(result.ageGroups).toHaveLength(4);
      expect(result.genderBreakdown).toHaveLength(3);
      expect(result.locations).toHaveLength(5);
      expect(result.ageGroups[0].users).toBe(400); // 40% of 1000
    });
  });

  describe('getFinancialData', () => {
    it('should return financial data with revenue and expenses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await analyticsDataService.getFinancialData();

      expect(result.revenue.total).toBe(48200);
      expect(result.revenue.growth).toBe(8.5);
      expect(result.revenue.monthlyData).toHaveLength(5);
      expect(result.expenses.categories).toHaveLength(5);
      expect(result.expenses.total).toBe(39000);
    });
  });

  describe('getMarketingData', () => {
    it('should return marketing campaign and SEO data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      });

      const result = await analyticsDataService.getMarketingData();

      expect(result.campaigns).toHaveLength(4);
      expect(result.seoQueries).toHaveLength(4);
      expect(result.socialMetrics.followers).toBe(12500);
      expect(result.campaigns[0].name).toBe('Back to School 2024');
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await analyticsDataService.getLiveUsersData();

      // Should return mock data as fallback
      expect(result.currentUsers).toBe(158);
    });

    it('should handle network errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      const result = await analyticsDataService.getTrafficSourcesData();

      // Should return mock data as fallback
      expect(result.sources).toHaveLength(4);
    });
  });

  describe('Cache Management', () => {
    it('should cache responses for 5 minutes', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 1284
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      // First call
      const result1 = await analyticsDataService.getLiveUsersData();
      
      // Second call within cache timeout
      const result2 = await analyticsDataService.getLiveUsersData();

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should clear cache when requested', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 1284
        }
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse
      });

      // First call
      await analyticsDataService.getLiveUsersData();
      
      // Clear cache
      analyticsDataService.clearCache();
      
      // Second call should fetch again
      await analyticsDataService.getLiveUsersData();

      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Transformation', () => {
    it('should correctly calculate percentages for top pages', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 100
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await analyticsDataService.getLiveUsersData();

      const totalPercentage = result.topPages.reduce((sum, page) => sum + page.percentage, 0);
      expect(totalPercentage).toBe(100);
    });

    it('should generate realistic time series data', async () => {
      const mockApiResponse = {
        engagement_metrics: {
          daily_active_users: 200
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      });

      const result = await analyticsDataService.getLiveUsersData();

      // Check that time series data is within reasonable bounds
      result.timeSeriesData.forEach(point => {
        expect(point.users).toBeGreaterThan(140); // 70% of 200
        expect(point.users).toBeLessThan(320); // 130% of 200
        expect(point.time).toMatch(/^\d{1,2}:\d{2}$/); // HH:MM format
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should provide fresh data on each call when cache is expired', async () => {
      const mockApiResponse1 = {
        engagement_metrics: { daily_active_users: 100 }
      };
      const mockApiResponse2 = {
        engagement_metrics: { daily_active_users: 200 }
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse1
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockApiResponse2
        });

      const result1 = await analyticsDataService.getLiveUsersData();
      
      // Clear cache to simulate expiration
      analyticsDataService.clearCache();
      
      const result2 = await analyticsDataService.getLiveUsersData();

      expect(result1.currentUsers).toBe(100);
      expect(result2.currentUsers).toBe(200);
    });
  });
});
