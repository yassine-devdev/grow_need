import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentEnrollment from '../StudentEnrollment';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockEnrollmentData = {
  applications: [
    {
      id: 'APP001',
      student_name: 'Emma Johnson',
      grade: '9th Grade',
      status: 'pending' as const,
      application_date: '2024-01-15',
      parent_contact: 'sarah.johnson@email.com',
      documents_complete: true,
      interview_scheduled: false,
      priority_score: 85
    },
    {
      id: 'APP002',
      student_name: 'Michael Chen',
      grade: '10th Grade',
      status: 'approved' as const,
      application_date: '2024-01-12',
      parent_contact: 'david.chen@email.com',
      documents_complete: true,
      interview_scheduled: true,
      priority_score: 92
    }
  ],
  enrollment_stats: {
    total_applications: 156,
    pending_review: 23,
    approved: 89,
    rejected: 12,
    waitlisted: 32,
    capacity_by_grade: [
      { grade: '9th Grade', capacity: 120, enrolled: 98, available: 22 },
      { grade: '10th Grade', capacity: 115, enrolled: 102, available: 13 }
    ]
  },
  upcoming_deadlines: [
    {
      type: 'Application Deadline',
      date: '2024-02-15',
      description: 'Final deadline for fall semester applications',
      priority: 'high' as const
    }
  ]
};

