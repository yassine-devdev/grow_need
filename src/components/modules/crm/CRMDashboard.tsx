import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface DashboardData {
  overview_stats: {
    total_students: number;
    total_parents: number;
    pending_applications: number;
    active_communications: number;
    monthly_revenue: number;
    overdue_payments: number;
    content_pending_approval: number;
    ai_interactions_today: number;
  };
  recent_activities: Array<{
    id: string;
    type: 'enrollment' | 'payment' | 'communication' | 'content' | 'ai_interaction';
    description: string;
    timestamp: string;
    user: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  quick_stats: {
    enrollment_rate: number;
    payment_collection_rate: number;
    parent_engagement: number;
    content_approval_rate: number;
    ai_satisfaction: number;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    action_required: boolean;
  }>;
  upcoming_deadlines: Array<{
    id: string;
    title: string;
    date: string;
    type: 'enrollment' | 'payment' | 'event' | 'report';
    priority: 'high' | 'medium' | 'low';
  }>;
}

const CRMDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch dashboard data:', err);
        // Fallback to mock data
        setDashboardData({
          overview_stats: {
            total_students: 1247,
            total_parents: 892,
            pending_applications: 23,
            active_communications: 156,
            monthly_revenue: 125000,
            overdue_payments: 8,
            content_pending_approval: 12,
            ai_interactions_today: 342
          },
          recent_activities: [
            {
              id: 'ACT001',
              type: 'enrollment',
              description: 'New application submitted by Emma Johnson',
              timestamp: '2024-01-20 14:30',
              user: 'Sarah Johnson',
              priority: 'medium'
            },
            {
              id: 'ACT002',
              type: 'payment',
              description: 'Payment received from David Chen - $2,500',
              timestamp: '2024-01-20 13:45',
              user: 'David Chen',
              priority: 'low'
            },
            {
              id: 'ACT003',
              type: 'communication',
              description: 'Parent-teacher conference reminder sent to 150 parents',
              timestamp: '2024-01-20 12:15',
              user: 'System',
              priority: 'medium'
            },
            {
              id: 'ACT004',
              type: 'content',
              description: 'Math curriculum content approved by Dr. Smith',
              timestamp: '2024-01-20 11:30',
              user: 'Dr. Smith',
              priority: 'low'
            },
            {
              id: 'ACT005',
              type: 'ai_interaction',
              description: 'AI Concierge helped 25 parents with enrollment questions',
              timestamp: '2024-01-20 10:45',
              user: 'AI System',
              priority: 'low'
            }
          ],
          quick_stats: {
            enrollment_rate: 92.5,
            payment_collection_rate: 96.2,
            parent_engagement: 78.3,
            content_approval_rate: 89.1,
            ai_satisfaction: 4.7
          },
          alerts: [
            {
              id: 'ALERT001',
              type: 'warning',
              title: 'Overdue Payments',
              message: '8 payments are overdue and require immediate attention',
              timestamp: '2024-01-20 09:00',
              action_required: true
            },
            {
              id: 'ALERT002',
              type: 'info',
              title: 'Enrollment Deadline Approaching',
              message: 'Spring semester enrollment deadline is in 5 days',
              timestamp: '2024-01-20 08:30',
              action_required: false
            },
            {
              id: 'ALERT003',
              type: 'success',
              title: 'Monthly Revenue Target Met',
              message: 'Congratulations! Monthly revenue target has been achieved',
              timestamp: '2024-01-20 08:00',
              action_required: false
            }
          ],
          upcoming_deadlines: [
            {
              id: 'DEAD001',
              title: 'Spring Enrollment Deadline',
              date: '2024-02-15',
              type: 'enrollment',
              priority: 'high'
            },
            {
              id: 'DEAD002',
              title: 'Monthly Financial Report',
              date: '2024-02-01',
              type: 'report',
              priority: 'medium'
            },
            {
              id: 'DEAD003',
              title: 'Parent-Teacher Conferences',
              date: '2024-02-10',
              type: 'event',
              priority: 'medium'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return Icons.GraduationCap;
      case 'payment': return Icons.CreditCard;
      case 'communication': return Icons.MessageSquare;
      case 'content': return Icons.BookCopy;
      case 'ai_interaction': return Icons.Bot;
      default: return Icons.Activity;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Icons.AlertTriangle size={48} className="text-red-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load dashboard</h3>
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

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">CRM Dashboard</h2>
          <p className="text-gray-400">Overview of all school CRM activities and metrics</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Icons.RefreshCw size={16} className="inline mr-2" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
            <Icons.Download size={16} className="inline mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.GraduationCap size={24} className="mx-auto mb-2 text-blue-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.total_students}</div>
          <div className="text-sm text-gray-400">Total Students</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.Users size={24} className="mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.total_parents}</div>
          <div className="text-sm text-gray-400">Total Parents</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.FileText size={24} className="mx-auto mb-2 text-yellow-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.pending_applications}</div>
          <div className="text-sm text-gray-400">Pending Apps</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.MessageSquare size={24} className="mx-auto mb-2 text-purple-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.active_communications}</div>
          <div className="text-sm text-gray-400">Communications</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.CreditCard size={24} className="mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-bold text-white">{formatCurrency(dashboardData?.overview_stats.monthly_revenue || 0)}</div>
          <div className="text-sm text-gray-400">Monthly Revenue</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.AlertTriangle size={24} className="mx-auto mb-2 text-red-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.overdue_payments}</div>
          <div className="text-sm text-gray-400">Overdue</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.BookCopy size={24} className="mx-auto mb-2 text-orange-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.content_pending_approval}</div>
          <div className="text-sm text-gray-400">Content Pending</div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4 text-center">
          <Icons.Bot size={24} className="mx-auto mb-2 text-cyan-400" />
          <div className="text-2xl font-bold text-white">{dashboardData?.overview_stats.ai_interactions_today}</div>
          <div className="text-sm text-gray-400">AI Interactions</div>
        </GlassmorphicContainer>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <GlassmorphicContainer className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Enrollment Rate</span>
            <span className="text-white font-bold">{dashboardData?.quick_stats.enrollment_rate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full" 
              style={{ width: `${dashboardData?.quick_stats.enrollment_rate}%` }}
            ></div>
          </div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Collection Rate</span>
            <span className="text-white font-bold">{dashboardData?.quick_stats.payment_collection_rate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full" 
              style={{ width: `${dashboardData?.quick_stats.payment_collection_rate}%` }}
            ></div>
          </div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Parent Engagement</span>
            <span className="text-white font-bold">{dashboardData?.quick_stats.parent_engagement}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-400 h-2 rounded-full" 
              style={{ width: `${dashboardData?.quick_stats.parent_engagement}%` }}
            ></div>
          </div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Content Approval</span>
            <span className="text-white font-bold">{dashboardData?.quick_stats.content_approval_rate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-orange-400 h-2 rounded-full" 
              style={{ width: `${dashboardData?.quick_stats.content_approval_rate}%` }}
            ></div>
          </div>
        </GlassmorphicContainer>
        <GlassmorphicContainer className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">AI Satisfaction</span>
            <span className="text-white font-bold">{dashboardData?.quick_stats.ai_satisfaction}/5</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-400 h-2 rounded-full" 
              style={{ width: `${(dashboardData?.quick_stats.ai_satisfaction || 0) * 20}%` }}
            ></div>
          </div>
        </GlassmorphicContainer>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <GlassmorphicContainer className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {dashboardData?.recent_activities.map((activity) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <ActivityIcon size={20} className="text-blue-400" />
                    <div className="flex-1">
                      <div className="font-medium text-white">{activity.description}</div>
                      <div className="text-sm text-gray-400">{activity.user} • {activity.timestamp}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassmorphicContainer>
        </div>

        {/* Alerts & Deadlines */}
        <div className="space-y-6">
          {/* Alerts */}
          <GlassmorphicContainer className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
            <div className="space-y-3">
              {dashboardData?.alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    {alert.action_required && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                  <p className="text-xs opacity-70 mt-1">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </GlassmorphicContainer>

          {/* Upcoming Deadlines */}
          <GlassmorphicContainer className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {dashboardData?.upcoming_deadlines.map((deadline) => (
                <div key={deadline.id} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white">{deadline.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                      {deadline.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">{deadline.date}</div>
                  <div className="text-xs text-gray-500 mt-1">{deadline.type}</div>
                </div>
              ))}
            </div>
          </GlassmorphicContainer>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
