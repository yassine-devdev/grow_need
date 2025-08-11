/**
 * BehaviorDashboard Component Tests
 * Testing behavior tracking, incident logging, and communication features
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BehaviorDashboard from '../BehaviorDashboard';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('BehaviorDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({})
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render dashboard with loading state initially', () => {
      render(<BehaviorDashboard />);
      
      // Check for loading spinner
      expect(screen.getByRole('generic', { name: /loading/i }) || 
             document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should render dashboard title and navigation tabs', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Behavior Dashboard')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Teacher / Behavior Management & Communication')).toBeInTheDocument();
      expect(screen.getByText('Class Overview')).toBeInTheDocument();
      expect(screen.getByText('Student Details')).toBeInTheDocument();
      expect(screen.getByText('Communications')).toBeInTheDocument();
    });

    it('should show refresh button', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should attempt to fetch behavior data on load', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/crm/behavior-analytics');
      });
    });

    it('should handle successful API response', async () => {
      const mockData = {
        student_behavior: [
          {
            student_id: '1',
            student_name: 'Test Student',
            class: '5A',
            recent_incidents: [],
            behavior_trends: { weekly_score: 85, monthly_score: 78, improvement_rate: 12 },
            communication_log: []
          }
        ],
        analytics: {
          class_overview: {
            total_students: 24,
            positive_behaviors_today: 18,
            incidents_requiring_follow_up: 3,
            parent_communications_pending: 2
          },
          top_concerns: [],
          success_stories: []
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData
      });

      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('24')).toBeInTheDocument(); // Total students
        expect(screen.getByText('18')).toBeInTheDocument(); // Positive behaviors
      });
    });

    it('should handle API failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      render(<BehaviorDashboard />);
      
      // Should still render with mock data
      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Class Overview')).toBeInTheDocument();
      });

      // Click on Student Details tab
      const studentTab = screen.getByText('Student Details');
      fireEvent.click(studentTab);
      
      expect(screen.getByText('Select Student')).toBeInTheDocument();

      // Click on Communications tab
      const communicationsTab = screen.getByText('Communications');
      fireEvent.click(communicationsTab);
      
      expect(screen.getByText('Communication Log')).toBeInTheDocument();
    });

    it('should highlight active tab', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        const overviewTab = screen.getByText('Class Overview').closest('button');
        expect(overviewTab).toHaveClass('bg-white/20');
      });
    });
  });

  describe('Class Overview Features', () => {
    it('should display overview statistics', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Total Students')).toBeInTheDocument();
        expect(screen.getByText('Positive Today')).toBeInTheDocument();
        expect(screen.getByText('Follow-ups Needed')).toBeInTheDocument();
        expect(screen.getByText('Pending Comms')).toBeInTheDocument();
      });
    });

    it('should display behavior trends section', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Behavior Trends')).toBeInTheDocument();
      });
    });

    it('should display success stories section', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Success Stories')).toBeInTheDocument();
      });
    });
  });

  describe('Student Details Features', () => {
    it('should show student selection dropdown', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      expect(screen.getByText('Choose a student...')).toBeInTheDocument();
    });

    it('should display student information when selected', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      // Select a student
      const dropdown = screen.getByDisplayValue('');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Class 5A')).toBeInTheDocument();
        expect(screen.getByText('Weekly Score')).toBeInTheDocument();
      });
    });

    it('should show student behavior trends', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab and select student
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      const dropdown = screen.getByDisplayValue('');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Week Score')).toBeInTheDocument();
        expect(screen.getByText('Month Score')).toBeInTheDocument();
        expect(screen.getByText('Improvement')).toBeInTheDocument();
      });
    });

    it('should display recent incidents for selected student', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab and select student
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      const dropdown = screen.getByDisplayValue('');
      fireEvent.change(dropdown, { target: { value: '1' } });
      
      await waitFor(() => {
        expect(screen.getByText('Recent Incidents')).toBeInTheDocument();
        expect(screen.getByText('Excellent participation in science discussion')).toBeInTheDocument();
      });
    });
  });

  describe('Incident Logging', () => {
    it('should render incident logging form', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      expect(screen.getByText('Log New Incident')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., Participation, Disruption, Leadership')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Describe the incident...')).toBeInTheDocument();
    });

    it('should allow adding new incident', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      // Fill out incident form
      const studentSelect = screen.getAllByDisplayValue('')[0]; // First empty select (student selection)
      fireEvent.change(studentSelect, { target: { value: '1' } });
      
      const categoryInput = screen.getByPlaceholderText('e.g., Participation, Disruption, Leadership');
      fireEvent.change(categoryInput, { target: { value: 'Test Category' } });
      
      const descriptionInput = screen.getByPlaceholderText('Describe the incident...');
      fireEvent.change(descriptionInput, { target: { value: 'Test incident description' } });
      
      const logButton = screen.getByRole('button', { name: /log incident/i });
      fireEvent.click(logButton);
      
      // Should attempt to save to API
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/crm/behavior-incident',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });

    it('should disable log button when form is incomplete', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      const logButton = screen.getByRole('button', { name: /log incident/i });
      expect(logButton).toBeDisabled();
    });
  });

  describe('Communications Tab', () => {
    it('should display communication log', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Communications tab
      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });
      
      expect(screen.getByText('Communication Log')).toBeInTheDocument();
    });

    it('should show communication entries with status indicators', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Communications tab
      await waitFor(() => {
        const communicationsTab = screen.getByText('Communications');
        fireEvent.click(communicationsTab);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Called parent regarding reading time behavior')).toBeInTheDocument();
        expect(screen.getByText('responded')).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data when refresh button is clicked', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
      });
      
      // Should make additional API call
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch behavior data:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should show fallback data when API fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      render(<BehaviorDashboard />);
      
      // Should still show mock data
      await waitFor(() => {
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render stats grid responsively', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        const statsContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-4');
        expect(statsContainer).toBeInTheDocument();
      });
    });

    it('should handle mobile layout for incident form', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      const formGrid = document.querySelector('.grid.grid-cols-2');
      expect(formGrid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      render(<BehaviorDashboard />);
      
      // Switch to Student Details tab
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        fireEvent.click(studentTab);
      });
      
      expect(screen.getByLabelText('Student')).toBeInTheDocument();
      expect(screen.getByLabelText('Type')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });

    it('should support keyboard navigation for tabs', async () => {
      render(<BehaviorDashboard />);
      
      await waitFor(() => {
        const studentTab = screen.getByText('Student Details');
        studentTab.focus();
        fireEvent.keyDown(studentTab, { key: 'Enter' });
        
        expect(screen.getByText('Select Student')).toBeInTheDocument();
      });
    });
  });
});
