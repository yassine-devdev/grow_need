import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface FinancialData {
  tuition_payments: Array<{
    id: string;
    student_name: string;
    parent_name: string;
    amount: number;
    due_date: string;
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    payment_method: string;
    transaction_id?: string;
    payment_date?: string;
  }>;
  financial_stats: {
    total_revenue: number;
    monthly_revenue: number;
    outstanding_balance: number;
    collection_rate: number;
    overdue_payments: number;
    total_students: number;
  };
  payment_plans: Array<{
    id: string;
    student_name: string;
    plan_type: 'monthly' | 'quarterly' | 'annual';
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    next_due_date: string;
    status: 'active' | 'completed' | 'defaulted';
  }>;
  financial_aid: Array<{
    id: string;
    student_name: string;
    aid_type: 'scholarship' | 'grant' | 'discount' | 'work_study';
    amount: number;
    percentage: number;
    status: 'approved' | 'pending' | 'denied';
    academic_year: string;
  }>;
  expense_categories: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage_used: number;
  }>;
}

const FinancialManagement: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('payments');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load financial data from API
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/financial-management');
        if (!response.ok) throw new Error('Failed to fetch financial data');
        const data = await response.json();
        setFinancialData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch financial data:', err);
        // Fallback to mock data
        setFinancialData({
          tuition_payments: [
            {
              id: 'PAY001',
              student_name: 'Emma Johnson',
              parent_name: 'Sarah Johnson',
              amount: 2500,
              due_date: '2024-02-01',
              status: 'paid',
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
              status: 'pending',
              payment_method: 'Bank Transfer'
            },
            {
              id: 'PAY003',
              student_name: 'Sofia Rodriguez',
              parent_name: 'Maria Rodriguez',
              amount: 2500,
              due_date: '2024-01-15',
              status: 'overdue',
              payment_method: 'Check'
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
              plan_type: 'monthly',
              total_amount: 10000,
              paid_amount: 7500,
              remaining_amount: 2500,
              next_due_date: '2024-02-01',
              status: 'active'
            },
            {
              id: 'PLAN002',
              student_name: 'Alex Thompson',
              plan_type: 'quarterly',
              total_amount: 10000,
              paid_amount: 10000,
              remaining_amount: 0,
              next_due_date: 'N/A',
              status: 'completed'
            }
          ],
          financial_aid: [
            {
              id: 'AID001',
              student_name: 'Sofia Rodriguez',
              aid_type: 'scholarship',
              amount: 5000,
              percentage: 50,
              status: 'approved',
              academic_year: '2023-2024'
            },
            {
              id: 'AID002',
              student_name: 'James Wilson',
              aid_type: 'grant',
              amount: 3000,
              percentage: 30,
              status: 'pending',
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
              category: 'Facilities & Maintenance',
              budgeted: 200000,
              spent: 145000,
              remaining: 55000,
              percentage_used: 72.5
            },
            {
              category: 'Technology',
              budgeted: 150000,
              spent: 98000,
              remaining: 52000,
              percentage_used: 65.33
            },
            {
              category: 'Educational Materials',
              budgeted: 100000,
              spent: 78000,
              remaining: 22000,
              percentage_used: 78
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // L2 Sub-categories for Financial Management
  const l2Categories = [
    { id: 'payments', name: 'Tuition Payments', icon: Icons.CreditCard, count: financialData?.tuition_payments.length || 0 },
    { id: 'payment-plans', name: 'Payment Plans', icon: Icons.Calendar, count: financialData?.payment_plans.length || 0 },
    { id: 'financial-aid', name: 'Financial Aid', icon: Icons.Heart, count: financialData?.financial_aid.length || 0 },
    { id: 'budget', name: 'Budget & Expenses', icon: Icons.PieChart, count: 0 },
    { id: 'reports', name: 'Financial Reports', icon: Icons.BarChart, count: 0 },
    { id: 'settings', name: 'Payment Settings', icon: Icons.Settings, count: 0 }
  ];

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'overdue': return 'text-red-400 bg-red-500/20';
      case 'partial': return 'text-blue-400 bg-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPlanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'completed': return 'text-blue-400 bg-blue-500/20';
      case 'defaulted': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAidStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'denied': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderL2Content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Loading financial data...</span>
        </div>
      );
    }

    if (error && !financialData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icons.AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load financial data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Icons.RefreshCw size={16} className="inline mr-2" />
            Retry
          </button>
        </div>
      );
    }

    switch (activeL2) {
      case 'payments':
        return (
          <div className="space-y-6">
            {/* Financial Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{formatCurrency(financialData?.financial_stats.total_revenue || 0)}</div>
                <div className="text-sm text-gray-400">Total Revenue</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{formatCurrency(financialData?.financial_stats.monthly_revenue || 0)}</div>
                <div className="text-sm text-gray-400">Monthly Revenue</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{formatCurrency(financialData?.financial_stats.outstanding_balance || 0)}</div>
                <div className="text-sm text-gray-400">Outstanding</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{financialData?.financial_stats.collection_rate}%</div>
                <div className="text-sm text-gray-400">Collection Rate</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{financialData?.financial_stats.overdue_payments}</div>
                <div className="text-sm text-gray-400">Overdue</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{financialData?.financial_stats.total_students}</div>
                <div className="text-sm text-gray-400">Students</div>
              </GlassmorphicContainer>
            </div>

            {/* Payments Table */}
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Payments</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    <Icons.Plus size={16} className="inline mr-2" />
                    Record Payment
                  </button>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <Icons.Download size={16} className="inline mr-2" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Student</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Parent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Due Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Method</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialData?.tuition_payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-medium">{payment.student_name}</td>
                        <td className="py-3 px-4 text-gray-300">{payment.parent_name}</td>
                        <td className="py-3 px-4 text-white font-medium">{formatCurrency(payment.amount)}</td>
                        <td className="py-3 px-4 text-gray-300">{payment.due_date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{payment.payment_method}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Eye size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Edit size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Download size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassmorphicContainer>
          </div>
        );

      case 'budget':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Budget Overview</h3>
              <div className="space-y-4">
                {financialData?.expense_categories.map((category, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{category.category}</h4>
                      <span className="text-sm text-gray-400">{category.percentage_used.toFixed(1)}% used</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Budgeted:</span>
                        <span className="text-gray-300">{formatCurrency(category.budgeted)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Spent:</span>
                        <span className="text-gray-300">{formatCurrency(category.spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="text-green-300">{formatCurrency(category.remaining)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${category.percentage_used}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icons.CreditCard size={48} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Feature Coming Soon</h3>
            <p className="text-gray-400">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Icons.CreditCard size={32} className="text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Financial Management</h2>
            <p className="text-gray-400">Manage tuition, payments, financial aid, and budgets</p>
          </div>
        </div>

        {/* L2 Navigation */}
        <div className="flex gap-2 overflow-x-auto">
          {l2Categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeL2 === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveL2(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30 text-white' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                <span className="font-medium">{category.name}</span>
                {category.count > 0 && (
                  <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderL2Content()}
      </div>
    </div>
  );
};

export default FinancialManagement;
