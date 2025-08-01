import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CRMModule from '../CRMModule';

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock child components to focus on CRM module logic
jest.mock('../crm/StudentCRMView', () => ({
  __esModule: true,
  default: ({ students, onEdit, onDelete }: any) => (
    <div data-testid="student-crm-view">
      <div>Student CRM View</div>
      {students?.map((student: any) => (
        <div key={student.id} data-testid={`student-${student.id}`}>
          {student.name}
          <button onClick={() => onEdit(student)}>Edit</button>
          <button onClick={() => onDelete(student.id)}>Delete</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../crm/TeacherCRMView', () => ({
  __esModule: true,
  default: ({ teachers }: any) => (
    <div data-testid="teacher-crm-view">
      <div>Teacher CRM View</div>
      {teachers?.map((teacher: any) => (
        <div key={teacher.id} data-testid={`teacher-${teacher.id}`}>
          {teacher.name}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../crm/ParentCRMView', () => ({
  __esModule: true,
  default: ({ parents }: any) => (
    <div data-testid="parent-crm-view">
      <div>Parent CRM View</div>
      {parents?.map((parent: any) => (
        <div key={parent.id} data-testid={`parent-${parent.id}`}>
          {parent.name}
        </div>
      ))}
    </div>
  ),
}));

describe('CRMModule', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<CRMModule />);
    expect(screen.getByText(/CRM/i)).toBeInTheDocument();
  });

  it('displays navigation tabs for different user types', () => {
    render(<CRMModule />);
    
    expect(screen.getByRole('tab', { name: /students/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /teachers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /parents/i })).toBeInTheDocument();
  });

  it('switches between different CRM views', async () => {
    render(<CRMModule />);
    
    // Initially shows students view
    expect(screen.getByTestId('student-crm-view')).toBeInTheDocument();
    
    // Switch to teachers view
    const teachersTab = screen.getByRole('tab', { name: /teachers/i });
    await user.click(teachersTab);
    
    expect(screen.getByTestId('teacher-crm-view')).toBeInTheDocument();
    expect(screen.queryByTestId('student-crm-view')).not.toBeInTheDocument();
    
    // Switch to parents view
    const parentsTab = screen.getByRole('tab', { name: /parents/i });
    await user.click(parentsTab);
    
    expect(screen.getByTestId('parent-crm-view')).toBeInTheDocument();
    expect(screen.queryByTestId('teacher-crm-view')).not.toBeInTheDocument();
  });

  it('loads students data on mount', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com', grade: '10th' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', grade: '11th' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ students: mockStudents }),
    });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/crm/students'),
      expect.any(Object)
    );
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load data/i)).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching data', async () => {
    // Mock API call with delay
    (fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ students: [] }),
        }), 100)
      )
    );

    render(<CRMModule />);
    
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it('supports search functionality', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ students: mockStudents }),
    });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Search for specific student
    const searchInput = screen.getByPlaceholderText(/Search/i);
    await user.type(searchInput, 'Jane');

    // Should filter results
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('handles student edit functionality', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ students: mockStudents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    // Should open edit modal/form
    expect(screen.getByText(/Edit Student/i)).toBeInTheDocument();
  });

  it('handles student deletion with confirmation', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ students: mockStudents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    // Should show confirmation dialog
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    
    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    // Should call delete API
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/crm/students/1'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('supports bulk operations', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ students: mockStudents }),
    });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select multiple students
    const checkbox1 = screen.getByLabelText(/Select John Doe/i);
    const checkbox2 = screen.getByLabelText(/Select Jane Smith/i);
    
    await user.click(checkbox1);
    await user.click(checkbox2);

    // Should show bulk actions
    expect(screen.getByText(/2 selected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bulk Delete/i })).toBeInTheDocument();
  });

  it('exports data to CSV', async () => {
    const mockStudents = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ students: mockStudents }),
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
    
    // Mock link click
    const mockClick = jest.fn();
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
        } as any;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<CRMModule />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByRole('button', { name: /Export CSV/i });
    await user.click(exportButton);

    // Should trigger download
    expect(mockClick).toHaveBeenCalled();
    
    // Cleanup
    document.createElement = originalCreateElement;
  });
});