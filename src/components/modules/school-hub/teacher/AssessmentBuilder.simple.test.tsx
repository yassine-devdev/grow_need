import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssessmentBuilder from './AssessmentBuilder';

// Mock the GlassmorphicContainer component
jest.mock('../../../ui/GlassmorphicContainer', () => {
  return ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="glassmorphic-container" className={className}>
      {children}
    </div>
  );
});

// Mock the Icons component with all needed icons
jest.mock('../../../icons', () => ({
  Icons: {
    ClipboardCheck: () => <div>ClipboardCheck</div>,
    Eye: () => <div>Eye</div>,
    Save: () => <div>Save</div>,
    Send: () => <div>Send</div>,
    Wrench: () => <div>Wrench</div>,
    Database: () => <div>Database</div>,
    BookOpen: () => <div>BookOpen</div>,
    BarChart: () => <div>BarChart</div>,
    Plus: () => <div>Plus</div>,
    Check: () => <div>Check</div>,
    X: () => <div>X</div>,
    Loader2: () => <div>Loader2</div>,
    AlertCircle: () => <div>AlertCircle</div>,
    Info: () => <div>Info</div>,
    Trash: () => <div>Trash</div>,
    Edit: () => <div>Edit</div>,
    Copy: () => <div>Copy</div>,
    Download: () => <div>Download</div>,
    Upload: () => <div>Upload</div>,
    Brain: () => <div>Brain</div>,
    Users: () => <div>Users</div>,
    FileText: () => <div>FileText</div>,
    Layout: () => <div>Layout</div>,
    ChevronLeft: () => <div>ChevronLeft</div>,
    ChevronRight: () => <div>ChevronRight</div>,
  },
}));

describe('AssessmentBuilder - Simple Test', () => {
  test('should render without crashing', () => {
    expect(() => {
      render(<AssessmentBuilder />);
    }).not.toThrow();
  });
});