describe('StudentEnrollment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering and Initial Load', () => {
    it('should render the component with correct header and navigation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });

      render(<StudentEnrollment />);

      // Check header elements
      expect(screen.getByText('Student Enrollment')).toBeInTheDocument();
      expect(screen.getByText('Manage applications, capacity, and enrollment processes')).toBeInTheDocument();

      // Check L2 navigation buttons
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('Capacity Planning')).toBeInTheDocument();
      expect(screen.getByText('Interviews')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument(); // Total applications
      });
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<StudentEnrollment />);

      expect(screen.getByText('Loading enrollment data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it('should handle API errors gracefully and show fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<StudentEnrollment />);

      await waitFor(() => {
        // Should show fallback data when API fails
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('156')).toBeInTheDocument(); // Total applications from fallback
      });
    });
  });

  describe('API Integration', () => {
    it('should make correct API call on component mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });

      render(<StudentEnrollment />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/student-enrollment');
      });
    });

    it('should handle successful API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });

      render(<StudentEnrollment />);

      await waitFor(() => {
        // Check if data is displayed correctly
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('156')).toBeInTheDocument(); // Total applications
        expect(screen.getByText('23')).toBeInTheDocument(); // Pending review
      });
    });

    it('should handle API failure and show fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<StudentEnrollment />);

      await waitFor(() => {
        // Should still show fallback data
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('156')).toBeInTheDocument();
      });
    });
  });

  describe('L2 Navigation Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should switch to Applications tab by default', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const applicationsTab = screen.getByText('Applications');
        expect(applicationsTab.closest('button')).toHaveClass('bg-blue-500/20');
      });
    });

    it('should switch to Capacity Planning tab when clicked', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const capacityTab = screen.getByText('Capacity Planning');
        fireEvent.click(capacityTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Capacity by Grade')).toBeInTheDocument();
        expect(screen.getByText('9th Grade')).toBeInTheDocument();
        expect(screen.getByText('98 enrolled / 120 capacity')).toBeInTheDocument();
      });
    });

    it('should show "Feature Coming Soon" for unimplemented tabs', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const interviewsTab = screen.getByText('Interviews');
        fireEvent.click(interviewsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Feature Coming Soon')).toBeInTheDocument();
        expect(screen.getByText('This section is under development')).toBeInTheDocument();
      });
    });
  });

  describe('Applications Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should display enrollment statistics correctly', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        expect(screen.getByText('156')).toBeInTheDocument(); // Total Applications
        expect(screen.getByText('23')).toBeInTheDocument(); // Pending Review
        expect(screen.getByText('89')).toBeInTheDocument(); // Approved
        expect(screen.getByText('32')).toBeInTheDocument(); // Waitlisted
        expect(screen.getByText('12')).toBeInTheDocument(); // Rejected
      });
    });

    it('should display applications table with correct data', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Grade')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Applied')).toBeInTheDocument();
        expect(screen.getByText('Documents')).toBeInTheDocument();
        expect(screen.getByText('Score')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Check application data
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('sarah.johnson@email.com')).toBeInTheDocument();
        expect(screen.getByText('9th Grade')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('2024-01-15')).toBeInTheDocument();
        expect(screen.getByText('85')).toBeInTheDocument();

        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('david.chen@email.com')).toBeInTheDocument();
        expect(screen.getByText('10th Grade')).toBeInTheDocument();
        expect(screen.getByText('Approved')).toBeInTheDocument();
        expect(screen.getByText('92')).toBeInTheDocument();
      });
    });

    it('should show correct status colors', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const pendingStatus = screen.getByText('Pending');
        const approvedStatus = screen.getByText('Approved');
        
        expect(pendingStatus).toHaveClass('text-yellow-400');
        expect(approvedStatus).toHaveClass('text-green-400');
      });
    });

    it('should display document completion status correctly', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Should show checkmarks for completed documents
        const checkIcons = screen.getAllByTestId('check-circle-icon');
        expect(checkIcons).toHaveLength(2); // Both applications have complete documents
      });
    });
  });

  describe('Capacity Planning Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should display capacity information correctly', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const capacityTab = screen.getByText('Capacity Planning');
        fireEvent.click(capacityTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Capacity by Grade')).toBeInTheDocument();
        expect(screen.getByText('9th Grade')).toBeInTheDocument();
        expect(screen.getByText('98 enrolled / 120 capacity')).toBeInTheDocument();
        expect(screen.getByText('22')).toBeInTheDocument(); // Available spots
        
        expect(screen.getByText('10th Grade')).toBeInTheDocument();
        expect(screen.getByText('102 enrolled / 115 capacity')).toBeInTheDocument();
        expect(screen.getByText('13')).toBeInTheDocument(); // Available spots
      });
    });

    it('should display upcoming deadlines', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const capacityTab = screen.getByText('Capacity Planning');
        fireEvent.click(capacityTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
        expect(screen.getByText('Application Deadline')).toBeInTheDocument();
        expect(screen.getByText('Final deadline for fall semester applications')).toBeInTheDocument();
        expect(screen.getByText('2024-02-15')).toBeInTheDocument();
        expect(screen.getByText('high')).toBeInTheDocument();
      });
    });

    it('should show capacity progress bars', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const capacityTab = screen.getByText('Capacity Planning');
        fireEvent.click(capacityTab);
      });

      await waitFor(() => {
        // Check for progress bars (they should have specific width styles)
        const progressBars = screen.getAllByRole('progressbar', { hidden: true });
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should handle New Application button click', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const newAppButton = screen.getByText('New Application');
        expect(newAppButton).toBeInTheDocument();
        
        fireEvent.click(newAppButton);
        // In a real implementation, this would open a modal or navigate to a form
      });
    });

    it('should handle action buttons in applications table', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Check for action buttons (view, edit, message)
        const actionButtons = screen.getAllByRole('button');
        const viewButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="eye-icon"]')
        );
        const editButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="edit-icon"]')
        );
        const messageButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="message-square-icon"]')
        );

        expect(viewButtons.length).toBeGreaterThan(0);
        expect(editButtons.length).toBeGreaterThan(0);
        expect(messageButtons.length).toBeGreaterThan(0);
      });
    });

    it('should handle retry button on error', async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<StudentEnrollment />);

      await waitFor(() => {
        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeInTheDocument();
      });

      // Mock successful retry
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      // Should reload the page (in real implementation)
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Data Display and Formatting', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should display priority scores with progress bars', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Check for priority score display
        expect(screen.getByText('85')).toBeInTheDocument();
        expect(screen.getByText('92')).toBeInTheDocument();
        
        // Check for progress bars
        const progressBars = screen.getAllByRole('progressbar', { hidden: true });
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });

    it('should show correct badge counts in navigation', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Applications tab should show count
        const applicationsTab = screen.getByText('Applications').closest('button');
        expect(applicationsTab).toHaveTextContent('156');
      });
    });

    it('should handle empty data gracefully', async () => {
      const emptyData = {
        applications: [],
        enrollment_stats: {
          total_applications: 0,
          pending_review: 0,
          approved: 0,
          rejected: 0,
          waitlisted: 0,
          capacity_by_grade: []
        },
        upcoming_deadlines: []
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyData,
      });

      render(<StudentEnrollment />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for stats
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEnrollmentData,
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        // Check for table structure
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        // Check for column headers
        const columnHeaders = screen.getAllByRole('columnheader');
        expect(columnHeaders.length).toBe(7);

        // Check for navigation buttons
        const navButtons = screen.getAllByRole('button');
        expect(navButtons.length).toBeGreaterThan(0);
      });
    });

    it('should handle keyboard navigation', async () => {
      render(<StudentEnrollment />);

      await waitFor(() => {
        const capacityTab = screen.getByText('Capacity Planning');
        
        // Simulate keyboard navigation
        capacityTab.focus();
        fireEvent.keyDown(capacityTab, { key: 'Enter' });
        
        // Should switch to capacity planning tab
        expect(screen.getByText('Enrollment Capacity by Grade')).toBeInTheDocument();
      });
    });
  });
});
