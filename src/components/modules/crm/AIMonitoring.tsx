import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface AIData {
  conversations: Array<{id: string; user: string; query: string; response: string; time: string; satisfaction: number; category: string}>;
  performance_metrics: {response_time: string; success_rate: string; user_satisfaction: string; daily_queries: string};
  model_health: Array<{name: string; status: string; memory: string; cpu: string; uptime: string}>;
  feedback_summary: Array<{rating: number; count: number; percentage: number}>;
  stats: {total_conversations: number; avg_satisfaction: number; models_running: number};
}

const AIMonitoring: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('concierge-performance');
  const [aiData, setAiData] = useState<AIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load AI data from API
  useEffect(() => {
    const fetchAIData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/ai-monitoring');
        if (!response.ok) throw new Error('Failed to fetch AI data');
        const data = await response.json();
        setAiData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch AI data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIData();
  }, []);

  // L2 Sub-categories for AI Monitoring
  const l2Categories = [
    { id: 'concierge-performance', name: 'Concierge Performance', icon: Icons.BrainCircuit, count: 0 },
    { id: 'usage-analytics', name: 'Usage Analytics', icon: Icons.BarChart, count: 0 },
    { id: 'ai-conversations', name: 'AI Conversations', icon: Icons.MessageSquare, count: aiData?.stats.total_conversations || 0 },
    { id: 'model-health', name: 'Model Health', icon: Icons.Heart, count: aiData?.stats.models_running || 0 },
    { id: 'response-quality', name: 'Response Quality', icon: Icons.Star, count: 0 },
    { id: 'ai-feedback', name: 'AI Feedback', icon: Icons.ThumbsUp, count: aiData?.feedback_summary.reduce((sum, f) => sum + f.count, 0) || 0 }
  ];

  const renderL2Content = () => {
    const currentL2 = l2Categories.find(item => item.id === activeL2);
    if (!currentL2) return null;

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <currentL2.icon size={32} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">{currentL2.name}</h3>
            <p className="text-gray-400">
              {currentL2.count > 0 ? `${currentL2.count} items` : 'Real-time monitoring'}
            </p>
          </div>
        </div>

        {/* Content based on selected L2 category */}
        {activeL2 === 'concierge-performance' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">AI Concierge Performance Metrics</h4>
              
              {/* Performance Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Response Time', value: '1.2s', icon: Icons.Clock, color: 'green', trend: '+5%' },
                  { label: 'Success Rate', value: '94.8%', icon: Icons.CheckCircle, color: 'blue', trend: '+2%' },
                  { label: 'User Satisfaction', value: '4.6/5', icon: Icons.Star, color: 'yellow', trend: '+0.3' },
                  { label: 'Daily Queries', value: '2,847', icon: Icons.MessageSquare, color: 'purple', trend: '+12%' }
                ].map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon size={20} className={`text-${metric.color}-400`} />
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <span className="text-green-400 text-sm">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Performance Issues */}
              <div>
                <h5 className="text-white font-medium mb-3">Recent Performance Alerts</h5>
                <div className="space-y-2">
                  {[
                    { type: 'Warning', message: 'Response time spike detected at 14:30', time: '2 hours ago', severity: 'medium' },
                    { type: 'Info', message: 'Model updated successfully', time: '6 hours ago', severity: 'low' },
                    { type: 'Success', message: 'Performance optimization completed', time: '1 day ago', severity: 'low' }
                  ].map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      alert.severity === 'medium' 
                        ? 'bg-orange-500/10 border-orange-500/20' 
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            alert.type === 'Warning' 
                              ? 'bg-orange-500/20 text-orange-300'
                              : alert.type === 'Success'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {alert.type}
                          </span>
                          <span className="text-white text-sm">{alert.message}</span>
                        </div>
                        <span className="text-gray-400 text-xs">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'usage-analytics' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">AI Usage Analytics</h4>
              
              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Total Interactions', value: '45,892', period: 'This month', icon: Icons.MessageSquare },
                  { label: 'Active Users', value: '1,234', period: 'Last 7 days', icon: Icons.Users },
                  { label: 'Peak Usage', value: '14:30', period: 'Daily average', icon: Icons.TrendingUp }
                ].map((stat, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={20} className="text-blue-400" />
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-500 text-sm">{stat.period}</p>
                  </div>
                ))}
              </div>

              {/* Popular Query Categories */}
              <div>
                <h5 className="text-white font-medium mb-3">Most Common Query Types</h5>
                <div className="space-y-3">
                  {[
                    { category: 'Homework Help', percentage: 35, count: 16058 },
                    { category: 'Schedule Information', percentage: 28, count: 12850 },
                    { category: 'Assignment Submission', percentage: 18, count: 8261 },
                    { category: 'General Questions', percentage: 12, count: 5507 },
                    { category: 'Technical Support', percentage: 7, count: 3216 }
                  ].map((query, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{query.category}</span>
                        <span className="text-gray-400 text-sm">{query.count} queries</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${query.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-400 text-sm">{query.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'ai-conversations' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Recent AI Conversations</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.Filter size={16} className="inline mr-1" />
                    Filter
                  </button>
                  <button className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                    <Icons.Download size={16} className="inline mr-1" />
                    Export
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    user: 'Student: Alex Thompson', 
                    query: 'Can you help me understand quadratic equations?', 
                    response: 'I\'d be happy to help! Quadratic equations are...', 
                    time: '5 minutes ago',
                    satisfaction: 5,
                    category: 'Homework Help'
                  },
                  { 
                    user: 'Teacher: Sarah Johnson', 
                    query: 'How do I upload a new assignment?', 
                    response: 'To upload a new assignment, navigate to...', 
                    time: '15 minutes ago',
                    satisfaction: 4,
                    category: 'Technical Support'
                  },
                  { 
                    user: 'Parent: Maria Garcia', 
                    query: 'What time does the parent-teacher conference start?', 
                    response: 'The parent-teacher conference is scheduled...', 
                    time: '1 hour ago',
                    satisfaction: 5,
                    category: 'Schedule Information'
                  }
                ].map((conversation, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{conversation.user}</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          {conversation.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Icons.Star 
                              key={i} 
                              size={14} 
                              className={i < conversation.satisfaction ? 'text-yellow-400' : 'text-gray-600'} 
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">{conversation.time}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-400 text-sm">Query: </span>
                        <span className="text-gray-300">{conversation.query}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Response: </span>
                        <span className="text-gray-300">{conversation.response}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'model-health' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">AI Model Health Status</h4>
              
              {/* Model Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { 
                    name: 'Ollama Qwen2.5:3b', 
                    status: 'Healthy', 
                    uptime: '99.8%', 
                    lastUpdate: '2 days ago',
                    memory: '2.1GB',
                    cpu: '15%'
                  },
                  { 
                    name: 'Vector Database', 
                    status: 'Healthy', 
                    uptime: '99.9%', 
                    lastUpdate: '1 week ago',
                    memory: '1.8GB',
                    cpu: '8%'
                  }
                ].map((model, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">{model.name}</h5>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                        {model.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Uptime:</span>
                        <span className="text-gray-300">{model.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Memory Usage:</span>
                        <span className="text-gray-300">{model.memory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPU Usage:</span>
                        <span className="text-gray-300">{model.cpu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Update:</span>
                        <span className="text-gray-300">{model.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Resources */}
              <div>
                <h5 className="text-white font-medium mb-3">System Resources</h5>
                <div className="space-y-3">
                  {[
                    { resource: 'CPU Usage', current: 23, max: 100, unit: '%', status: 'normal' },
                    { resource: 'Memory Usage', current: 4.2, max: 16, unit: 'GB', status: 'normal' },
                    { resource: 'Disk Usage', current: 156, max: 500, unit: 'GB', status: 'normal' },
                    { resource: 'Network I/O', current: 45, max: 1000, unit: 'Mbps', status: 'normal' }
                  ].map((resource, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{resource.resource}</span>
                        <span className="text-gray-300">{resource.current}{resource.unit} / {resource.max}{resource.unit}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            resource.status === 'normal' ? 'bg-green-400' : 'bg-orange-400'
                          }`}
                          style={{ width: `${(resource.current / resource.max) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'ai-feedback' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">User Feedback on AI Responses</h4>
                <span className="text-sm bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                  {currentL2.count} feedback entries
                </span>
              </div>

              {/* Feedback Summary */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {[
                  { rating: 5, count: 89, percentage: 57 },
                  { rating: 4, count: 45, percentage: 29 },
                  { rating: 3, count: 15, percentage: 10 },
                  { rating: 2, count: 5, percentage: 3 },
                  { rating: 1, count: 2, percentage: 1 }
                ].map((feedback, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg text-center">
                    <div className="flex justify-center mb-1">
                      {[...Array(feedback.rating)].map((_, i) => (
                        <Icons.Star key={i} size={14} className="text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-white font-medium">{feedback.count}</p>
                    <p className="text-gray-400 text-sm">{feedback.percentage}%</p>
                  </div>
                ))}
              </div>

              {/* Recent Feedback */}
              <div>
                <h5 className="text-white font-medium mb-3">Recent Feedback</h5>
                <div className="space-y-3">
                  {[
                    { 
                      user: 'Alex Thompson', 
                      rating: 5, 
                      comment: 'The AI helped me understand calculus concepts really well!', 
                      time: '2 hours ago',
                      category: 'Homework Help'
                    },
                    { 
                      user: 'Sarah Johnson', 
                      rating: 4, 
                      comment: 'Good response, but could be more detailed.', 
                      time: '5 hours ago',
                      category: 'Technical Support'
                    },
                    { 
                      user: 'Maria Garcia', 
                      rating: 5, 
                      comment: 'Quick and accurate information about school events.', 
                      time: '1 day ago',
                      category: 'Schedule Information'
                    }
                  ].map((feedback, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{feedback.user}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Icons.Star 
                                key={i} 
                                size={14} 
                                className={i < feedback.rating ? 'text-yellow-400' : 'text-gray-600'} 
                              />
                            ))}
                          </div>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            {feedback.category}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">{feedback.time}</span>
                      </div>
                      <p className="text-gray-300">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {(activeL2 === 'response-quality') && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Icons.Clock size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-400">Feature coming soon...</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {currentL2.name} functionality will be implemented here
                  </p>
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex">
      {/* L2 Sidebar */}
      <div className="w-64 border-r border-white/10 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-4">AI Monitoring</h3>
        <div className="space-y-1">
          {l2Categories.map((subcategory) => {
            const Icon = subcategory.icon;
            const isActive = activeL2 === subcategory.id;
            
            return (
              <button
                key={subcategory.id}
                onClick={() => setActiveL2(subcategory.id)}
                className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/20 border border-blue-400/30' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                      {subcategory.name}
                    </span>
                  </div>
                  {subcategory.count > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {subcategory.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderL2Content()}
      </div>
    </div>
  );
};

export default AIMonitoring;
