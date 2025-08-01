import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunicationCenter from '../CommunicationCenter';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockCommunicationData = {
  messages: [
    {
      id: 'MSG001',
      sender: 'Principal Office',
      recipient: 'All Parents - Grade 9',
      subject: 'Parent-Teacher Conference Schedule',
      message: 'Dear parents, we are pleased to announce the upcoming parent-teacher conferences...',
      timestamp: '2024-01-20 14:30',
      type: 'email' as const,
      status: 'delivered' as const,
      priority: 'high' as const,
      category: 'academic' as const
    },
    {
      id: 'MSG002',
      sender: 'School Nurse',
      recipient: 'Emergency Contacts',
      subject: 'Health Alert: Flu Season Precautions',
      message: 'Important health information regarding flu prevention measures...',
      timestamp: '2024-01-20 13:15',
      type: 'notification' as const,
      status: 'sent' as const,
      priority: 'medium' as const,
      category: 'administrative' as const
    }
  ],
  templates: [
    {
      id: 'TPL001',
      name: 'Weekly Progress Report',
      subject: 'Weekly Progress Report - {{student_name}}',
      content: 'Dear {{parent_name}}, here is the weekly progress report for {{student_name}}...',
      type: 'email' as const,
      category: 'academic',
      usage_count: 45,
      last_used: '2024-01-19'
    },
    {
      id: 'TPL002',
      name: 'Event Reminder',
      subject: 'Reminder: {{event_name}}',
      content: 'This is a reminder about the upcoming {{event_name}} on {{event_date}}...',
      type: 'sms' as const,
      category: 'event',
      usage_count: 23,
      last_used: '2024-01-18'
    }
  ],
  campaigns: [
    {
      id: 'CAM001',
      name: 'Spring Enrollment Campaign',
      type: 'email' as const,
      status: 'completed' as const,
      recipients: 500,
      sent: 500,
      delivered: 485,
      opened: 342,
      clicked: 89,
      scheduled_date: '2024-01-15'
    },
    {
      id: 'CAM002',
      name: 'Parent Survey 2024',
      type: 'mixed' as const,
      status: 'sending' as const,
      recipients: 300,
      sent: 180,
      delivered: 175,
      opened: 98,
      clicked: 23,
      scheduled_date: '2024-01-20'
    }
  ],
  stats: {
    total_messages: 1247,
    messages_today: 23,
    delivery_rate: 97.2,
    open_rate: 68.5,
    response_rate: 12.3
  }
};

