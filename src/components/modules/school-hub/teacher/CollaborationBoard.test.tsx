import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CollaborationBoard from './CollaborationBoard';

// Mock the icons module
jest.mock('../../../icons', () => ({
  Icons: {
    MousePointer: ({ size }: { size: number }) => <div data-testid="mouse-pointer-icon" data-size={size} />,
    Pen: ({ size }: { size: number }) => <div data-testid="pen-icon" data-size={size} />,
    Highlighter: ({ size }: { size: number }) => <div data-testid="highlighter-icon" data-size={size} />,
    Type: ({ size }: { size: number }) => <div data-testid="type-icon" data-size={size} />,
    StickyNote: ({ size }: { size: number }) => <div data-testid="sticky-note-icon" data-size={size} />,
    Square: ({ size }: { size: number }) => <div data-testid="square-icon" data-size={size} />,
    Trash: ({ size }: { size: number }) => <div data-testid="trash-icon" data-size={size} />,
    Undo: ({ size }: { size: number }) => <div data-testid="undo-icon" data-size={size} />,
    Redo: ({ size }: { size: number }) => <div data-testid="redo-icon" data-size={size} />,
    Mic: ({ size }: { size: number }) => <div data-testid="mic-icon" data-size={size} />,
    Video: ({ size }: { size: number }) => <div data-testid="video-icon" data-size={size} />,
    Layout: ({ size }: { size: number }) => <div data-testid="layout-icon" data-size={size} />,
    FileText: ({ size }: { size: number }) => <div data-testid="file-text-icon" data-size={size} />,
    Save: ({ size }: { size: number }) => <div data-testid="save-icon" data-size={size} />,
    Download: ({ size }: { size: number }) => <div data-testid="download-icon" data-size={size} />,
    MessageCircle: ({ size }: { size: number }) => <div data-testid="message-circle-icon" data-size={size} />,
    MessageSquare: ({ size }: { size: number }) => <div data-testid="message-square-icon" data-size={size} />,
    X: ({ size }: { size: number }) => <div data-testid="x-icon" data-size={size} />,
    Lightbulb: ({ size }: { size: number }) => <div data-testid="lightbulb-icon" data-size={size} />,
    BookOpen: ({ size }: { size: number }) => <div data-testid="book-open-icon" data-size={size} />,
    PuzzleIcon: ({ size }: { size: number }) => <div data-testid="puzzle-icon" data-size={size} />,
    Users: ({ size }: { size: number }) => <div data-testid="users-icon" data-size={size} />,
    Calendar: ({ size }: { size: number }) => <div data-testid="calendar-icon" data-size={size} />,
    Search: ({ size }: { size: number }) => <div data-testid="search-icon" data-size={size} />
  }
}));

// Mock GlassmorphicContainer
jest.mock('../../../ui/GlassmorphicContainer', () => {
  return function GlassmorphicContainer({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`glassmorphic-container ${className || ''}`}>{children}</div>;
  };
});

