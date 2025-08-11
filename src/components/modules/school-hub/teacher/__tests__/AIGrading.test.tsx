/**
 * AIGrading Component Tests
 * Testing AI-powered grading functionality, rubric management, and history tracking
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIGrading from '../AIGrading';
import { aiProvider } from '../../../../../services/aiProvider';

// Mock AI provider
jest.mock('../../../../../services/aiProvider', () => ({
  aiProvider: {
    gradeSubmission: jest.fn()
  }
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('AIGrading Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock fetch responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    // Mock AI provider
    (aiProvider.gradeSubmission as jest.Mock).mockResolvedValue(
      'SCORE: 85/100\nFEEDBACK: Good work overall. Clear writing and solid understanding.\nSTRENGTHS: Well organized, good examples\nIMPROVEMENTS: Expand conclusion, add more citations'
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the AI grading interface', () => {
      render(<AIGrading />);
      
      expect(screen.getByText('AI-Assisted Grading')).toBeInTheDocument();
      expect(screen.getByText('Advanced AI-powered grading with detailed feedback, rubric analysis, and grading history.')).toBeInTheDocument();
    });

    it('should display quick stats cards', () => {
      render(<AIGrading />);
      
      expect(screen.getByText('Total Graded')).toBeInTheDocument();
      expect(screen.getByText('A/B Grades')).toBeInTheDocument();
      expect(screen.getByText('Saved Rubrics')).toBeInTheDocument();
    });

    it('should render assignment form with all required fields', () => {
      render(<AIGrading />);
      
      expect(screen.getByPlaceholderText('e.g., Essay on Climate Change')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g., John Smith')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Paste student\'s work here...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Define your grading criteria...')).toBeInTheDocument();
    });

    it('should display assignment type buttons', () => {
      render(<AIGrading />);
      
      expect(screen.getByText('Essay')).toBeInTheDocument();
      expect(screen.getByText('Math')).toBeInTheDocument();
      expect(screen.getByText('Code')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  describe('Assignment Type Selection', () => {
    it('should change rubric when assignment type is selected', () => {
      render(<AIGrading />);
      
      const essayButton = screen.getByText('Essay');
      fireEvent.click(essayButton);
      
      const rubricTextarea = screen.getByPlaceholderText('Define your grading criteria...');
      expect(rubricTextarea).toHaveValue(expect.stringContaining('Writing Quality'));
      expect(rubricTextarea).toHaveValue(expect.stringContaining('Content and Ideas'));
    });

    it('should highlight selected assignment type', () => {
      render(<AIGrading />);
      
      const mathButton = screen.getByText('Math');
      fireEvent.click(mathButton);
      
      expect(mathButton).toHaveClass('bg-blue-500');
    });

    it('should load appropriate rubric for each assignment type', () => {
      render(<AIGrading />);
      
      // Test Math rubric
      const mathButton = screen.getByText('Math');
      fireEvent.click(mathButton);
      
      const rubricTextarea = screen.getByPlaceholderText('Define your grading criteria...');
      expect(rubricTextarea).toHaveValue(expect.stringContaining('Problem Solving'));
      
      // Test Code rubric
      const codeButton = screen.getByText('Code');
      fireEvent.click(codeButton);
      
      expect(rubricTextarea).toHaveValue(expect.stringContaining('Functionality'));
      expect(rubricTextarea).toHaveValue(expect.stringContaining('Code Quality'));
    });
  });

  describe('Form Interactions', () => {
    it('should update form fields when user types', () => {
      render(<AIGrading />);
      
      const assignmentInput = screen.getByPlaceholderText('e.g., Essay on Climate Change');
      fireEvent.change(assignmentInput, { target: { value: 'Math Test #1' } });
      expect(assignmentInput).toHaveValue('Math Test #1');
      
      const studentInput = screen.getByPlaceholderText('e.g., John Smith');
      fireEvent.change(studentInput, { target: { value: 'Jane Doe' } });
      expect(studentInput).toHaveValue('Jane Doe');
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Student work content...' } });
      expect(submissionTextarea).toHaveValue('Student work content...');
    });

    it('should enable submit button when required fields are filled', () => {
      render(<AIGrading />);
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      expect(submitButton).toBeDisabled();
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Student work content...' } });
      
      expect(submitButton).toBeEnabled();
    });

    it('should handle custom instructions input', () => {
      render(<AIGrading />);
      
      const customInput = screen.getByPlaceholderText('e.g., Focus on creativity, Consider ESL background');
      fireEvent.change(customInput, { target: { value: 'Focus on mathematical reasoning' } });
      expect(customInput).toHaveValue('Focus on mathematical reasoning');
    });
  });

  describe('AI Grading Process', () => {
    it('should call AI grading service when form is submitted', async () => {
      render(<AIGrading />);
      
      // Fill required fields
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission content' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(aiProvider.gradeSubmission).toHaveBeenCalledWith(
          expect.stringContaining('Test submission content'),
          expect.any(String)
        );
      });
    });

    it('should show loading state during grading', async () => {
      // Mock delayed response
      (aiProvider.gradeSubmission as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('Test feedback'), 100))
      );
      
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Grading...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Grading...')).not.toBeInTheDocument();
      });
    });

    it('should display grading results when AI responds', async () => {
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI Evaluation')).toBeInTheDocument();
        expect(screen.getByText('B+')).toBeInTheDocument(); // Letter grade for 85%
        expect(screen.getByText('85%')).toBeInTheDocument();
      });
    });

    it('should handle AI grading errors gracefully', async () => {
      (aiProvider.gradeSubmission as jest.Mock).mockRejectedValue(new Error('AI Error'));
      
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to grade submission/i)).toBeInTheDocument();
      });
    });
  });

  describe('Rubric Management', () => {
    it('should allow saving custom rubrics', () => {
      // Mock prompt to return a name
      global.prompt = jest.fn().mockReturnValue('My Custom Rubric');
      
      render(<AIGrading />);
      
      const rubricTextarea = screen.getByPlaceholderText('Define your grading criteria...');
      fireEvent.change(rubricTextarea, { target: { value: 'Custom rubric content' } });
      
      const saveButton = screen.getByText('Save Rubric');
      fireEvent.click(saveButton);
      
      expect(global.prompt).toHaveBeenCalledWith('Save rubric as:');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'aiGradingRubrics',
        expect.stringContaining('My Custom Rubric')
      );
    });

    it('should load saved rubrics from localStorage', () => {
      const savedRubrics = { 'Test Rubric': 'Test rubric content' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedRubrics));
      
      render(<AIGrading />);
      
      expect(screen.getByText('Load Saved...')).toBeInTheDocument();
    });

    it('should allow loading saved rubrics', () => {
      const savedRubrics = { 'Test Rubric': 'Saved rubric content' };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedRubrics));
      
      render(<AIGrading />);
      
      const loadSelect = screen.getByDisplayValue('');
      fireEvent.change(loadSelect, { target: { value: 'Test Rubric' } });
      
      const rubricTextarea = screen.getByPlaceholderText('Define your grading criteria...');
      expect(rubricTextarea).toHaveValue('Saved rubric content');
    });
  });

  describe('History Management', () => {
    it('should load grading history on component mount', async () => {
      const mockHistory = {
        history: [
          {
            id: '1',
            timestamp: '2025-08-01 14:30',
            assignment_title: 'Test Assignment',
            student_name: 'Test Student',
            grade: 'A',
            feedback_summary: 'Great work!',
            rubric_used: 'essay'
          }
        ]
      };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHistory
      });
      
      render(<AIGrading />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/crm/grading-history');
      });
    });

    it('should toggle history visibility', async () => {
      render(<AIGrading />);
      
      const historyButton = screen.getByRole('button', { name: /show history/i });
      fireEvent.click(historyButton);
      
      expect(screen.getByText('Recent Gradings')).toBeInTheDocument();
      
      const hideButton = screen.getByRole('button', { name: /hide history/i });
      fireEvent.click(hideButton);
      
      expect(screen.queryByText('Recent Gradings')).not.toBeInTheDocument();
    });

    it('should save grading to history when assignment info is provided', async () => {
      render(<AIGrading />);
      
      // Fill out form with assignment info
      const assignmentInput = screen.getByPlaceholderText('e.g., Essay on Climate Change');
      fireEvent.change(assignmentInput, { target: { value: 'Test Assignment' } });
      
      const studentInput = screen.getByPlaceholderText('e.g., John Smith');
      fireEvent.change(studentInput, { target: { value: 'Test Student' } });
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:5000/api/crm/grading-history',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });
  });

  describe('Export Functionality', () => {
    it('should show export button when feedback is available', async () => {
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Export Results')).toBeInTheDocument();
      });
    });

    it('should create download when export is clicked', async () => {
      // Mock URL.createObjectURL and click
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
      global.URL.revokeObjectURL = jest.fn();
      
      const mockClick = jest.fn();
      const mockAElement = {
        href: '',
        download: '',
        click: mockClick
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAElement as any);
      
      render(<AIGrading />);
      
      // Fill form and submit
      const assignmentInput = screen.getByPlaceholderText('e.g., Essay on Climate Change');
      fireEvent.change(assignmentInput, { target: { value: 'Test Assignment' } });
      
      const studentInput = screen.getByPlaceholderText('e.g., John Smith');
      fireEvent.change(studentInput, { target: { value: 'John Smith' } });
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const exportButton = screen.getByText('Export Results');
        fireEvent.click(exportButton);
      });
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('Detailed Results Display', () => {
    it('should display structured grading results', async () => {
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Check for grade display
        expect(screen.getByText('Letter Grade')).toBeInTheDocument();
        expect(screen.getByText('Percentage')).toBeInTheDocument();
        expect(screen.getByText('Points Earned')).toBeInTheDocument();
        expect(screen.getByText('Total Points')).toBeInTheDocument();
        
        // Check for feedback sections
        expect(screen.getByText('Strengths')).toBeInTheDocument();
        expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
        expect(screen.getByText('Detailed Feedback')).toBeInTheDocument();
      });
    });

    it('should show strengths and improvements lists', async () => {
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/well organized/i)).toBeInTheDocument();
        expect(screen.getByText(/expand conclusion/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<AIGrading />);
      
      expect(screen.getByLabelText('Assignment Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Student Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Student Submission')).toBeInTheDocument();
      expect(screen.getByLabelText('Grading Rubric')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<AIGrading />);
      
      const firstInput = screen.getByPlaceholderText('e.g., Essay on Climate Change');
      firstInput.focus();
      expect(document.activeElement).toBe(firstInput);
    });

    it('should have appropriate button states', () => {
      render(<AIGrading />);
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      expect(submitButton).toHaveAttribute('disabled');
      
      // Fill required field
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test content' } });
      
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty AI responses', async () => {
      (aiProvider.gradeSubmission as jest.Mock).mockResolvedValue('');
      
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('AI Evaluation')).toBeInTheDocument();
      });
    });

    it('should handle malformed AI responses gracefully', async () => {
      (aiProvider.gradeSubmission as jest.Mock).mockResolvedValue('Invalid response format');
      
      render(<AIGrading />);
      
      const submissionTextarea = screen.getByPlaceholderText('Paste student\'s work here...');
      fireEvent.change(submissionTextarea, { target: { value: 'Test submission' } });
      
      const submitButton = screen.getByRole('button', { name: /grade with ai/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid response format')).toBeInTheDocument();
      });
    });

    it('should handle API failures for history gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AIGrading />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load grading history:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });
});
