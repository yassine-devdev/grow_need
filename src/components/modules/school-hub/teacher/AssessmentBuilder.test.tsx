import React from 'react';
import { render, screen, fireEvent, waitFor, getAllByTestId } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssessmentBuilder from './AssessmentBuilder';

// Mock the Icons component
jest.mock('../../../icons', () => ({
  Icons: {
    ClipboardCheck: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="clipboard-check-icon" data-size={size} className={className}>ClipboardCheck</div>
    ),
    Eye: ({ size }: { size?: number }) => (
      <div data-testid="eye-icon" data-size={size}>Eye</div>
    ),
    Save: ({ size }: { size?: number }) => (
      <div data-testid="save-icon" data-size={size}>Save</div>
    ),
    Send: ({ size }: { size?: number }) => (
      <div data-testid="send-icon" data-size={size}>Send</div>
    ),
    Wrench: ({ size }: { size?: number }) => (
      <div data-testid="wrench-icon" data-size={size}>Wrench</div>
    ),
    Database: ({ size }: { size?: number }) => (
      <div data-testid="database-icon" data-size={size}>Database</div>
    ),
    Layout: ({ size }: { size?: number }) => (
      <div data-testid="layout-icon" data-size={size}>Layout</div>
    ),
    BarChart3: ({ size }: { size?: number }) => (
      <div data-testid="bar-chart-icon" data-size={size}>BarChart3</div>
    ),
    Info: ({ size }: { size?: number }) => (
      <div data-testid="info-icon" data-size={size}>Info</div>
    ),
    Plus: ({ size }: { size?: number }) => (
      <div data-testid="plus-icon" data-size={size}>Plus</div>
    ),
    Sparkles: ({ size }: { size?: number }) => (
      <div data-testid="sparkles-icon" data-size={size}>Sparkles</div>
    ),
    List: ({ size }: { size?: number }) => (
      <div data-testid="list-icon" data-size={size}>List</div>
    ),
    CheckCircle: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="check-circle-icon" data-size={size} className={className}>CheckCircle</div>
    ),
    ToggleLeft: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="toggle-left-icon" data-size={size} className={className}>ToggleLeft</div>
    ),
    Edit3: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="edit3-icon" data-size={size} className={className}>Edit3</div>
    ),
    FileText: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="file-text-icon" data-size={size} className={className}>FileText</div>
    ),
    Link: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="link-icon" data-size={size} className={className}>Link</div>
    ),
    Type: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="type-icon" data-size={size} className={className}>Type</div>
    ),
    Edit: ({ size }: { size?: number }) => (
      <div data-testid="edit-icon" data-size={size}>Edit</div>
    ),
    Trash: ({ size }: { size?: number }) => (
      <div data-testid="trash-icon" data-size={size}>Trash</div>
    ),
    Check: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="check-icon" data-size={size} className={className}>Check</div>
    ),
    HelpCircle: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="help-circle-icon" data-size={size} className={className}>HelpCircle</div>
    ),
    Download: ({ size }: { size?: number }) => (
      <div data-testid="download-icon" data-size={size}>Download</div>
    ),
    X: ({ size }: { size?: number }) => (
      <div data-testid="x-icon" data-size={size}>X</div>
    ),
    Loader: ({ size, className }: { size?: number; className?: string }) => (
      <div data-testid="loader-icon" data-size={size} className={className}>Loader</div>
    )
  }
}));

// Mock the GlassmorphicContainer component
jest.mock('../../../ui/GlassmorphicContainer', () => 
  ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="glassmorphic-container" className={className}>
      {children}
    </div>
  )
);