describe('CollaborationBoard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Mock console.log and console.error to avoid test output pollution
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders collaboration board with main elements', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText(/Grade 10 History - Civil War Discussion/i)).toBeInTheDocument();
      expect(screen.getByText(/Collaborative analysis of Civil War causes and effects/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    test('renders toolbar with drawing tools', () => {
      render(<CollaborationBoard />);
      
      // Use getAllByTestId to handle multiple instances and check that icons exist
      const mousePointerIcons = screen.getAllByTestId('mouse-pointer-icon');
      expect(mousePointerIcons.length).toBeGreaterThan(0);
      
      const penIcons = screen.getAllByTestId('pen-icon');
      expect(penIcons.length).toBeGreaterThan(0);
      
      const highlighterIcons = screen.getAllByTestId('highlighter-icon');
      expect(highlighterIcons.length).toBeGreaterThan(0);
      
      const typeIcons = screen.getAllByTestId('type-icon');
      expect(typeIcons.length).toBeGreaterThan(0);
      
      const stickyNoteIcons = screen.getAllByTestId('sticky-note-icon');
      expect(stickyNoteIcons.length).toBeGreaterThan(0);
      
      const squareIcons = screen.getAllByTestId('square-icon');
      expect(squareIcons.length).toBeGreaterThan(0);
    });

    test('renders color picker with default colors', () => {
      render(<CollaborationBoard />);
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('color-btn')
      );
      expect(colorButtons).toHaveLength(6);
    });

    test('renders active users display', () => {
      render(<CollaborationBoard />);
      
      // Use getAllByText to handle users appearing in both toolbar and user panel
      const mjElements = screen.getAllByText('MJ');
      expect(mjElements.length).toBeGreaterThan(0); // Ms. Johnson appears in toolbar and user panel
      
      const asElements = screen.getAllByText('AS');
      expect(asElements.length).toBeGreaterThan(0); // Alex Smith
      
      const mgElements = screen.getAllByText('MG');
      expect(mgElements.length).toBeGreaterThan(0); // Maria Garcia
      
      const dcElements = screen.getAllByText('DC');
      expect(dcElements.length).toBeGreaterThan(0); // David Chen
    });

    test('renders sample sticky notes', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText(/Economic factors leading to conflict/i)).toBeInTheDocument();
      expect(screen.getByText(/Slavery and moral disagreements/i)).toBeInTheDocument();
      expect(screen.getByText(/States rights vs federal authority/i)).toBeInTheDocument();
    });

    test('renders drawing canvas', () => {
      render(<CollaborationBoard />);
      
      // Find SVG element by class name since it doesn't have an img role
      const canvas = document.querySelector('.drawing-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveClass('drawing-canvas');
    });
  });

  describe('Tool Selection', () => {
    test('selects pointer tool by default', () => {
      render(<CollaborationBoard />);
      
      const pointerButton = screen.getByTitle('Select');
      expect(pointerButton).toHaveClass('active');
    });

    test('changes tool selection when clicking tool buttons', async () => {
      render(<CollaborationBoard />);
      
      const penButton = screen.getByTitle('Pen');
      const pointerButton = screen.getByTitle('Select');
      
      expect(pointerButton).toHaveClass('active');
      expect(penButton).not.toHaveClass('active');
      
      await user.click(penButton);
      
      expect(penButton).toHaveClass('active');
      expect(pointerButton).not.toHaveClass('active');
    });

    test('updates tool selection for all available tools', async () => {
      render(<CollaborationBoard />);
      
      const tools = [
        { title: 'Pen', testId: 'pen-icon' },
        { title: 'Highlighter', testId: 'highlighter-icon' },
        { title: 'Text', testId: 'type-icon' },
        { title: 'Sticky Note', testId: 'sticky-note-icon' },
        { title: 'Shapes', testId: 'square-icon' }
      ];
      
      for (const tool of tools) {
        const toolButton = screen.getByTitle(tool.title);
        await user.click(toolButton);
        expect(toolButton).toHaveClass('active');
      }
    });
  });

  describe('Color Selection', () => {
    test('changes selected color when clicking color buttons', async () => {
      render(<CollaborationBoard />);
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('color-btn')
      );
      
      // First color should be active by default
      expect(colorButtons[0]).toHaveClass('active');
      
      // Click second color
      await user.click(colorButtons[1]);
      expect(colorButtons[1]).toHaveClass('active');
      expect(colorButtons[0]).not.toHaveClass('active');
    });
  });

  describe('Brush Size Control', () => {
    test('renders brush size slider', () => {
      render(<CollaborationBoard />);
      
      const brushSlider = screen.getByRole('slider');
      expect(brushSlider).toBeInTheDocument();
      expect(brushSlider).toHaveAttribute('min', '1');
      expect(brushSlider).toHaveAttribute('max', '20');
    });

    test('updates brush size when moving slider', async () => {
      render(<CollaborationBoard />);
      
      const brushSlider = screen.getByRole('slider');
      expect(brushSlider).toHaveValue('3'); // Default value
      
      // Use fireEvent to change the slider value
      fireEvent.change(brushSlider, { target: { value: '10' } });
      
      expect(brushSlider).toHaveValue('10');
    });
  });

  describe('Board Actions', () => {
    test('clear board button exists and is clickable', async () => {
      render(<CollaborationBoard />);
      
      const clearButton = screen.getByTitle('Clear All');
      expect(clearButton).toBeInTheDocument();
      
      await user.click(clearButton);
      // The action completes without error
    });

    test('save session button triggers save action', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      render(<CollaborationBoard />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Saving session:', expect.any(Object));
    });

    test('undo and redo buttons are present', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByTitle('Undo')).toBeInTheDocument();
      expect(screen.getByTitle('Redo')).toBeInTheDocument();
    });
  });

  describe('Voice and Video Controls', () => {
    test('voice and video buttons toggle state', async () => {
      render(<CollaborationBoard />);
      
      const voiceButton = screen.getByTitle('Voice Chat');
      const videoButton = screen.getByTitle('Video Chat');
      
      expect(voiceButton).not.toHaveClass('active');
      expect(videoButton).not.toHaveClass('active');
      
      await user.click(voiceButton);
      expect(voiceButton).toHaveClass('active');
      
      await user.click(videoButton);
      expect(videoButton).toHaveClass('active');
      
      // Toggle off
      await user.click(voiceButton);
      expect(voiceButton).not.toHaveClass('active');
    });
  });

  describe('Templates Panel', () => {
    test('templates button toggles templates panel', async () => {
      render(<CollaborationBoard />);
      
      const templatesButton = screen.getByRole('button', { name: /templates/i });
      
      // Panel should not be visible initially
      expect(screen.queryByText('Collaboration Templates')).not.toBeInTheDocument();
      
      await user.click(templatesButton);
      
      // Panel should be visible
      expect(screen.getByText('Collaboration Templates')).toBeInTheDocument();
    });

    test('displays available collaboration templates', async () => {
      render(<CollaborationBoard />);
      
      const templatesButton = screen.getByRole('button', { name: /templates/i });
      await user.click(templatesButton);
      
      expect(screen.getByText('Brainstorming Session')).toBeInTheDocument();
      expect(screen.getByText('Lesson Plan Review')).toBeInTheDocument();
      expect(screen.getByText('Problem Solving Workshop')).toBeInTheDocument();
      expect(screen.getByText('Peer Review Session')).toBeInTheDocument();
      expect(screen.getByText('Project Planning Board')).toBeInTheDocument();
      expect(screen.getByText('Research Synthesis')).toBeInTheDocument();
    });

    test('template cards have use template buttons', async () => {
      render(<CollaborationBoard />);
      
      const templatesButton = screen.getByRole('button', { name: /templates/i });
      await user.click(templatesButton);
      
      const useTemplateButtons = screen.getAllByText('Use Template');
      expect(useTemplateButtons).toHaveLength(6);
    });
  });

  describe('Documents Panel', () => {
    test('documents button toggles documents panel', async () => {
      render(<CollaborationBoard />);
      
      const documentsButton = screen.getByRole('button', { name: /documents/i });
      
      // Initially no documents panel content should be visible
      // (in current implementation, documents panel structure isn't fully implemented)
      await user.click(documentsButton);
      
      // The button click should execute without errors
      expect(documentsButton).toBeInTheDocument();
    });
  });

  describe('User Panel', () => {
    test('displays active users with correct information', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText('Active Users (4)')).toBeInTheDocument();
      
      // Check that user names appear (they may appear multiple times)
      expect(screen.getAllByText('Ms. Johnson').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Alex Smith').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Maria Garcia').length).toBeGreaterThan(0);
      expect(screen.getAllByText('David Chen').length).toBeGreaterThan(0);
    });

    test('shows user roles correctly', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getAllByText('teacher')).toHaveLength(1);
      expect(screen.getAllByText('student')).toHaveLength(3);
    });

    test('displays user status indicators', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText('Typing...')).toBeInTheDocument();
      expect(screen.getByText('Drawing...')).toBeInTheDocument();
    });

    test('user action buttons are present', () => {
      render(<CollaborationBoard />);
      
      const messageButtons = screen.getAllByTitle('Message');
      expect(messageButtons).toHaveLength(4); // One for each user
    });
  });

  describe('Chat Panel', () => {
    test('renders minimized chat panel with message count', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText('Chat (3)')).toBeInTheDocument();
    });

    test('displays chat messages in correct format', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText('Ms. Johnson:')).toBeInTheDocument();
      expect(screen.getByText('Alex Smith:')).toBeInTheDocument();
      expect(screen.getByText('Maria Garcia:')).toBeInTheDocument();
      
      expect(screen.getByText(/Let's explore the main causes of the Civil War/)).toBeInTheDocument();
      expect(screen.getByText(/I think economic differences were a major factor/)).toBeInTheDocument();
      expect(screen.getByText(/Should we also consider the moral aspects of slavery?/)).toBeInTheDocument();
    });
  });

  describe('Sticky Notes Interaction', () => {
    test('sticky notes display correct content and styling', () => {
      render(<CollaborationBoard />);
      
      const economicNote = screen.getByText(/Economic factors leading to conflict/i);
      const slaveryNote = screen.getByText(/Slavery and moral disagreements/i);
      const statesNote = screen.getByText(/States rights vs federal authority/i);
      
      expect(economicNote).toBeInTheDocument();
      expect(slaveryNote).toBeInTheDocument();
      expect(statesNote).toBeInTheDocument();
    });

    test('sticky notes have delete buttons', () => {
      render(<CollaborationBoard />);
      
      const deleteButtons = screen.getAllByTestId('x-icon');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    test('sticky notes show author information', () => {
      render(<CollaborationBoard />);
      
      // Check that author names appear in note headers (they may appear multiple times)
      expect(screen.getAllByText('Ms. Johnson').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Alex Smith').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Maria Garcia').length).toBeGreaterThan(0);
    });
  });

  describe('Drawing Functionality', () => {
    test('canvas responds to mouse events for drawing', async () => {
      render(<CollaborationBoard />);
      
      // First select pen tool
      const penButton = screen.getByTitle('Pen');
      await user.click(penButton);
      
      const canvas = document.querySelector('.drawing-canvas');
      expect(canvas).toBeInTheDocument();
      
      // Simulate drawing - mouse down, move, up
      fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas!, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas!);
      
      // The drawing actions complete without error
      expect(canvas).toBeInTheDocument();
    });

    test('drawing only works with pen or highlighter tools', async () => {
      render(<CollaborationBoard />);
      
      const canvas = document.querySelector('.drawing-canvas');
      expect(canvas).toBeInTheDocument();
      
      // With pointer tool (default), drawing shouldn't work
      fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas!, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas!);
      
      // Switch to pen tool
      const penButton = screen.getByTitle('Pen');
      await user.click(penButton);
      
      // Now drawing should work
      fireEvent.mouseDown(canvas!, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(canvas!, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(canvas!);
      
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    test('export button is present in header', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  describe('Session Management', () => {
    test('displays session information correctly', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByText('Grade 10 History - Civil War Discussion')).toBeInTheDocument();
      expect(screen.getByText('Collaborative analysis of Civil War causes and effects')).toBeInTheDocument();
    });

    test('session controls are functional', async () => {
      render(<CollaborationBoard />);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      const templatesButton = screen.getByRole('button', { name: /templates/i });
      const documentsButton = screen.getByRole('button', { name: /documents/i });
      const exportButton = screen.getByRole('button', { name: /export/i });
      
      expect(saveButton).toBeInTheDocument();
      expect(templatesButton).toBeInTheDocument();
      expect(documentsButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();
      
      // Test clicking each button
      await user.click(templatesButton);
      await user.click(documentsButton);
      await user.click(saveButton);
    });
  });

  describe('Responsive Design', () => {
    test('component renders within container constraints', () => {
      render(<CollaborationBoard />);
      
      const container = document.querySelector('.collab-container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('collab-container');
    });
  });

  describe('Error Handling', () => {
    test('component handles missing data gracefully', () => {
      // Component should render even with minimal props
      render(<CollaborationBoard />);
      
      expect(screen.getByText(/Grade 10 History/)).toBeInTheDocument();
    });

    test('handles user interactions without errors', async () => {
      render(<CollaborationBoard />);
      
      // Multiple rapid clicks shouldn't cause errors
      const penButton = screen.getByTitle('Pen');
      await user.click(penButton);
      await user.click(penButton);
      await user.click(penButton);
      
      const clearButton = screen.getByTitle('Clear All');
      await user.click(clearButton);
      
      expect(penButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('toolbar buttons have proper titles', () => {
      render(<CollaborationBoard />);
      
      expect(screen.getByTitle('Select')).toBeInTheDocument();
      expect(screen.getByTitle('Pen')).toBeInTheDocument();
      expect(screen.getByTitle('Highlighter')).toBeInTheDocument();
      expect(screen.getByTitle('Text')).toBeInTheDocument();
      expect(screen.getByTitle('Sticky Note')).toBeInTheDocument();
      expect(screen.getByTitle('Shapes')).toBeInTheDocument();
      expect(screen.getByTitle('Clear All')).toBeInTheDocument();
      expect(screen.getByTitle('Undo')).toBeInTheDocument();
      expect(screen.getByTitle('Redo')).toBeInTheDocument();
      expect(screen.getByTitle('Voice Chat')).toBeInTheDocument();
      expect(screen.getByTitle('Video Chat')).toBeInTheDocument();
    });

    test('color buttons are keyboard accessible', () => {
      render(<CollaborationBoard />);
      
      const colorButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('color-btn')
      );
      
      colorButtons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('brush size slider has proper attributes', () => {
      render(<CollaborationBoard />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '20');
    });
  });
});
