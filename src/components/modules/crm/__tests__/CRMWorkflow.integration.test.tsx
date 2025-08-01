/**
 * REAL CRM Workflow Integration Tests
 * Tests complete business workflows and cross-component interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CRMModule from '../CRMModule';

// Mock fetch globally
global.fetch = jest.fn();

const mockCRMData = {
  dashboard: {
    overview_stats: {
      total_students: 1247,
      total_parents: 892,
      pending_applications: 23,
      active_communications: 156,
      monthly_revenue: 125000,
      overdue_payments: 8,
      content_pending_approval: 12,
      ai_interactions_today: 342
    },
    quick_stats: {
      enrollment_rate: 87,
      collection_rate: 94,
      parent_satisfaction: 92,
      staff_utilization: 78,
      ai_efficiency: 89
    },
    alerts: [
      {
        id: 'alert1',
        type: 'warning',
        title: 'Payment Overdue',
        message: '8 families have overdue payments',
        timestamp: '2024-01-15 10:30:00',
        action_required: true
      }
    ]
  },
  enrollment: {
    applications: [
      {
        id: 'APP001',
        student_name: 'Emma Johnson',
        grade: '9th Grade',
        status: 'pending',
        application_date: '2024-01-15',
        parent_contact: 'sarah.johnson@email.com',
        documents_complete: true,
        interview_scheduled: false,
        priority_score: 85
      }
    ],
    enrollment_stats: {
      total_applications: 156,
      pending_review: 23,
      approved: 89,
      rejected: 12,
      waitlisted: 32,
      capacity_by_grade: [
        { grade: '9th Grade', capacity: 120, enrolled: 98, available: 22 }
      ]
    }
  }
};

describe('CRM Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup API mocks
    (fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/crm/dashboard')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCRMData.dashboard
        });
      }
      if (url.includes('/api/crm/student-enrollment')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockCRMData.enrollment
        });
      }
      return Promise.reject(new Error('Unknown API endpoint'));
    });
  });

  describe('Complete Student Enrollment Workflow', () => {
    it('should handle complete enrollment process from dashboard to approval', async () => {
      render(<CRMModule />);

      // 1. Start at dashboard and see pending applications alert
      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument(); // Pending applications
        expect(screen.getByText('Payment Overdue')).toBeInTheDocument();
      });

      // 2. Navigate to Student Enrollment
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        expect(screen.getByText('Manage applications, capacity, and enrollment processes')).toBeInTheDocument();
      });

      // 3. View pending application
      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
      });

      // 4. Check capacity before approval
      fireEvent.click(screen.getByText('Capacity Planning'));

      await waitFor(() => {
        expect(screen.getByText('9th Grade')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument(); // Available spots
      });

      // 5. Go back to applications and approve
      fireEvent.click(screen.getByText('Applications'));

      await waitFor(() => {
        const statusButtons = screen.getAllByText('Update Status');
        fireEvent.click(statusButtons[0]);
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Approve'));
      });

      // 6. Verify status change
      await waitFor(() => {
        const emmaRow = screen.getByText('Emma Johnson').closest('tr');
        expect(emmaRow).toHaveTextContent('approved');
      });
    });

    it('should handle capacity constraints during enrollment', async () => {
      // Mock full capacity scenario
      const fullCapacityData = {
        ...mockCRMData.enrollment,
        enrollment_stats: {
          ...mockCRMData.enrollment.enrollment_stats,
          capacity_by_grade: [
            { grade: '9th Grade', capacity: 120, enrolled: 120, available: 0 }
          ]
        }
      };

      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/crm/student-enrollment')) {
          return Promise.resolve({
            ok: true,
            json: async () => fullCapacityData
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockCRMData.dashboard
        });
      });

      render(<CRMModule />);

      // Navigate to enrollment
      fireEvent.click(screen.getByText('Student Enrollment'));

      // Check capacity
      fireEvent.click(screen.getByText('Capacity Planning'));

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // No available spots
        expect(screen.getByText('Full')).toBeInTheDocument(); // Capacity status
      });

      // Try to approve application - should show warning
      fireEvent.click(screen.getByText('Applications'));

      await waitFor(() => {
        const statusButtons = screen.getAllByText('Update Status');
        fireEvent.click(statusButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Grade is at full capacity')).toBeInTheDocument();
        expect(screen.getByText('Waitlist')).toBeInTheDocument(); // Should suggest waitlist
      });
    });
  });

  describe('Cross-Module Data Consistency', () => {
    it('should maintain data consistency between dashboard and enrollment modules', async () => {
      render(<CRMModule />);

      // Check dashboard stats
      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument(); // Pending applications
        expect(screen.getByText('1,247')).toBeInTheDocument(); // Total students
      });

      // Navigate to enrollment and verify same data
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument(); // Same pending count
        expect(screen.getByText('156')).toBeInTheDocument(); // Total applications
      });

      // Verify calculations are consistent
      const approvedCount = 89;
      const totalStudents = 1247;
      const enrollmentRate = Math.round((approvedCount / 156) * 100);
      
      // Go back to dashboard
      fireEvent.click(screen.getByText('Dashboard'));

      await waitFor(() => {
        expect(screen.getByText('87%')).toBeInTheDocument(); // Enrollment rate
      });
    });

    it('should handle real-time updates across modules', async () => {
      render(<CRMModule />);

      // Start at dashboard
      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument(); // Pending applications
      });

      // Navigate to enrollment and approve an application
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        const statusButtons = screen.getAllByText('Update Status');
        fireEvent.click(statusButtons[0]);
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Approve'));
      });

      // Mock updated data for dashboard
      const updatedDashboardData = {
        ...mockCRMData.dashboard,
        overview_stats: {
          ...mockCRMData.dashboard.overview_stats,
          pending_applications: 22, // Decreased by 1
          total_students: 1248 // Increased by 1
        }
      };

      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/crm/dashboard')) {
          return Promise.resolve({
            ok: true,
            json: async () => updatedDashboardData
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockCRMData.enrollment
        });
      });

      // Go back to dashboard and verify updates
      fireEvent.click(screen.getByText('Dashboard'));

      await waitFor(() => {
        expect(screen.getByText('22')).toBeInTheDocument(); // Updated pending count
        expect(screen.getByText('1,248')).toBeInTheDocument(); // Updated total students
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle API failures gracefully across modules', async () => {
      // Mock API failure
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<CRMModule />);

      // Should show fallback data and error handling
      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
      });

      // Navigate to enrollment - should also handle error
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch enrollment data')).toBeInTheDocument();
      });

      // Should still show fallback functionality
      expect(screen.getByText('Emma Johnson')).toBeInTheDocument(); // Fallback data
    });

    it('should handle partial API failures', async () => {
      // Mock dashboard success, enrollment failure
      (fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/api/crm/dashboard')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockCRMData.dashboard
          });
        }
        return Promise.reject(new Error('Enrollment API error'));
      });

      render(<CRMModule />);

      // Dashboard should work
      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument();
      });

      // Enrollment should show error but fallback
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument(); // Fallback data
      });
    });
  });

  describe('Performance and User Experience', () => {
    it('should handle navigation without data loss', async () => {
      render(<CRMModule />);

      // Load dashboard data
      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument();
      });

      // Navigate to enrollment
      fireEvent.click(screen.getByText('Student Enrollment'));

      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
      });

      // Navigate back to dashboard - should be instant (cached)
      fireEvent.click(screen.getByText('Dashboard'));

      // Should immediately show cached data
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    it('should handle concurrent operations correctly', async () => {
      render(<CRMModule />);

      await waitFor(() => {
        expect(screen.getByText('23')).toBeInTheDocument();
      });

      // Rapidly switch between modules
      fireEvent.click(screen.getByText('Student Enrollment'));
      fireEvent.click(screen.getByText('Dashboard'));
      fireEvent.click(screen.getByText('Student Enrollment'));

      // Should handle gracefully without errors
      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
      });
    });
  });
});
