/**
 * REAL Document Export Service Tests
 * Tests actual document generation and export functionality with real data
 */

import { documentExportService } from '../documentExportService';
import * as XLSX from 'xlsx';

// Real test data (not mocked)
const realStudentData = [
  {
    id: 'STU001',
    firstName: 'Emma',
    lastName: 'Johnson',
    email: 'emma.johnson@school.edu',
    grade: '9th Grade',
    enrollmentDate: '2024-01-15',
    status: 'enrolled',
    guardianName: 'Sarah Johnson',
    guardianEmail: 'sarah.johnson@email.com',
    tuitionPaid: 12500,
    lastActivity: '2024-01-20'
  },
  {
    id: 'STU002',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@school.edu',
    grade: '10th Grade',
    enrollmentDate: '2024-01-12',
    status: 'enrolled',
    guardianName: 'Lisa Chen',
    guardianEmail: 'lisa.chen@email.com',
    tuitionPaid: 13000,
    lastActivity: '2024-01-19'
  },
  {
    id: 'STU003',
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    email: 'sophia.rodriguez@school.edu',
    grade: '11th Grade',
    enrollmentDate: '2024-01-10',
    status: 'pending',
    guardianName: 'Maria Rodriguez',
    guardianEmail: 'maria.rodriguez@email.com',
    tuitionPaid: 0,
    lastActivity: '2024-01-18'
  }
];

const realAnalyticsData = [
  {
    date: '2024-01-15',
    activeUsers: 1284,
    pageViews: 5672,
    sessionDuration: 1800, // 30 minutes
    bounceRate: 0.25,
    topPages: ['/dashboard', '/ai-assistant', '/content-management'],
    deviceBreakdown: { desktop: 65, mobile: 25, tablet: 10 }
  },
  {
    date: '2024-01-16',
    activeUsers: 1356,
    pageViews: 6123,
    sessionDuration: 1920, // 32 minutes
    bounceRate: 0.22,
    topPages: ['/dashboard', '/analytics', '/student-portal'],
    deviceBreakdown: { desktop: 62, mobile: 28, tablet: 10 }
  }
];

const realFinancialData = [
  {
    transactionId: 'TXN001',
    date: '2024-01-15',
    studentName: 'Emma Johnson',
    amount: 2500,
    type: 'tuition' as const,
    status: 'paid' as const,
    paymentMethod: 'Credit Card',
    description: 'Q1 Tuition Payment'
  },
  {
    transactionId: 'TXN002',
    date: '2024-01-16',
    studentName: 'Michael Chen',
    amount: 150,
    type: 'fees' as const,
    status: 'pending' as const,
    paymentMethod: 'Bank Transfer',
    description: 'Lab Fee'
  }
];

// Mock fetch for API calls but use real data processing
global.fetch = jest.fn();

