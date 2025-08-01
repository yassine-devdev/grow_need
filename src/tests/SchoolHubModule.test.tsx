import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SchoolHubModule from '../components/modules/school-hub/SchoolHubModule';

// Mock the AppContext
const mockAppContext = {
  activeModule: 'school-hub',
  setActiveModule: jest.fn(),
  activeOverlay: null,
  setActiveOverlay: jest.fn(),
  openOverlay: jest.fn(),
  closeOverlay: jest.fn(),
  minimizeOverlay: jest.fn(),
  isCartOpen: false,
  setIsCartOpen: jest.fn(),
  theme: 'dark',
  setTheme: jest.fn(),
  design: 'glassmorphic',
  setDesign: jest.fn(),
  isRtl: false,
  setIsRtl: jest.fn(),
  language: 'en',
  setLanguage: jest.fn()
};

jest.mock('../hooks/useAppContext', () => ({
  useAppContext: () => mockAppContext
}));

// Mock all the school hub components to avoid import errors
jest.mock('../components/modules/school-hub/school/Overview', () => {
  return function MockSchoolOverview() {
    return <div data-testid="school-overview">School Overview Component</div>;
  };
});

jest.mock('../components/modules/school-hub/school/Announcements', () => {
  return function MockAnnouncements() {
    return <div data-testid="announcements">Announcements Component</div>;
  };
});

jest.mock('../components/modules/school-hub/school/Calendar', () => {
  return function MockCalendar() {
    return <div data-testid="calendar">Calendar Component</div>;
  };
});

jest.mock('../components/modules/school-hub/school/Branding', () => {
  return function MockBranding() {
    return <div data-testid="branding">Branding Component</div>;
  };
});

jest.mock('../components/modules/school-hub/administration/StaffManagement', () => {
  return function MockStaffManagement() {
    return <div data-testid="staff-management">Staff Management Component</div>;
  };
});

jest.mock('../components/modules/school-hub/administration/Admissions', () => {
  return function MockAdmissions() {
    return <div data-testid="admissions">Admissions Component</div>;
  };
});

jest.mock('../components/modules/school-hub/administration/SystemPrompts', () => {
  return function MockSystemPrompts() {
    return <div data-testid="system-prompts">System Prompts Component</div>;
  };
});

jest.mock('../components/modules/school-hub/administration/UsageAnalytics', () => {
  return function MockUsageAnalytics() {
    return <div data-testid="usage-analytics">Usage Analytics Component</div>;
  };
});

jest.mock('../components/modules/school-hub/teacher/Home', () => {
  return function MockTeacherHome() {
    return <div data-testid="teacher-home">Teacher Home Component</div>;
  };
});

jest.mock('../components/modules/school-hub/teacher/MyClasses', () => {
  return function MockMyClasses() {
    return <div data-testid="my-classes">My Classes Component</div>;
  };
});

jest.mock('../components/modules/school-hub/teacher/Gradebook', () => {
  return function MockGradebook() {
    return <div data-testid="gradebook">Gradebook Component</div>;
  };
});

jest.mock('../components/modules/school-hub/teacher/Assignments', () => {
  return function MockAssignments() {
    return <div data-testid="assignments">Assignments Component</div>;
  };
});

jest.mock('../components/modules/school-hub/teacher/Attendance', () => {
  return function MockAttendance() {
    return <div data-testid="attendance">Attendance Component</div>;
  };
});

// Mock other components that are referenced in the module
jest.mock('../components/modules/school-hub/finance/TuitionAndFees', () => {
  return function MockTuitionAndFees() {
    return <div data-testid="tuition-fees">Tuition and Fees Component</div>;
  };
});

jest.mock('../components/modules/school-hub/finance/Invoicing', () => {
  return function MockInvoicing() {
    return <div data-testid="invoicing">Invoicing Component</div>;
  };
});

jest.mock('../components/modules/school-hub/finance/Payroll', () => {
  return function MockPayroll() {
    return <div data-testid="payroll">Payroll Component</div>;
  };
});

jest.mock('../components/modules/school-hub/finance/Budgeting', () => {
  return function MockBudgeting() {
    return <div data-testid="budgeting">Budgeting Component</div>;
  };
});

jest.mock('../components/modules/school-hub/marketing/Campaigns', () => {
  return function MockCampaigns() {
    return <div data-testid="campaigns">Campaigns Component</div>;
  };
});

