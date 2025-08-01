import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface CommunicationData {
  messages: Array<{
    id: string;
    sender: string;
    recipient: string;
    subject: string;
    message: string;
    timestamp: string;
    type: 'email' | 'sms' | 'notification' | 'announcement';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    priority: 'high' | 'medium' | 'low';
    category: 'academic' | 'administrative' | 'emergency' | 'event' | 'general';
  }>;
  templates: Array<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: 'email' | 'sms' | 'notification';
    category: string;
    usage_count: number;
    last_used: string;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    type: 'email' | 'sms' | 'mixed';
    status: 'draft' | 'scheduled' | 'sending' | 'completed';
    recipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    scheduled_date: string;
  }>;
  stats: {
    total_messages: number;
    messages_today: number;
    delivery_rate: number;
    open_rate: number;
    response_rate: number;
  };
}

const CommunicationCenter: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('messages');
  const [commData, setCommData] = useState<CommunicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load communication data from API
  useEffect(() => {
    const fetchCommData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/communication-center');
        if (!response.ok) throw new Error('Failed to fetch communication data');
        const data = await response.json();
        setCommData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch communication data:', err);
        // Fallback to mock data
        setCommData({
          messages: [
            {
              id: 'MSG001',
              sender: 'Principal Office',
              recipient: 'All Parents - Grade 9',
              subject: 'Parent-Teacher Conference Schedule',
              message: 'Dear parents, we are pleased to announce the upcoming parent-teacher conferences...',
              timestamp: '2024-01-20 14:30',
              type: 'email',
              status: 'delivered',
              priority: 'high',
              category: 'academic'
            },
            {
              id: 'MSG002',
              sender: 'School Nurse',
              recipient: 'Emergency Contacts',
              subject: 'Health Alert: Flu Season Precautions',
              message: 'Important health information regarding flu prevention measures...',
              timestamp: '2024-01-20 13:15',
              type: 'notification',
              status: 'sent',
              priority: 'medium',
              category: 'administrative'
            },
            {
              id: 'MSG003',
              sender: 'Athletics Department',
              recipient: 'Sports Team Parents',
              subject: 'Game Schedule Update',
              message: 'The basketball game scheduled for Friday has been rescheduled...',
              timestamp: '2024-01-20 12:00',
              type: 'sms',
              status: 'delivered',
              priority: 'low',
              category: 'event'
            }
          ],
          templates: [
            {
              id: 'TPL001',
              name: 'Weekly Progress Report',
              subject: 'Weekly Progress Report - {{student_name}}',
              content: 'Dear {{parent_name}}, here is the weekly progress report for {{student_name}}...',
              type: 'email',
              category: 'academic',
              usage_count: 45,
              last_used: '2024-01-19'
            },
            {
              id: 'TPL002',
              name: 'Event Reminder',
              subject: 'Reminder: {{event_name}}',
              content: 'This is a reminder about the upcoming {{event_name}} on {{event_date}}...',
              type: 'sms',
              category: 'event',
              usage_count: 23,
              last_used: '2024-01-18'
            },
            {
              id: 'TPL003',
              name: 'Emergency Alert',
              subject: 'URGENT: {{alert_type}}',
              content: 'This is an urgent notification regarding {{alert_details}}...',
              type: 'notification',
              category: 'emergency',
              usage_count: 3,
              last_used: '2024-01-10'
            }
          ],
          campaigns: [
            {
              id: 'CAM001',
              name: 'Spring Enrollment Campaign',
              type: 'email',
              status: 'completed',
              recipients: 500,
              sent: 500,
              delivered: 485,
              opened: 342,
              clicked: 89,
              scheduled_date: '2024-01-15'
            },
            {
              id: 'CAM002',
              name: 'Parent Survey 2024',
              type: 'mixed',
              status: 'sending',
              recipients: 300,
              sent: 180,
              delivered: 175,
              opened: 98,
              clicked: 23,
              scheduled_date: '2024-01-20'
            },
            {
              id: 'CAM003',
              name: 'Summer Program Announcement',
              type: 'email',
              status: 'scheduled',
              recipients: 450,
              sent: 0,
              delivered: 0,
              opened: 0,
              clicked: 0,
              scheduled_date: '2024-02-01'
            }
          ],
          stats: {
            total_messages: 1247,
            messages_today: 23,
            delivery_rate: 97.2,
            open_rate: 68.5,
            response_rate: 12.3
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommData();
  }, []);

  // L2 Sub-categories for Communication Center
  const l2Categories = [
    { id: 'messages', name: 'Messages', icon: Icons.MessageSquare, count: commData?.messages.length || 0 },
    { id: 'templates', name: 'Templates', icon: Icons.FileText, count: commData?.templates.length || 0 },
    { id: 'campaigns', name: 'Campaigns', icon: Icons.Megaphone, count: commData?.campaigns.length || 0 },
    { id: 'analytics', name: 'Analytics', icon: Icons.BarChart, count: 0 },
    { id: 'settings', name: 'Settings', icon: Icons.Settings, count: 0 },
    { id: 'automation', name: 'Automation', icon: Icons.Zap, count: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-400 bg-blue-500/20';
      case 'delivered': return 'text-green-400 bg-green-500/20';
      case 'read': return 'text-purple-400 bg-purple-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'completed': return 'text-green-400 bg-green-500/20';
      case 'sending': return 'text-yellow-400 bg-yellow-500/20';
      case 'scheduled': return 'text-blue-400 bg-blue-500/20';
      case 'draft': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Icons.Mail;
      case 'sms': return Icons.MessageSquare;
      case 'notification': return Icons.Bell;
      case 'announcement': return Icons.Megaphone;
      default: return Icons.MessageSquare;
    }
  };

  const renderL2Content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Loading communication data...</span>
        </div>
      );
    }

    if (error && !commData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icons.AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load communication data</h3>
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
      case 'messages':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{commData?.stats.total_messages}</div>
                <div className="text-sm text-gray-400">Total Messages</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{commData?.stats.messages_today}</div>
                <div className="text-sm text-gray-400">Today</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{commData?.stats.delivery_rate}%</div>
                <div className="text-sm text-gray-400">Delivery Rate</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{commData?.stats.open_rate}%</div>
                <div className="text-sm text-gray-400">Open Rate</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{commData?.stats.response_rate}%</div>
                <div className="text-sm text-gray-400">Response Rate</div>
              </GlassmorphicContainer>
            </div>

            {/* Messages Table */}
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  <Icons.Plus size={16} className="inline mr-2" />
                  New Message
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Recipient</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Priority</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Sent</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commData?.messages.map((message) => {
                      const TypeIcon = getTypeIcon(message.type);
                      return (
                        <tr key={message.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon size={16} className="text-blue-400" />
                              <span className="text-gray-300 text-sm">{message.type.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{message.subject}</div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">{message.message}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{message.recipient}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                              {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{message.timestamp}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Icons.Eye size={16} className="text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Icons.Copy size={16} className="text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-white/10 rounded">
                                <Icons.RefreshCw size={16} className="text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassmorphicContainer>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Message Templates</h3>
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                  <Icons.Plus size={16} className="inline mr-2" />
                  New Template
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {commData?.templates.map((template) => (
                  <div key={template.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{template.name}</h4>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                        {template.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      <div className="font-medium">{template.subject}</div>
                      <div className="truncate mt-1">{template.content}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Used {template.usage_count} times</span>
                      <span>Last: {template.last_used}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-sm">
                        Use Template
                      </button>
                      <button className="px-3 py-2 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                        <Icons.Edit size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        );

      case 'campaigns':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Communication Campaigns</h3>
                <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                  <Icons.Plus size={16} className="inline mr-2" />
                  New Campaign
                </button>
              </div>
              
              <div className="space-y-4">
                {commData?.campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">{campaign.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {campaign.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Scheduled: {campaign.scheduled_date}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{campaign.recipients}</div>
                        <div className="text-xs text-gray-400">Recipients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{campaign.sent}</div>
                        <div className="text-xs text-gray-400">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{campaign.delivered}</div>
                        <div className="text-xs text-gray-400">Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">{campaign.opened}</div>
                        <div className="text-xs text-gray-400">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{campaign.clicked}</div>
                        <div className="text-xs text-gray-400">Clicked</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-sm">
                        View Details
                      </button>
                      <button className="px-3 py-2 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30 text-sm">
                        Edit
                      </button>
                      {campaign.status === 'draft' && (
                        <button className="px-3 py-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 text-sm">
                          Launch
                        </button>
                      )}
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
            <Icons.MessageSquare size={48} className="text-gray-600 mb-4" />
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
          <Icons.MessageSquare size={32} className="text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Communication Center</h2>
            <p className="text-gray-400">Manage messages, templates, and communication campaigns</p>
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

export default CommunicationCenter;
