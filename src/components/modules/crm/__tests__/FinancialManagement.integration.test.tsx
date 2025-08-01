import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinancialManagement from '../FinancialManagement';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockFinancialData = {
  tuition_payments: [
    {
      id: 'PAY001',
      student_name: 'Emma Johnson',
      parent_name: 'Sarah Johnson',
      amount: 2500,
      due_date: '2024-02-01',
      status: 'paid' as const,
      payment_method: 'Credit Card',
      transaction_id: 'TXN123456',
      payment_date: '2024-01-28'
    },
    {
      id: 'PAY002',
      student_name: 'Michael Chen',
      parent_name: 'David Chen',
      amount: 2500,
      due_date: '2024-02-01',
      status: 'pending' as const,
      payment_method: 'Bank Transfer'
    }
  ],
  financial_stats: {
    total_revenue: 1250000,
    monthly_revenue: 125000,
    outstanding_balance: 45000,
    collection_rate: 96.2,
    overdue_payments: 8,
    total_students: 500
  },
  payment_plans: [
    {
      id: 'PLAN001',
      student_name: 'Emma Johnson',
      plan_type: 'monthly' as const,
      total_amount: 10000,
      paid_amount: 7500,
      remaining_amount: 2500,
      next_due_date: '2024-02-01',
      status: 'active' as const
    }
  ],
  financial_aid: [
    {
      id: 'AID001',
      student_name: 'Sofia Rodriguez',
      aid_type: 'scholarship' as const,
      amount: 5000,
      percentage: 50,
      status: 'approved' as const,
      academic_year: '2023-2024'
    }
  ],
  expense_categories: [
    {
      category: 'Faculty Salaries',
      budgeted: 800000,
      spent: 650000,
      remaining: 150000,
      percentage_used: 81.25
    },
    {
      category: 'Technology',
      budgeted: 150000,
      spent: 98000,
      remaining: 52000,
      percentage_used: 65.33
    }
  ]
};