jest.mock('../components/modules/school-hub/marketing/LeadManagement', () => {
  return function MockLeadManagement() {
    return <div data-testid="lead-management">Lead Management Component</div>;
  };
});

jest.mock('../components/modules/school-hub/marketing/WebsiteAnalytics', () => {
  return function MockWebsiteAnalytics() {
    return <div data-testid="website-analytics">Website Analytics Component</div>;
  };
});

jest.mock('../components/modules/school-hub/student/Home', () => {
  return function MockStudentHome() {
    return <div data-testid="student-home">Student Home Component</div>;
  };
});

jest.mock('../components/modules/school-hub/student/MyProfile', () => {
  return function MockMyProfile() {
    return <div data-testid="my-profile">My Profile Component</div>;
  };
});

jest.mock('../components/modules/school-hub/student/MyGrades', () => {
  return function MockMyGrades() {
    return <div data-testid="my-grades">My Grades Component</div>;
  };
});

jest.mock('../components/modules/school-hub/student/MySchedule', () => {
  return function MockMySchedule() {
    return <div data-testid="my-schedule">My Schedule Component</div>;
  };
});

jest.mock('../components/modules/school-hub/student/LibraryAccess', () => {
  return function MockLibraryAccess() {
    return <div data-testid="library-access">Library Access Component</div>;
  };
});

jest.mock('../components/modules/school-hub/parent/Home', () => {
  return function MockParentHome() {
    return <div data-testid="parent-home">Parent Home Component</div>;
  };
});

jest.mock('../components/modules/school-hub/parent/LearningPulseTracker', () => {
  return function MockLearningPulseTracker() {
    return <div data-testid="learning-pulse-tracker">Learning Pulse Tracker Component</div>;
  };
});

jest.mock('../components/modules/school-hub/parent/ParentCommunication', () => {
  return function MockParentCommunication() {
    return <div data-testid="parent-communication">Parent Communication Component</div>;
  };
});

jest.mock('../components/modules/school-hub/parent/Billing', () => {
  return function MockBilling() {
    return <div data-testid="billing">Billing Component</div>;
  };
});

jest.mock('../components/modules/school-hub/parent/SchoolEvents', () => {
  return function MockSchoolEvents() {
    return <div data-testid="school-events">School Events Component</div>;
  };
});

describe('SchoolHubModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<SchoolHubModule />);
    expect(screen.getByText('School Hub')).toBeInTheDocument();
  });

  test('displays L1 navigation tabs', () => {
    render(<SchoolHubModule />);
    
    // Check for L1 tabs
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Teacher')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
  });

  test('switches between L1 tabs', () => {
    render(<SchoolHubModule />);
    
    // Click on Teacher tab
    fireEvent.click(screen.getByText('Teacher'));
    
    // Should show teacher-related content
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My Classes')).toBeInTheDocument();
    expect(screen.getByText('Gradebook')).toBeInTheDocument();
  });

  test('displays L2 navigation items for each tab', () => {
    render(<SchoolHubModule />);
    
    // Default should be Parent tab, check for L2 items
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Learning Pulse Tracker')).toBeInTheDocument();
  });

  test('renders active component', () => {
    render(<SchoolHubModule />);
    
    // Should render the default active component (Parent Home)
    expect(screen.getByTestId('parent-home')).toBeInTheDocument();
  });

  test('switches L2 components when clicked', () => {
    render(<SchoolHubModule />);
    
    // Click on Learning Pulse Tracker
    fireEvent.click(screen.getByText('Learning Pulse Tracker'));
    
    // Should render the Learning Pulse Tracker component
    expect(screen.getByTestId('learning-pulse-tracker')).toBeInTheDocument();
  });

  test('maintains state when switching between tabs', () => {
    render(<SchoolHubModule />);
    
    // Switch to Teacher tab
    fireEvent.click(screen.getByText('Teacher'));
    expect(screen.getByTestId('teacher-home')).toBeInTheDocument();
    
    // Switch to Student tab
    fireEvent.click(screen.getByText('Student'));
    expect(screen.getByTestId('student-home')).toBeInTheDocument();
    
    // Switch back to Teacher tab
    fireEvent.click(screen.getByText('Teacher'));
    expect(screen.getByTestId('teacher-home')).toBeInTheDocument();
  });

  test('handles missing components gracefully', () => {
    render(<SchoolHubModule />);
    
    // The module should render even if some components are missing
    expect(screen.getByText('School Hub')).toBeInTheDocument();
  });
});
