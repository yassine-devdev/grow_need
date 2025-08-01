import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface ParentPortalData {
  parent_accounts: Array<{
    id: string;
    parent_name: string;
    email: string;
    phone: string;
    students: Array<{name: string; grade: string; class: string}>;
    last_login: string;
    account_status: 'active' | 'inactive' | 'pending';
    communication_preferences: {
      email: boolean;
      sms: boolean;
      app_notifications: boolean;
    };
    engagement_score: number;
  }>;
  portal_stats: {
    total_parents: number;
    active_users: number;
    pending_activation: number;
    monthly_logins: number;
    avg_engagement: number;
  };
  recent_activities: Array<{
    parent_name: string;
    activity: string;
    timestamp: string;
    type: 'login' | 'message' | 'document' | 'payment' | 'event';
  }>;
  communication_logs: Array<{
    id: string;
    parent_name: string;
    subject: string;
    type: 'email' | 'sms' | 'notification';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    sent_date: string;
  }>;
}

const ParentPortal: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('accounts');
  const [portalData, setPortalData] = useState<ParentPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load parent portal data from API
  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/parent-portal');
        if (!response.ok) throw new Error('Failed to fetch parent portal data');
        const data = await response.json();
        setPortalData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch parent portal data:', err);
        // Fallback to mock data
        setPortalData({
          parent_accounts: [
            {
              id: 'PAR001',
              parent_name: 'Sarah Johnson',
              email: 'sarah.johnson@email.com',
              phone: '+1 (555) 123-4567',
              students: [
                { name: 'Emma Johnson', grade: '9th Grade', class: '9A' },
                { name: 'Jake Johnson', grade: '7th Grade', class: '7B' }
              ],
              last_login: '2024-01-20',
              account_status: 'active',
              communication_preferences: {
                email: true,
                sms: true,
                app_notifications: false
              },
              engagement_score: 85
            },
            {
              id: 'PAR002',
              parent_name: 'David Chen',
              email: 'david.chen@email.com',
              phone: '+1 (555) 234-5678',
              students: [
                { name: 'Michael Chen', grade: '10th Grade', class: '10A' }
              ],
              last_login: '2024-01-19',
              account_status: 'active',
              communication_preferences: {
                email: true,
                sms: false,
                app_notifications: true
              },
              engagement_score: 92
            },
            {
              id: 'PAR003',
              parent_name: 'Maria Rodriguez',
              email: 'maria.rodriguez@email.com',
              phone: '+1 (555) 345-6789',
              students: [
                { name: 'Sofia Rodriguez', grade: '11th Grade', class: '11B' }
              ],
              last_login: 'Never',
              account_status: 'pending',
              communication_preferences: {
                email: true,
                sms: true,
                app_notifications: true
              },
              engagement_score: 0
            }
          ],
          portal_stats: {
            total_parents: 245,
            active_users: 198,
            pending_activation: 47,
            monthly_logins: 1456,
            avg_engagement: 78
          },
          recent_activities: [
            {
              parent_name: 'Sarah Johnson',
              activity: 'Viewed grade report for Emma Johnson',
              timestamp: '2024-01-20 14:30',
              type: 'document'
            },
            {
              parent_name: 'David Chen',
              activity: 'Sent message to Math teacher',
              timestamp: '2024-01-20 13:45',
              type: 'message'
            },
            {
              parent_name: 'Lisa Wang',
              activity: 'Made tuition payment',
              timestamp: '2024-01-20 12:15',
              type: 'payment'
            },
            {
              parent_name: 'Robert Smith',
              activity: 'Registered for parent-teacher conference',
              timestamp: '2024-01-20 11:30',
              type: 'event'
            }
          ],
          communication_logs: [
            {
              id: 'COM001',
              parent_name: 'Sarah Johnson',
              subject: 'Weekly Progress Report - Emma Johnson',
              type: 'email',
              status: 'read',
              sent_date: '2024-01-19'
            },
            {
              id: 'COM002',
              parent_name: 'David Chen',
              subject: 'Upcoming Parent-Teacher Conference',
              type: 'sms',
              status: 'delivered',
              sent_date: '2024-01-19'
            },
            {
              id: 'COM003',
              parent_name: 'Maria Rodriguez',
              subject: 'Account Activation Required',
              type: 'email',
              status: 'sent',
              sent_date: '2024-01-18'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortalData();
  }, []);

  // L2 Sub-categories for Parent Portal
  const l2Categories = [
    { id: 'accounts', name: 'Parent Accounts', icon: Icons.Users, count: portalData?.portal_stats.total_parents || 0 },
    { id: 'communications', name: 'Communications', icon: Icons.MessageSquare, count: portalData?.communication_logs.length || 0 },
    { id: 'engagement', name: 'Engagement', icon: Icons.TrendingUp, count: 0 },
    { id: 'activities', name: 'Activities', icon: Icons.Activity, count: portalData?.recent_activities.length || 0 },
    { id: 'settings', name: 'Portal Settings', icon: Icons.Settings, count: 0 },
    { id: 'reports', name: 'Reports', icon: Icons.BarChart, count: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'inactive': return 'text-gray-400 bg-gray-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getCommunicationStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'text-green-400 bg-green-500/20';
      case 'delivered': return 'text-blue-400 bg-blue-500/20';
      case 'sent': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return Icons.LogIn;
      case 'message': return Icons.MessageSquare;
      case 'document': return Icons.FileText;
      case 'payment': return Icons.CreditCard;
      case 'event': return Icons.Calendar;
      default: return Icons.Activity;
    }
  };

  const renderL2Content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Loading parent portal data...</span>
        </div>
      );
    }

    if (error && !portalData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icons.AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load parent portal data</h3>
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
      case 'accounts':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{portalData?.portal_stats.total_parents}</div>
                <div className="text-sm text-gray-400">Total Parents</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{portalData?.portal_stats.active_users}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{portalData?.portal_stats.pending_activation}</div>
                <div className="text-sm text-gray-400">Pending Activation</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{portalData?.portal_stats.monthly_logins}</div>
                <div className="text-sm text-gray-400">Monthly Logins</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{portalData?.portal_stats.avg_engagement}%</div>
                <div className="text-sm text-gray-400">Avg Engagement</div>
              </GlassmorphicContainer>
            </div>

            {/* Parent Accounts Table */}
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Parent Accounts</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                    <Icons.UserPlus size={16} className="inline mr-2" />
                    Add Parent
                  </button>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                    <Icons.Mail size={16} className="inline mr-2" />
                    Send Invites
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Parent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Students</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Last Login</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Engagement</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalData?.parent_accounts.map((parent) => (
                      <tr key={parent.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="font-medium text-white">{parent.parent_name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {parent.students.map((student, index) => (
                              <div key={index} className="text-sm">
                                <span className="text-gray-300">{student.name}</span>
                                <span className="text-gray-500 ml-2">({student.grade})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-gray-300">{parent.email}</div>
                            <div className="text-gray-500">{parent.phone}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(parent.account_status)}`}>
                            {parent.account_status.charAt(0).toUpperCase() + parent.account_status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{parent.last_login}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-white font-medium">{parent.engagement_score}%</span>
                            <div className="ml-2 w-16 h-2 bg-gray-700 rounded-full">
                              <div 
                                className="h-full bg-blue-400 rounded-full" 
                                style={{ width: `${parent.engagement_score}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Eye size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Edit size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.MessageSquare size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Settings size={16} className="text-gray-400" />
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

      case 'communications':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Communication Logs</h3>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  <Icons.Send size={16} className="inline mr-2" />
                  New Message
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Parent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portalData?.communication_logs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white font-medium">{log.parent_name}</td>
                        <td className="py-3 px-4 text-gray-300">{log.subject}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                            {log.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommunicationStatusColor(log.status)}`}>
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{log.sent_date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.Eye size={16} className="text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded">
                              <Icons.RefreshCw size={16} className="text-gray-400" />
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

      case 'activities':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Parent Activities</h3>
              <div className="space-y-3">
                {portalData?.recent_activities.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <ActivityIcon size={20} className="text-blue-400" />
                      <div className="flex-1">
                        <div className="font-medium text-white">{activity.parent_name}</div>
                        <div className="text-sm text-gray-400">{activity.activity}</div>
                      </div>
                      <div className="text-sm text-gray-500">{activity.timestamp}</div>
                    </div>
                  );
                })}
              </div>
            </GlassmorphicContainer>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Icons.Users size={48} className="text-gray-600 mb-4" />
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
          <Icons.Users size={32} className="text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Parent Portal</h2>
            <p className="text-gray-400">Manage parent accounts, communications, and engagement</p>
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

export default ParentPortal;