describe('CommunicationCenter Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering and Initial Load', () => {
    it('should render the component with correct header and navigation', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });

      render(<CommunicationCenter />);

      // Check header elements
      expect(screen.getByText('Communication Center')).toBeInTheDocument();
      expect(screen.getByText('Manage messages, templates, and communication campaigns')).toBeInTheDocument();

      // Check L2 navigation buttons
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Automation')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('1247')).toBeInTheDocument(); // Total messages
      });
    });

    it('should show loading state initially', () => {
      (fetch as Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CommunicationCenter />);

      expect(screen.getByText('Loading communication data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it('should handle API errors gracefully', async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error('API Error'));

      render(<CommunicationCenter />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load communication data')).toBeInTheDocument();
        expect(screen.getByText('API Error')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should make correct API call on component mount', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });

      render(<CommunicationCenter />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/communication-center');
      });
    });

    it('should handle successful API response', async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });

      render(<CommunicationCenter />);

      await waitFor(() => {
        // Check if data is displayed correctly
        expect(screen.getByText('Parent-Teacher Conference Schedule')).toBeInTheDocument();
        expect(screen.getByText('Health Alert: Flu Season Precautions')).toBeInTheDocument();
        expect(screen.getByText('1247')).toBeInTheDocument(); // Total messages
        expect(screen.getByText('23')).toBeInTheDocument(); // Messages today
      });
    });

    it('should handle API failure and show fallback data', async () => {
      (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<CommunicationCenter />);

      await waitFor(() => {
        // Should still show fallback data
        expect(screen.getByText('Parent-Teacher Conference Schedule')).toBeInTheDocument();
        expect(screen.getByText('1247')).toBeInTheDocument();
      });
    });
  });

  describe('L2 Navigation Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should switch to Messages tab by default', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const messagesTab = screen.getByText('Messages');
        expect(messagesTab.closest('button')).toHaveClass('bg-blue-500/20');
      });
    });

    it('should switch to Templates tab when clicked', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const templatesTab = screen.getByText('Templates');
        fireEvent.click(templatesTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Message Templates')).toBeInTheDocument();
        expect(screen.getByText('Weekly Progress Report')).toBeInTheDocument();
        expect(screen.getByText('Event Reminder')).toBeInTheDocument();
      });
    });

    it('should switch to Campaigns tab when clicked', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Communication Campaigns')).toBeInTheDocument();
        expect(screen.getByText('Spring Enrollment Campaign')).toBeInTheDocument();
        expect(screen.getByText('Parent Survey 2024')).toBeInTheDocument();
      });
    });

    it('should show "Feature Coming Soon" for unimplemented tabs', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const analyticsTab = screen.getByText('Analytics');
        fireEvent.click(analyticsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Feature Coming Soon')).toBeInTheDocument();
        expect(screen.getByText('This section is under development')).toBeInTheDocument();
      });
    });
  });

  describe('Messages Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should display communication statistics correctly', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        expect(screen.getByText('1247')).toBeInTheDocument(); // Total Messages
        expect(screen.getByText('23')).toBeInTheDocument(); // Today
        expect(screen.getByText('97.2%')).toBeInTheDocument(); // Delivery Rate
        expect(screen.getByText('68.5%')).toBeInTheDocument(); // Open Rate
        expect(screen.getByText('12.3%')).toBeInTheDocument(); // Response Rate
      });
    });

    it('should display messages table with correct data', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Subject')).toBeInTheDocument();
        expect(screen.getByText('Recipient')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Priority')).toBeInTheDocument();
        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Check message data
        expect(screen.getByText('Parent-Teacher Conference Schedule')).toBeInTheDocument();
        expect(screen.getByText('All Parents - Grade 9')).toBeInTheDocument();
        expect(screen.getByText('EMAIL')).toBeInTheDocument();
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('2024-01-20 14:30')).toBeInTheDocument();

        expect(screen.getByText('Health Alert: Flu Season Precautions')).toBeInTheDocument();
        expect(screen.getByText('Emergency Contacts')).toBeInTheDocument();
        expect(screen.getByText('NOTIFICATION')).toBeInTheDocument();
        expect(screen.getByText('Sent')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
      });
    });

    it('should show correct status and priority colors', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const deliveredStatus = screen.getByText('Delivered');
        const sentStatus = screen.getByText('Sent');
        const highPriority = screen.getByText('High');
        const mediumPriority = screen.getByText('Medium');
        
        expect(deliveredStatus).toHaveClass('text-green-400');
        expect(sentStatus).toHaveClass('text-blue-400');
        expect(highPriority).toHaveClass('text-red-400');
        expect(mediumPriority).toHaveClass('text-yellow-400');
      });
    });

    it('should display correct message type icons', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        // Check for email and notification icons
        const emailIcons = screen.getAllByTestId('mail-icon');
        const notificationIcons = screen.getAllByTestId('bell-icon');
        
        expect(emailIcons.length).toBeGreaterThan(0);
        expect(notificationIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Templates Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should display message templates correctly', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const templatesTab = screen.getByText('Templates');
        fireEvent.click(templatesTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Message Templates')).toBeInTheDocument();
        expect(screen.getByText('Weekly Progress Report')).toBeInTheDocument();
        expect(screen.getByText('Weekly Progress Report - {{student_name}}')).toBeInTheDocument();
        expect(screen.getByText('EMAIL')).toBeInTheDocument();
        expect(screen.getByText('Used 45 times')).toBeInTheDocument();
        expect(screen.getByText('Last: 2024-01-19')).toBeInTheDocument();

        expect(screen.getByText('Event Reminder')).toBeInTheDocument();
        expect(screen.getByText('Reminder: {{event_name}}')).toBeInTheDocument();
        expect(screen.getByText('SMS')).toBeInTheDocument();
        expect(screen.getByText('Used 23 times')).toBeInTheDocument();
        expect(screen.getByText('Last: 2024-01-18')).toBeInTheDocument();
      });
    });

    it('should handle template actions', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const templatesTab = screen.getByText('Templates');
        fireEvent.click(templatesTab);
      });

      await waitFor(() => {
        const useTemplateButtons = screen.getAllByText('Use Template');
        const editButtons = screen.getAllByTestId('edit-icon');
        
        expect(useTemplateButtons.length).toBe(2);
        expect(editButtons.length).toBe(2);
        
        // Test clicking use template button
        fireEvent.click(useTemplateButtons[0]);
        // In a real implementation, this would open a message composer with the template
      });
    });
  });

  describe('Campaigns Tab Functionality', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should display communication campaigns correctly', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Communication Campaigns')).toBeInTheDocument();
        expect(screen.getByText('Spring Enrollment Campaign')).toBeInTheDocument();
        expect(screen.getByText('EMAIL')).toBeInTheDocument();
        expect(screen.getByText('Completed')).toBeInTheDocument();
        expect(screen.getByText('Scheduled: 2024-01-15')).toBeInTheDocument();

        expect(screen.getByText('Parent Survey 2024')).toBeInTheDocument();
        expect(screen.getByText('MIXED')).toBeInTheDocument();
        expect(screen.getByText('Sending')).toBeInTheDocument();
        expect(screen.getByText('Scheduled: 2024-01-20')).toBeInTheDocument();
      });
    });

    it('should display campaign metrics correctly', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        // Check Spring Enrollment Campaign metrics
        expect(screen.getByText('500')).toBeInTheDocument(); // Recipients
        expect(screen.getByText('485')).toBeInTheDocument(); // Delivered
        expect(screen.getByText('342')).toBeInTheDocument(); // Opened
        expect(screen.getByText('89')).toBeInTheDocument(); // Clicked

        // Check Parent Survey 2024 metrics
        expect(screen.getByText('300')).toBeInTheDocument(); // Recipients
        expect(screen.getByText('180')).toBeInTheDocument(); // Sent
        expect(screen.getByText('175')).toBeInTheDocument(); // Delivered
        expect(screen.getByText('98')).toBeInTheDocument(); // Opened
        expect(screen.getByText('23')).toBeInTheDocument(); // Clicked
      });
    });

    it('should show correct campaign status colors', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        const completedStatus = screen.getByText('Completed');
        const sendingStatus = screen.getByText('Sending');
        
        expect(completedStatus).toHaveClass('text-green-400');
        expect(sendingStatus).toHaveClass('text-yellow-400');
      });
    });

    it('should handle campaign actions', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        const viewDetailsButtons = screen.getAllByText('View Details');
        const editButtons = screen.getAllByText('Edit');
        
        expect(viewDetailsButtons.length).toBe(2);
        expect(editButtons.length).toBe(2);
        
        // Test clicking view details button
        fireEvent.click(viewDetailsButtons[0]);
        // In a real implementation, this would show campaign details
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should handle New Message button click', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const newMessageButton = screen.getByText('New Message');
        expect(newMessageButton).toBeInTheDocument();
        
        fireEvent.click(newMessageButton);
        // In a real implementation, this would open a message composer
      });
    });

    it('should handle New Template button click', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const templatesTab = screen.getByText('Templates');
        fireEvent.click(templatesTab);
      });

      await waitFor(() => {
        const newTemplateButton = screen.getByText('New Template');
        expect(newTemplateButton).toBeInTheDocument();
        
        fireEvent.click(newTemplateButton);
        // In a real implementation, this would open a template editor
      });
    });

    it('should handle New Campaign button click', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        const campaignsTab = screen.getByText('Campaigns');
        fireEvent.click(campaignsTab);
      });

      await waitFor(() => {
        const newCampaignButton = screen.getByText('New Campaign');
        expect(newCampaignButton).toBeInTheDocument();
        
        fireEvent.click(newCampaignButton);
        // In a real implementation, this would open a campaign creator
      });
    });

    it('should handle action buttons in messages table', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        // Check for action buttons (view, copy, refresh)
        const actionButtons = screen.getAllByRole('button');
        const viewButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="eye-icon"]')
        );
        const copyButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="copy-icon"]')
        );
        const refreshButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="refresh-cw-icon"]')
        );

        expect(viewButtons.length).toBeGreaterThan(0);
        expect(copyButtons.length).toBeGreaterThan(0);
        expect(refreshButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Display and Formatting', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should show correct badge counts in navigation', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        // Messages tab should show count
        const messagesTab = screen.getByText('Messages').closest('button');
        expect(messagesTab).toHaveTextContent('2');
        
        // Templates tab should show count
        const templatesTab = screen.getByText('Templates').closest('button');
        expect(templatesTab).toHaveTextContent('2');
        
        // Campaigns tab should show count
        const campaignsTab = screen.getByText('Campaigns').closest('button');
        expect(campaignsTab).toHaveTextContent('2');
      });
    });

    it('should handle empty data gracefully', async () => {
      const emptyData = {
        messages: [],
        templates: [],
        campaigns: [],
        stats: {
          total_messages: 0,
          messages_today: 0,
          delivery_rate: 0,
          open_rate: 0,
          response_rate: 0
        }
      };

      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => emptyData,
      });

      render(<CommunicationCenter />);

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for stats
      });
    });

    it('should truncate long message content appropriately', async () => {
      render(<CommunicationCenter />);

      await waitFor(() => {
        // Check that message content is truncated in the table
        const messageElements = screen.getAllByText(/Dear parents, we are pleased to announce/);
        expect(messageElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(async () => {
      (fetch as Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunicationData,
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<CommunicationCenter />);

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
      render(<CommunicationCenter />);

      await waitFor(() => {
        const templatesTab = screen.getByText('Templates');
        
        // Simulate keyboard navigation
        templatesTab.focus();
        fireEvent.keyDown(templatesTab, { key: 'Enter' });
        
        // Should switch to templates tab
        expect(screen.getByText('Message Templates')).toBeInTheDocument();
      });
    });
  });
});
