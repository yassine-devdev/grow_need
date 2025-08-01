import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ParentPortal from '../ParentPortal';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockParentPortalData = {
  parent_accounts: [
    {
      id: 'PAR001',
      parent_name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      students: [
        { name: 'Emma Johnson', grade: '9th Grade', class: '9A' },
        { name: 'Jake Johnson', grade: '7th Grade', class: '7B' }
      ],
      last_login: '2024-01-20',
      account_status: 'active' as const,
      communication_preferences: {
        email: true,
        sms: true,
        app_notifications: false
      },
      engagement_score: 85
    },
    {
      id: 'PAR002',
      parent_name: 'David Chen',
      email: 'david.chen@email.com',
      phone: '+1 (555) 234-5678',
      students: [
        { name: 'Michael Chen', grade: '10th Grade', class: '10A' }
      ],
      last_login: '2024-01-19',
      account_status: 'active' as const,
      communication_preferences: {
        email: true,
        sms: false,
        app_notifications: true
      },
      engagement_score: 92
    }
  ],
  portal_stats: {
    total_parents: 245,
    active_users: 198,
    pending_activation: 47,
    monthly_logins: 1456,
    avg_engagement: 78
  },
  recent_activities: [
    {
      parent_name: 'Sarah Johnson',
      activity: 'Viewed grade report for Emma Johnson',
      timestamp: '2024-01-20 14:30',
      type: 'document' as const
    },
    {
      parent_name: 'David Chen',
      activity: 'Sent message to Math teacher',
      timestamp: '2024-01-20 13:45',
      type: 'message' as const
    }
  ],
  communication_logs: [
    {
      id: 'COM001',
      parent_name: 'Sarah Johnson',
      subject: 'Weekly Progress Report - Emma Johnson',
      type: 'email' as const,
      status: 'read' as const,
      sent_date: '2024-01-19'
    },
    {
      id: 'COM002',
      parent_name: 'David Chen',
      subject: 'Upcoming Parent-Teacher Conference',
      type: 'sms' as const,
      status: 'delivered' as const,
      sent_date: '2024-01-19'
    }
  ]
};