describe('FinancialManagement Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering and Initial Load', () => {
    it('should render the component with correct header and navigation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });

      render(<FinancialManagement />);

      // Check header elements
      expect(screen.getByText('Financial Management')).toBeInTheDocument();
      expect(screen.getByText('Manage tuition, payments, financial aid, and budgets')).toBeInTheDocument();

      // Check L2 navigation buttons
      expect(screen.getByText('Tuition Payments')).toBeInTheDocument();
      expect(screen.getByText('Payment Plans')).toBeInTheDocument();
      expect(screen.getByText('Financial Aid')).toBeInTheDocument();
      expect(screen.getByText('Budget & Expenses')).toBeInTheDocument();
      expect(screen.getByText('Financial Reports')).toBeInTheDocument();
      expect(screen.getByText('Payment Settings')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // Total revenue
      });
    });

    it('should show loading state initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<FinancialManagement />);

      expect(screen.getByText('Loading financial data...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
    });

    it('should handle API errors gracefully and show fallback data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      render(<FinancialManagement />);

      await waitFor(() => {
        // Should show fallback data when API fails
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // Total revenue from fallback
      });
    });
  });

  describe('API Integration', () => {
    it('should make correct API call on component mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });

      render(<FinancialManagement />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/financial-management');
      });
    });

    it('should handle successful API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });

      render(<FinancialManagement />);

      await waitFor(() => {
        // Check if data is displayed correctly
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // Total revenue
        expect(screen.getByText('$125,000')).toBeInTheDocument(); // Monthly revenue
      });
    });
  });

  describe('L2 Navigation Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should switch to Tuition Payments tab by default', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const paymentsTab = screen.getByText('Tuition Payments');
        expect(paymentsTab.closest('button')).toHaveClass('bg-blue-500/20');
      });
    });

    it('should switch to Budget & Expenses tab when clicked', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const budgetTab = screen.getByText('Budget & Expenses');
        fireEvent.click(budgetTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Budget Overview')).toBeInTheDocument();
        expect(screen.getByText('Faculty Salaries')).toBeInTheDocument();
        expect(screen.getByText('Technology')).toBeInTheDocument();
      });
    });

    it('should show "Feature Coming Soon" for unimplemented tabs', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const reportsTab = screen.getByText('Financial Reports');
        fireEvent.click(reportsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Feature Coming Soon')).toBeInTheDocument();
        expect(screen.getByText('This section is under development')).toBeInTheDocument();
      });
    });
  });

  describe('Tuition Payments Tab Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should display financial statistics correctly', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // Total Revenue
        expect(screen.getByText('$125,000')).toBeInTheDocument(); // Monthly Revenue
        expect(screen.getByText('$45,000')).toBeInTheDocument(); // Outstanding
        expect(screen.getByText('96.2%')).toBeInTheDocument(); // Collection Rate
        expect(screen.getByText('8')).toBeInTheDocument(); // Overdue
        expect(screen.getByText('500')).toBeInTheDocument(); // Students
      });
    });

    it('should display payments table with correct data', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Parent')).toBeInTheDocument();
        expect(screen.getByText('Amount')).toBeInTheDocument();
        expect(screen.getByText('Due Date')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Method')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();

        // Check payment data
        expect(screen.getByText('Emma Johnson')).toBeInTheDocument();
        expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
        expect(screen.getByText('$2,500')).toBeInTheDocument();
        expect(screen.getByText('2024-02-01')).toBeInTheDocument();
        expect(screen.getByText('Paid')).toBeInTheDocument();
        expect(screen.getByText('Credit Card')).toBeInTheDocument();

        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('David Chen')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
      });
    });

    it('should show correct payment status colors', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const paidStatus = screen.getByText('Paid');
        const pendingStatus = screen.getByText('Pending');
        
        expect(paidStatus).toHaveClass('text-green-400');
        expect(pendingStatus).toHaveClass('text-yellow-400');
      });
    });

    it('should format currency correctly', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        // Check for proper currency formatting
        expect(screen.getByText('$1,250,000')).toBeInTheDocument();
        expect(screen.getByText('$125,000')).toBeInTheDocument();
        expect(screen.getByText('$45,000')).toBeInTheDocument();
        expect(screen.getByText('$2,500')).toBeInTheDocument();
      });
    });
  });

  describe('Budget & Expenses Tab Functionality', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should display budget information correctly', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const budgetTab = screen.getByText('Budget & Expenses');
        fireEvent.click(budgetTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Budget Overview')).toBeInTheDocument();
        expect(screen.getByText('Faculty Salaries')).toBeInTheDocument();
        expect(screen.getByText('81.3% used')).toBeInTheDocument();
        expect(screen.getByText('Budgeted:')).toBeInTheDocument();
        expect(screen.getByText('$800,000')).toBeInTheDocument();
        expect(screen.getByText('Spent:')).toBeInTheDocument();
        expect(screen.getByText('$650,000')).toBeInTheDocument();
        expect(screen.getByText('Remaining:')).toBeInTheDocument();
        expect(screen.getByText('$150,000')).toBeInTheDocument();

        expect(screen.getByText('Technology')).toBeInTheDocument();
        expect(screen.getByText('65.3% used')).toBeInTheDocument();
        expect(screen.getByText('$98,000')).toBeInTheDocument();
        expect(screen.getByText('$52,000')).toBeInTheDocument();
      });
    });

    it('should show budget progress bars', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const budgetTab = screen.getByText('Budget & Expenses');
        fireEvent.click(budgetTab);
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should handle Record Payment button click', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const recordPaymentButton = screen.getByText('Record Payment');
        expect(recordPaymentButton).toBeInTheDocument();
        
        fireEvent.click(recordPaymentButton);
        // In a real implementation, this would open a payment form
      });
    });

    it('should handle Export button click', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        const exportButton = screen.getByText('Export');
        expect(exportButton).toBeInTheDocument();
        
        fireEvent.click(exportButton);
        // In a real implementation, this would trigger export functionality
      });
    });

    it('should handle action buttons in payments table', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        // Check for action buttons (view, edit, download)
        const actionButtons = screen.getAllByRole('button');
        const viewButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="eye-icon"]')
        );
        const editButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="edit-icon"]')
        );
        const downloadButtons = actionButtons.filter(button => 
          button.querySelector('[data-testid="download-icon"]')
        );

        expect(viewButtons.length).toBeGreaterThan(0);
        expect(editButtons.length).toBeGreaterThan(0);
        expect(downloadButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Display and Formatting', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should show correct badge counts in navigation', async () => {
      render(<FinancialManagement />);

      await waitFor(() => {
        // Tuition Payments tab should show count
        const paymentsTab = screen.getByText('Tuition Payments').closest('button');
        expect(paymentsTab).toHaveTextContent('2');
        
        // Payment Plans tab should show count
        const plansTab = screen.getByText('Payment Plans').closest('button');
        expect(plansTab).toHaveTextContent('1');
        
        // Financial Aid tab should show count
        const aidTab = screen.getByText('Financial Aid').closest('button');
        expect(aidTab).toHaveTextContent('1');
      });
    });

    it('should handle empty data gracefully', async () => {
      const emptyData = {
        tuition_payments: [],
        financial_stats: {
          total_revenue: 0,
          monthly_revenue: 0,
          outstanding_balance: 0,
          collection_rate: 0,
          overdue_payments: 0,
          total_students: 0
        },
        payment_plans: [],
        financial_aid: [],
        expense_categories: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyData,
      });

      render(<FinancialManagement />);

      await waitFor(() => {
        expect(screen.getByText('$0')).toBeInTheDocument(); // Should show $0 for stats
      });
    });
  });

  describe('Responsive Design and Accessibility', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData,
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(<FinancialManagement />);

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
      render(<FinancialManagement />);

      await waitFor(() => {
        const budgetTab = screen.getByText('Budget & Expenses');
        
        // Simulate keyboard navigation
        budgetTab.focus();
        fireEvent.keyDown(budgetTab, { key: 'Enter' });
        
        // Should switch to budget tab
        expect(screen.getByText('Budget Overview')).toBeInTheDocument();
      });
    });
  });
});