describe('AssessmentBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders assessment builder with main title and tabs', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByText('Assessment Builder')).toBeInTheDocument();
      expect(screen.getByText('Create comprehensive formative and summative assessments')).toBeInTheDocument();
      
      // Check tab navigation
      expect(screen.getByText('Builder')).toBeInTheDocument();
      expect(screen.getByText('Question Bank')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    test('renders action buttons with correct initial states', () => {
      render(<AssessmentBuilder />);
      
      const previewBtn = screen.getByText('Preview');
      const saveDraftBtn = screen.getByText('Save Draft');
      const publishBtn = screen.getByText('Publish');
      
      expect(previewBtn).toBeInTheDocument();
      expect(previewBtn).toBeDisabled(); // No questions initially
      expect(saveDraftBtn).toBeInTheDocument();
      expect(publishBtn).toBeInTheDocument();
      expect(publishBtn).toBeDisabled(); // No title or questions initially
    });

    test('renders assessment details form', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time limit/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument();
    });

    test('renders question form with default settings', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
      expect(screen.getByText('Add Question')).toBeInTheDocument();
    });
  });

  describe('Assessment Details Management', () => {
    test('updates assessment title', () => {
      render(<AssessmentBuilder />);
      
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Math Quiz Chapter 1' } });
      
      expect(titleInput).toHaveValue('Math Quiz Chapter 1');
    });

    test('updates subject selection', () => {
      render(<AssessmentBuilder />);
      
      const subjectSelect = screen.getByLabelText(/subject/i);
      fireEvent.change(subjectSelect, { target: { value: 'Mathematics' } });
      
      expect(subjectSelect).toHaveValue('Mathematics');
    });

    test('updates time limit', () => {
      render(<AssessmentBuilder />);
      
      const timeLimitInput = screen.getByLabelText(/time limit/i);
      fireEvent.change(timeLimitInput, { target: { value: '45' } });
      
      expect(timeLimitInput).toHaveValue(45);
    });

    test('toggles assessment settings', () => {
      render(<AssessmentBuilder />);
      
      const allowRetakesCheckbox = screen.getByLabelText(/allow retakes/i);
      const shuffleQuestionsCheckbox = screen.getByLabelText(/shuffle questions/i);
      const showCorrectAnswersCheckbox = screen.getByLabelText(/show correct answers/i);
      
      fireEvent.click(allowRetakesCheckbox);
      fireEvent.click(shuffleQuestionsCheckbox);
      fireEvent.click(showCorrectAnswersCheckbox);
      
      expect(allowRetakesCheckbox).toBeChecked();
      expect(shuffleQuestionsCheckbox).toBeChecked();
      expect(showCorrectAnswersCheckbox).not.toBeChecked();
    });
  });

  describe('Question Management', () => {
    test('adds a multiple choice question', () => {
      render(<AssessmentBuilder />);
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      const pointsInput = screen.getByLabelText(/points/i);
      const addButton = screen.getByText('Add Question');
      
      fireEvent.change(questionTextArea, { target: { value: 'What is 2 + 2?' } });
      fireEvent.change(pointsInput, { target: { value: '10' } });
      
      // Fill in options
      const optionInputs = screen.getAllByPlaceholderText(/option [a-d]/i);
      fireEvent.change(optionInputs[0], { target: { value: '3' } });
      fireEvent.change(optionInputs[1], { target: { value: '4' } });
      fireEvent.change(optionInputs[2], { target: { value: '5' } });
      fireEvent.change(optionInputs[3], { target: { value: '6' } });
      
      // Select correct answer
      const correctRadio = screen.getAllByLabelText(/correct/i)[1]; // Second option (4)
      fireEvent.click(correctRadio);
      
      fireEvent.click(addButton);
      
      // Check if question appears in the list
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.getByText('Total Points: 10')).toBeInTheDocument();
    });

    test('adds a true/false question', () => {
      render(<AssessmentBuilder />);
      
      const questionTypeSelect = screen.getByLabelText(/question type/i);
      fireEvent.change(questionTypeSelect, { target: { value: 'true-false' } });
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'The Earth is round.' } });
      
      const trueRadio = screen.getByLabelText('True');
      fireEvent.click(trueRadio);
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      expect(screen.getByText('The Earth is round.')).toBeInTheDocument();
    });

    test('edits an existing question', () => {
      render(<AssessmentBuilder />);
      
      // First add a question
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Original question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      // Then edit it
      const editButton = screen.getByTestId('edit-icon');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Edit Question')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Original question')).toBeInTheDocument();
    });

    test('deletes a question', () => {
      render(<AssessmentBuilder />);
      
      // Add a question first
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Question to delete' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Question to delete')).toBeInTheDocument();
      
      // Delete the question
      const deleteButton = screen.getByTestId('trash-icon');
      fireEvent.click(deleteButton);
      
      expect(screen.queryByText('Question to delete')).not.toBeInTheDocument();
    });

    test('filters questions by difficulty', () => {
      render(<AssessmentBuilder />);
      
      // Add questions with different difficulties
      const questionTextArea = screen.getByLabelText(/question text/i);
      const difficultySelect = screen.getByLabelText(/difficulty/i);
      const addButton = screen.getByText('Add Question');
      
      // Add easy question
      fireEvent.change(questionTextArea, { target: { value: 'Easy question' } });
      fireEvent.change(difficultySelect, { target: { value: 'easy' } });
      fireEvent.click(addButton);
      
      // Add hard question
      fireEvent.change(questionTextArea, { target: { value: 'Hard question' } });
      fireEvent.change(difficultySelect, { target: { value: 'hard' } });
      fireEvent.click(addButton);
      
      // Filter by easy
      const filterSelect = screen.getAllByDisplayValue('All Difficulties')[0];
      fireEvent.change(filterSelect, { target: { value: 'easy' } });
      
      expect(screen.getByText('Easy question')).toBeInTheDocument();
      expect(screen.queryByText('Hard question')).not.toBeInTheDocument();
    });

    test('searches questions by text', () => {
      render(<AssessmentBuilder />);
      
      // Add questions
      const questionTextArea = screen.getByLabelText(/question text/i);
      const addButton = screen.getByText('Add Question');
      
      fireEvent.change(questionTextArea, { target: { value: 'Math algebra question' } });
      fireEvent.click(addButton);
      
      fireEvent.change(questionTextArea, { target: { value: 'Science biology question' } });
      fireEvent.click(addButton);
      
      // Search for algebra
      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      fireEvent.change(searchInput, { target: { value: 'algebra' } });
      
      expect(screen.getByText('Math algebra question')).toBeInTheDocument();
      expect(screen.queryByText('Science biology question')).not.toBeInTheDocument();
    });
  });

  describe('AI Generation', () => {
    test('renders AI generation form', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/count/i)).toBeInTheDocument();
      expect(screen.getByText('Generate Questions')).toBeInTheDocument();
    });

    test('generates questions with AI', async () => {
      render(<AssessmentBuilder />);
      
      const topicInput = screen.getByLabelText(/topic/i);
      const countInput = screen.getByLabelText(/count/i);
      const generateButton = screen.getByText('Generate Questions');
      
      fireEvent.change(topicInput, { target: { value: 'Algebra' } });
      fireEvent.change(countInput, { target: { value: '3' } });
      fireEvent.click(generateButton);
      
      expect(screen.getByText('Generating...')).toBeInTheDocument();
      
      // Wait for generation to complete
      await waitFor(() => {
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Check if AI questions were added
      expect(screen.getByText(/AI Generated question 1 about Algebra/)).toBeInTheDocument();
    });

    test('disables generate button when topic is empty', () => {
      render(<AssessmentBuilder />);
      
      const generateButton = screen.getByText('Generate Questions');
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Tab Navigation', () => {
    test('switches to Question Bank tab', () => {
      render(<AssessmentBuilder />);
      
      const questionBankTab = screen.getByText('Question Bank');
      fireEvent.click(questionBankTab);
      
      expect(screen.getByText('Question Banks')).toBeInTheDocument();
      expect(screen.getByText('Math Grade 8 - Algebra')).toBeInTheDocument();
    });

    test('switches to Templates tab', () => {
      render(<AssessmentBuilder />);
      
      const templatesTab = screen.getByText('Templates');
      fireEvent.click(templatesTab);
      
      expect(screen.getByText('Assessment Templates')).toBeInTheDocument();
      expect(screen.getByText('Quick Quiz Template')).toBeInTheDocument();
    });

    test('switches to Analytics tab', () => {
      render(<AssessmentBuilder />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      expect(screen.getByText('Assessment Analytics')).toBeInTheDocument();
      expect(screen.getByText('Total Assessments')).toBeInTheDocument();
    });

    test('imports questions from question bank', () => {
      render(<AssessmentBuilder />);
      
      // Switch to question bank
      const questionBankTab = screen.getByText('Question Bank');
      fireEvent.click(questionBankTab);
      
      // Import from bank
      const importButton = screen.getByText('Import All');
      fireEvent.click(importButton);
      
      // Switch back to builder to see imported question
      const builderTab = screen.getByText('Builder');
      fireEvent.click(builderTab);
      
      expect(screen.getByText(/Solve for x: 2x \+ 5 = 13/)).toBeInTheDocument();
    });

    test('applies template to assessment', () => {
      render(<AssessmentBuilder />);
      
      // Switch to templates
      const templatesTab = screen.getByText('Templates');
      fireEvent.click(templatesTab);
      
      // Apply template
      const useTemplateButton = screen.getByText('Use Template');
      fireEvent.click(useTemplateButton);
      
      // Check if template was applied
      expect(screen.getByDisplayValue(/Quick Quiz Template/)).toBeInTheDocument();
    });
  });

  describe('Assessment Actions', () => {
    test('saves assessment draft', () => {
      render(<AssessmentBuilder />);
      
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Assessment' } });
      
      const saveDraftButton = screen.getByText('Save Draft');
      fireEvent.click(saveDraftButton);
      
      // The assessment should be saved (no visible change but state updated)
      expect(screen.getByDisplayValue('Test Assessment')).toBeInTheDocument();
    });

    test('publishes assessment when valid', () => {
      render(<AssessmentBuilder />);
      
      // Add title and question to make assessment valid
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Assessment' } });
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Test question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      const publishButton = screen.getByText('Publish');
      expect(publishButton).not.toBeDisabled();
      
      fireEvent.click(publishButton);
      
      // Assessment should be published (status updated)
      expect(screen.getByDisplayValue('Test Assessment')).toBeInTheDocument();
    });

    test('shows preview when questions exist', () => {
      render(<AssessmentBuilder />);
      
      // Add a question
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Preview question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      const previewButton = screen.getByText('Preview');
      expect(previewButton).not.toBeDisabled();
      
      fireEvent.click(previewButton);
      
      expect(screen.getByText('Assessment Preview')).toBeInTheDocument();
    });

    test('exports assessment in different formats', () => {
      render(<AssessmentBuilder />);
      
      // Add title and question to make preview available
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Export Test' } });
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Export question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);
      
      // Test export buttons
      expect(screen.getByText('Export JSON')).toBeInTheDocument();
      expect(screen.getByText('Export PDF')).toBeInTheDocument();
    });

    test('closes preview modal', () => {
      render(<AssessmentBuilder />);
      
      // Add question and open preview
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Preview question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);
      
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);
      
      expect(screen.queryByText('Assessment Preview')).not.toBeInTheDocument();
    });
  });

  describe('Question Types', () => {
    test('handles multiple choice question type', () => {
      render(<AssessmentBuilder />);
      
      const questionTypeSelect = screen.getByLabelText(/question type/i);
      fireEvent.change(questionTypeSelect, { target: { value: 'multiple-choice' } });
      
      expect(screen.getByText(/answer options/i)).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/option [a-d]/i)).toHaveLength(4);
    });

    test('handles true/false question type', () => {
      render(<AssessmentBuilder />);
      
      const questionTypeSelect = screen.getByLabelText(/question type/i);
      fireEvent.change(questionTypeSelect, { target: { value: 'true-false' } });
      
      expect(screen.getByText(/correct answer/i)).toBeInTheDocument();
      expect(screen.getByLabelText('True')).toBeInTheDocument();
      expect(screen.getByLabelText('False')).toBeInTheDocument();
    });

    test('handles different question type selection', () => {
      render(<AssessmentBuilder />);
      
      const questionTypeSelect = screen.getByLabelText(/question type/i);
      
      fireEvent.change(questionTypeSelect, { target: { value: 'short-answer' } });
      expect(questionTypeSelect).toHaveValue('short-answer');
      
      fireEvent.change(questionTypeSelect, { target: { value: 'essay' } });
      expect(questionTypeSelect).toHaveValue('essay');
      
      fireEvent.change(questionTypeSelect, { target: { value: 'matching' } });
      expect(questionTypeSelect).toHaveValue('matching');
    });
  });

  describe('Question Validation', () => {
    test('requires question text before adding', () => {
      render(<AssessmentBuilder />);
      
      const addButton = screen.getByText('Add Question');
      expect(addButton).toBeDisabled();
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Valid question' } });
      
      expect(addButton).not.toBeDisabled();
    });

    test('resets form after adding question', () => {
      render(<AssessmentBuilder />);
      
      const questionTextArea = screen.getByLabelText(/question text/i);
      const pointsInput = screen.getByLabelText(/points/i);
      const addButton = screen.getByText('Add Question');
      
      fireEvent.change(questionTextArea, { target: { value: 'Test question' } });
      fireEvent.change(pointsInput, { target: { value: '15' } });
      fireEvent.click(addButton);
      
      expect(questionTextArea).toHaveValue('');
      expect(pointsInput).toHaveValue(5); // Default value
    });
  });

  describe('Analytics Display', () => {
    test('displays assessment statistics', () => {
      render(<AssessmentBuilder />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Total assessments
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('Drafts')).toBeInTheDocument();
      expect(screen.getByText('Avg Questions')).toBeInTheDocument();
    });

    test('displays recent assessments list', () => {
      render(<AssessmentBuilder />);
      
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      expect(screen.getByText('Recent Assessments')).toBeInTheDocument();
      expect(screen.getByText('Chapter 5 Math Quiz')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders properly on different screen sizes', () => {
      render(<AssessmentBuilder />);
      
      // Component should render without errors
      expect(screen.getByText('Assessment Builder')).toBeInTheDocument();
      
      // Check that glassmorphic containers are present
      const containers = screen.getAllByTestId('glassmorphic-container');
      expect(containers.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/points/i)).toBeInTheDocument();
    });

    test('has proper button accessibility', () => {
      render(<AssessmentBuilder />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('has proper form field accessibility', () => {
      render(<AssessmentBuilder />);
      
      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');
      const checkboxes = screen.getAllByRole('checkbox');
      
      expect(inputs.length).toBeGreaterThan(0);
      expect(selects.length).toBeGreaterThan(0);
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('handles empty assessment gracefully', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByText('No questions added yet')).toBeInTheDocument();
      expect(screen.getByText('Start by adding questions above')).toBeInTheDocument();
    });

    test('handles invalid input gracefully', () => {
      render(<AssessmentBuilder />);
      
      const pointsInput = screen.getByLabelText(/points/i);
      fireEvent.change(pointsInput, { target: { value: '-5' } });
      
      // Component should handle negative values
      expect(pointsInput).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    test('maintains assessment state across operations', () => {
      render(<AssessmentBuilder />);
      
      // Set title
      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'Persistent Assessment' } });
      
      // Add question
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Persistent question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      // Switch tabs and back
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
      
      const builderTab = screen.getByText('Builder');
      fireEvent.click(builderTab);
      
      // State should be maintained
      expect(screen.getByDisplayValue('Persistent Assessment')).toBeInTheDocument();
      expect(screen.getByText('Persistent question')).toBeInTheDocument();
    });

    test('updates total points when questions are added/removed', () => {
      render(<AssessmentBuilder />);
      
      expect(screen.getByText('Total Points: 0')).toBeInTheDocument();
      
      // Add 5-point question
      const questionTextArea = screen.getByLabelText(/question text/i);
      fireEvent.change(questionTextArea, { target: { value: 'Five point question' } });
      
      const addButton = screen.getByText('Add Question');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Total Points: 5')).toBeInTheDocument();
      
      // Add 10-point question
      fireEvent.change(questionTextArea, { target: { value: 'Ten point question' } });
      
      const pointsInput = screen.getByLabelText(/points/i);
      fireEvent.change(pointsInput, { target: { value: '10' } });
      
      fireEvent.click(addButton);
      
      expect(screen.getByText('Total Points: 15')).toBeInTheDocument();
    });
  });
});