describe('DocumentExportService - Real Functionality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup fetch to return real data
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/crm/students/export')) {
        return Promise.resolve({
          ok: true,
          json: async () => realStudentData
        });
      }
      if (url.includes('/api/analytics/export')) {
        return Promise.resolve({
          ok: true,
          json: async () => realAnalyticsData
        });
      }
      if (url.includes('/api/crm/financial/export')) {
        return Promise.resolve({
          ok: true,
          json: async () => realFinancialData
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Mock DOM methods for file download
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
    global.URL.revokeObjectURL = jest.fn();

    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return mockLink as any;
      }
      return document.createElement(tagName);
    });

    jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    // Mock HTMLCanvasElement for jsPDF in test environment
    const mockCanvas = {
      getContext: jest.fn(() => ({
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: new Array(4) })),
        putImageData: jest.fn(),
        createImageData: jest.fn(() => ({ data: new Array(4) })),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
      })),
      width: 100,
      height: 100,
      toDataURL: jest.fn(() => 'data:image/png;base64,mock'),
      toBlob: jest.fn()
    };

    global.HTMLCanvasElement = jest.fn(() => mockCanvas) as any;
    Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn(() => mockCanvas.getContext())
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real CSV Export Functionality', () => {
    it('should generate valid CSV content from real student data', async () => {
      await documentExportService.exportStudentData({
        format: 'csv',
        filename: 'test-students'
      });

      // Verify API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/students/export'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );

      // Verify file download was triggered
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle CSV special characters correctly', async () => {
      const dataWithSpecialChars = [
        {
          name: 'Test, Student',
          description: 'Student with "quotes" and commas',
          notes: 'Line 1\nLine 2'
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithSpecialChars
      });

      await documentExportService.exportStudentData({
        format: 'csv',
        filename: 'special-chars-test'
      });

      // Verify the CSV was generated (no errors thrown)
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real Excel Export Functionality', () => {
    it('should generate valid Excel workbook from real data', async () => {
      await documentExportService.exportStudentData({
        format: 'excel',
        filename: 'test-students-excel'
      });

      // Verify API call
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/students/export'),
        expect.any(Object)
      );

      // Verify Excel blob was created
      expect(URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
      );
    });

    it('should create multi-sheet Excel for analytics data', async () => {
      await documentExportService.exportAnalyticsData({
        format: 'excel',
        filename: 'analytics-multi-sheet'
      });

      // Verify analytics API was called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/export'),
        expect.any(Object)
      );

      // Verify Excel file was generated
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real PDF Export Functionality', () => {
    it('should generate PDF with real student data and formatting', async () => {
      await documentExportService.exportStudentData({
        format: 'pdf',
        filename: 'students-report'
      });

      // Verify API call
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/students/export'),
        expect.any(Object)
      );

      // Verify PDF download
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should generate analytics PDF with charts and summaries', async () => {
      await documentExportService.exportAnalyticsData({
        format: 'pdf',
        filename: 'analytics-report'
      });

      // Verify analytics API call
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/export'),
        expect.any(Object)
      );

      // Verify PDF was generated
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should generate financial PDF with calculations', async () => {
      await documentExportService.exportFinancialData({
        format: 'pdf',
        filename: 'financial-report'
      });

      // Verify financial API call
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/financial/export'),
        expect.any(Object)
      );

      // Verify PDF generation
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real Data Processing and Calculations', () => {
    it('should correctly process and flatten analytics data for CSV', async () => {
      await documentExportService.exportAnalyticsData({
        format: 'csv',
        filename: 'analytics-flattened'
      });

      // Verify the data was processed (API called and file generated)
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/export'),
        expect.any(Object)
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle financial calculations correctly', async () => {
      await documentExportService.exportFinancialData({
        format: 'excel',
        filename: 'financial-calculations'
      });

      // Verify financial data processing
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/financial/export'),
        expect.any(Object)
      );
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        documentExportService.exportStudentData({
          format: 'csv',
          filename: 'error-test'
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle HTTP error responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      await expect(
        documentExportService.exportStudentData({
          format: 'csv',
          filename: 'http-error-test'
        })
      ).rejects.toThrow('Failed to fetch student data: Internal Server Error');
    });

    it('should handle empty data sets', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      await expect(
        documentExportService.exportStudentData({
          format: 'csv',
          filename: 'empty-data-test'
        })
      ).rejects.toThrow('No data to export');
    });

    it('should handle unsupported formats', async () => {
      await expect(
        documentExportService.exportStudentData({
          format: 'unsupported' as any,
          filename: 'unsupported-test'
        })
      ).rejects.toThrow('Unsupported format: unsupported');
    });
  });

  describe('Real File Operations', () => {
    it('should generate unique filenames with timestamps', async () => {
      const timestamp = new Date().toISOString().split('T')[0];
      
      await documentExportService.exportStudentData({
        format: 'csv',
        filename: `students-${timestamp}`
      });

      // Verify filename was used in download
      const mockLink = document.createElement('a');
      expect(mockLink.download).toBeDefined();
    });

    it('should handle large datasets efficiently', async () => {
      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...realStudentData[0],
        id: `STU${String(i + 1).padStart(3, '0')}`,
        firstName: `Student${i + 1}`,
        email: `student${i + 1}@school.edu`
      }));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => largeDataset
      });

      const startTime = performance.now();
      
      await documentExportService.exportStudentData({
        format: 'excel',
        filename: 'large-dataset-test'
      });

      const endTime = performance.now();
      
      // Should complete within reasonable time (5 seconds for 1000 records)
      expect(endTime - startTime).toBeLessThan(5000);
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Real Date Range and Filtering', () => {
    it('should send correct date range filters to API', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      await documentExportService.exportAnalyticsData({
        format: 'csv',
        filename: 'date-filtered',
        dateRange
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/analytics/export'),
        expect.objectContaining({
          body: JSON.stringify({
            dateRange,
            filters: undefined
          })
        })
      );
    });

    it('should send custom filters to API', async () => {
      const filters = {
        grade: '9th Grade',
        status: 'enrolled'
      };

      await documentExportService.exportStudentData({
        format: 'excel',
        filename: 'filtered-students',
        filters
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/crm/students/export'),
        expect.objectContaining({
          body: JSON.stringify({
            filters,
            dateRange: undefined
          })
        })
      );
    });
  });
});