describe('ParentPortal Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering and Initial Load', () => {
    it('should render the component with correct header and navigation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });

      render(<ParentPortal />);

      // Check header elements
      expect(screen.getByText('Parent Portal')).toBeInTheDocument();
      expect(screen.getByText('Manage parent accounts, communications, and engagement')).toBeInTheDocument();

      // Check L2 navigation buttons
      expect(screen.getByText('Parent Accounts')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
      expect(screen.getByText('Engagement')).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
      expect(screen.getByText('Portal Settings')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('245')).toBeInTheDocument(); // Total parents
      });
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ParentPortal />);

      expect(screen.getByText('Loading parent portal data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<ParentPortal />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load parent portal data')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should make correct API call on component mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });

      render(<ParentPortal />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/parent-portal');
      });
    });

    it('should handle successful API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });

      render(<ParentPortal />);

      await waitFor(() => {
        // Check if data is displayed correctly
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('David Chen')).toBeInTheDocument();
        expect(screen.getByText('245')).toBeInTheDocument(); // Total parents
        expect(screen.getByText('198')).toBeInTheDocument(); // Active users
      });
    });

    it('should handle API failure and show fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ParentPortal />);

      await waitFor(() => {
        // Should still show fallback data
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('245')).toBeInTheDocument();
      });
    });
  });

  describe('L2 Navigation Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should switch to Parent Accounts tab by default', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const accountsTab = screen.getByText('Parent Accounts');
        expect(accountsTab.closest('button')).toHaveClass('bg-blue-500/20');
      });
    });

    it('should switch to Communications tab when clicked', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Communication Logs')).toBeInTheDocument();
        expect(screen.getByText('Weekly Progress Report - Emma Johnson')).toBeInTheDocument();
      });
    });

    it('should switch to Activities tab when clicked', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const activitiesTab = screen.getByText('Activities');
        fireEvent.click(activitiesTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Recent Parent Activities')).toBeInTheDocument();
        expect(screen.getByText('Viewed grade report for Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Sent message to Math teacher')).toBeInTheDocument();
      });
    });

    it('should show "Feature Coming Soon" for unimplemented tabs', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const engagementTab = screen.getByText('Engagement');
        fireEvent.click(engagementTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Feature Coming Soon')).toBeInTheDocument();
        expect(screen.getByText('This section is under development')).toBeInTheDocument();
      });
    });
  });

  describe('Parent Accounts Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should display portal statistics correctly', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        expect(screen.getByText('245')).toBeInTheDocument(); // Total Parents
        expect(screen.getByText('198')).toBeInTheDocument(); // Active Users
        expect(screen.getByText('47')).toBeInTheDocument(); // Pending Activation
        expect(screen.getByText('1456')).toBeInTheDocument(); // Monthly Logins
        expect(screen.getByText('78%')).toBeInTheDocument(); // Avg Engagement
      });
    });

    it('should display parent accounts table with correct data', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Last Login')).toBeInTheDocument();
        expect(screen.getByText('Engagement')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Check parent data
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('sarah.johnson@email.com')).toBeInTheDocument();
        expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('(9th Grade)')).toBeInTheDocument();
        expect(screen.getByText('Jake Johnson')).toBeInTheDocument();
        expect(screen.getByText('(7th Grade)')).toBeInTheDocument();
        expect(screen.getByText('2024-01-20')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();

        expect(screen.getByText('David Chen')).toBeInTheDocument();
        expect(screen.getByText('david.chen@email.com')).toBeInTheDocument();
        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('(10th Grade)')).toBeInTheDocument();
        expect(screen.getByText('92%')).toBeInTheDocument();
      });
    });

    it('should show correct status colors', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const activeStatuses = screen.getAllByText('Active');
        activeStatuses.forEach(status => {
          expect(status).toHaveClass('text-green-400');
        });
      });
    });

    it('should display engagement scores with progress bars', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        // Check for engagement score display
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('92%')).toBeInTheDocument();
        
        // Check for progress bars
        const progressBars = screen.getAllByRole('progressbar', { hidden: true });
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Communications Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should display communication logs correctly', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Communication Logs')).toBeInTheDocument();
        expect(screen.getByText('Weekly Progress Report - Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Upcoming Parent-Teacher Conference')).toBeInTheDocument();
        expect(screen.getByText('EMAIL')).toBeInTheDocument();
        expect(screen.getByText('SMS')).toBeInTheDocument();
        expect(screen.getByText('Read')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
      });
    });

    it('should show correct communication status colors', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });

      await waitFor(() => {
        const readStatus = screen.getByText('Read');
        const deliveredStatus = screen.getByText('Delivered');
        
        expect(readStatus).toHaveClass('text-green-400');
        expect(deliveredStatus).toHaveClass('text-blue-400');
      });
    });
  });

  describe('Activities Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should display recent activities correctly', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const activitiesTab = screen.getByText('Activities');
        fireEvent.click(activitiesTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Recent Parent Activities')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('Viewed grade report for Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('2024-01-20 14:30')).toBeInTheDocument();
        
        expect(screen.getByText('David Chen')).toBeInTheDocument();
        expect(screen.getByText('Sent message to Math teacher')).toBeInTheDocument();
        expect(screen.getByText('2024-01-20 13:45')).toBeInTheDocument();
      });
    });

    it('should show correct activity icons', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const activitiesTab = screen.getByText('Activities');
        fireEvent.click(activitiesTab);
      });

      await waitFor(() => {
        // Check for activity icons (document and message icons)
        const documentIcons = screen.getAllByTestId('file-text-icon');
        const messageIcons = screen.getAllByTestId('message-square-icon');
        
        expect(documentIcons.length).toBeGreaterThan(0);
        expect(messageIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should handle Add Parent button click', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const addParentButton = screen.getByText('Add Parent');
        expect(addParentButton).toBeInTheDocument();
        
        fireEvent.click(addParentButton);
        // In a real implementation, this would open a modal or navigate to a form
      });
    });

    it('should handle Send Invites button click', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const sendInvitesButton = screen.getByText('Send Invites');
        expect(sendInvitesButton).toBeInTheDocument();
        
        fireEvent.click(sendInvitesButton);
        // In a real implementation, this would trigger invite sending
      });
    });

    it('should handle New Message button click in communications tab', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });

      await waitFor(() => {
        const newMessageButton = screen.getByText('New Message');
        expect(newMessageButton).toBeInTheDocument();
        
        fireEvent.click(newMessageButton);
        // In a real implementation, this would open a message composer
      });
    });

    it('should handle action buttons in parent accounts table', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        // Check for action buttons (view, edit, message, settings)
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
        const settingsButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="settings-icon"]')
        );

        expect(viewButtons.length).toBeGreaterThan(0);
        expect(editButtons.length).toBeGreaterThan(0);
        expect(messageButtons.length).toBeGreaterThan(0);
        expect(settingsButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Display and Formatting', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should display multiple students per parent correctly', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        // Sarah Johnson has 2 students
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Jake Johnson')).toBeInTheDocument();
        expect(screen.getByText('(9th Grade)')).toBeInTheDocument();
        expect(screen.getByText('(7th Grade)')).toBeInTheDocument();
        
        // David Chen has 1 student
        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('(10th Grade)')).toBeInTheDocument();
      });
    });

    it('should show correct badge counts in navigation', async () => {
      render(<ParentPortal />);

      await waitFor(() => {
        // Parent Accounts tab should show count
        const accountsTab = screen.getByText('Parent Accounts').closest('button');
        expect(accountsTab).toHaveTextContent('245');
        
        // Communications tab should show count
        const communicationsTab = screen.getByText('Communications').closest('button');
        expect(communicationsTab).toHaveTextContent('2');
        
        // Activities tab should show count
        const activitiesTab = screen.getByText('Activities').closest('button');
        expect(activitiesTab).toHaveTextContent('2');
      });
    });

    it('should handle empty data gracefully', async () => {
      const emptyData = {
        parent_accounts: [],
        portal_stats: {
          total_parents: 0,
          active_users: 0,
          pending_activation: 0,
          monthly_logins: 0,
          avg_engagement: 0
        },
        recent_activities: [],
        communication_logs: []
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyData,
      });

      render(<ParentPortal />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for stats
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockParentPortalData,
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<ParentPortal />);

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
      render(<ParentPortal />);

      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        
        // Simulate keyboard navigation
        communicationsTab.focus();
        fireEvent.keyDown(communicationsTab, { key: 'Enter' });
        
        // Should switch to communications tab
        expect(screen.getByText('Communication Logs')).toBeInTheDocument();
      });
    });
  });
});
