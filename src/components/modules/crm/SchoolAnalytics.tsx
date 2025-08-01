import React, { useState } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

const SchoolAnalytics: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('engagement-metrics');

  // L2 Sub-categories for School Analytics
  const l2Categories = [
    { id: 'engagement-metrics', name: 'Engagement Metrics', icon: Icons.TrendingUp, count: 0 },
    { id: 'popular-content', name: 'Popular Content', icon: Icons.Flame, count: 0 },
    { id: 'learning-outcomes', name: 'Learning Outcomes', icon: Icons.Target, count: 0 },
    { id: 'usage-patterns', name: 'Usage Patterns', icon: Icons.Calendar, count: 0 },
    { id: 'performance-reports', name: 'Performance Reports', icon: Icons.FileText, count: 24 },
    { id: 'custom-dashboards', name: 'Custom Dashboards', icon: Icons.Layout, count: 5 }
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
              {currentL2.count > 0 ? `${currentL2.count} items` : 'Analytics dashboard'}
            </p>
          </div>
        </div>

        {/* Content based on selected L2 category */}
        {activeL2 === 'engagement-metrics' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Student Engagement Overview</h4>
              
              {/* Engagement Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Daily Active Users', value: '892', change: '+12%', icon: Icons.Users, color: 'blue' },
                  { label: 'Avg. Session Time', value: '24m', change: '+8%', icon: Icons.Clock, color: 'green' },
                  { label: 'Content Interactions', value: '3,247', change: '+15%', icon: Icons.MousePointer, color: 'purple' },
                  { label: 'Assignment Completion', value: '87%', change: '+5%', icon: Icons.CheckCircle, color: 'orange' }
                ].map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon size={20} className={`text-${metric.color}-400`} />
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <span className="text-green-400 text-sm">{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Engagement by Grade Level */}
              <div>
                <h5 className="text-white font-medium mb-3">Engagement by Grade Level</h5>
                <div className="space-y-3">
                  {[
                    { grade: '9th Grade', students: 312, engagement: 89, color: 'blue' },
                    { grade: '10th Grade', students: 298, engagement: 92, color: 'green' },
                    { grade: '11th Grade', students: 285, engagement: 85, color: 'purple' },
                    { grade: '12th Grade', students: 267, engagement: 78, color: 'orange' }
                  ].map((grade, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{grade.grade}</span>
                        <span className="text-gray-400 text-sm">{grade.students} students</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-${grade.color}-400 h-2 rounded-full`}
                            style={{ width: `${grade.engagement}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300 text-sm">{grade.engagement}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'popular-content' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Most Popular Educational Content</h4>
              
              {/* Top Content */}
              <div className="space-y-4">
                {[
                  { 
                    title: 'Introduction to Algebra', 
                    subject: 'Mathematics', 
                    views: 1247, 
                    likes: 89, 
                    downloads: 156,
                    trend: 'up',
                    rating: 4.8
                  },
                  { 
                    title: 'Cell Biology Basics', 
                    subject: 'Science', 
                    views: 1089, 
                    likes: 76, 
                    downloads: 134,
                    trend: 'up',
                    rating: 4.9
                  },
                  { 
                    title: 'World War II Timeline', 
                    subject: 'History', 
                    views: 892, 
                    likes: 65, 
                    downloads: 98,
                    trend: 'down',
                    rating: 4.6
                  },
                  { 
                    title: 'Shakespeare Analysis', 
                    subject: 'English', 
                    views: 756, 
                    likes: 54, 
                    downloads: 87,
                    trend: 'up',
                    rating: 4.7
                  }
                ].map((content, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="text-white font-medium">{content.title}</h5>
                        <p className="text-gray-400 text-sm">{content.subject}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Icons.Star size={14} className="text-yellow-400" />
                          <span className="text-gray-300 text-sm">{content.rating}</span>
                        </div>
                        <Icons.TrendingUp 
                          size={16} 
                          className={content.trend === 'up' ? 'text-green-400' : 'text-red-400'} 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-400">Views</p>
                        <p className="text-white font-medium">{content.views.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Likes</p>
                        <p className="text-white font-medium">{content.likes}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Downloads</p>
                        <p className="text-white font-medium">{content.downloads}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Categories Performance */}
              <div className="mt-6">
                <h5 className="text-white font-medium mb-3">Performance by Subject</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { subject: 'Mathematics', engagement: 92, content: 45, avgRating: 4.7 },
                    { subject: 'Science', engagement: 89, content: 38, avgRating: 4.8 },
                    { subject: 'History', engagement: 85, content: 32, avgRating: 4.5 },
                    { subject: 'English', engagement: 88, content: 41, avgRating: 4.6 }
                  ].map((subject, index) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <h6 className="text-white font-medium mb-2">{subject.subject}</h6>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Engagement:</span>
                          <span className="text-gray-300">{subject.engagement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Content Items:</span>
                          <span className="text-gray-300">{subject.content}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Rating:</span>
                          <span className="text-gray-300">{subject.avgRating}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'learning-outcomes' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Learning Outcomes Analysis</h4>
              
              {/* Overall Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Average Grade', value: '85.2%', change: '+3.2%', icon: Icons.TrendingUp },
                  { label: 'Completion Rate', value: '92.8%', change: '+1.5%', icon: Icons.CheckCircle },
                  { label: 'Improvement Rate', value: '78.4%', change: '+5.1%', icon: Icons.Target }
                ].map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon size={20} className="text-blue-400" />
                      <span className="text-gray-400 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                      <span className="text-green-400 text-sm">{metric.change}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subject Performance */}
              <div>
                <h5 className="text-white font-medium mb-3">Performance by Subject</h5>
                <div className="space-y-3">
                  {[
                    { subject: 'Mathematics', avgGrade: 87.5, improvement: '+4.2%', students: 312 },
                    { subject: 'Science', avgGrade: 89.1, improvement: '+2.8%', students: 298 },
                    { subject: 'History', avgGrade: 82.3, improvement: '+3.5%', students: 285 },
                    { subject: 'English', avgGrade: 84.7, improvement: '+1.9%', students: 267 }
                  ].map((subject, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-white font-medium">{subject.subject}</h6>
                        <span className="text-gray-400 text-sm">{subject.students} students</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-sm">Avg Grade:</span>
                          <span className="text-white font-medium">{subject.avgGrade}%</span>
                        </div>
                        <span className="text-green-400 text-sm">{subject.improvement}</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-400 h-2 rounded-full" 
                          style={{ width: `${subject.avgGrade}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'usage-patterns' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Platform Usage Patterns</h4>
              
              {/* Peak Usage Times */}
              <div className="mb-6">
                <h5 className="text-white font-medium mb-3">Peak Usage Hours</h5>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const usage = Math.random() * 100;
                    return (
                      <div key={hour} className="text-center">
                        <div 
                          className="bg-blue-400 rounded-t mb-1" 
                          style={{ height: `${Math.max(usage, 10)}px` }}
                        ></div>
                        <span className="text-xs text-gray-400">{hour}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-gray-400 text-sm mt-2">Peak hours: 10:00-12:00 and 14:00-16:00</p>
              </div>

              {/* Device Usage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-white font-medium mb-3">Device Usage</h5>
                  <div className="space-y-3">
                    {[
                      { device: 'Desktop', percentage: 45, users: 562 },
                      { device: 'Mobile', percentage: 35, users: 437 },
                      { device: 'Tablet', percentage: 20, users: 251 }
                    ].map((device, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{device.device}</span>
                          <span className="text-gray-400 text-sm">{device.users} users</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full" 
                            style={{ width: `${device.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-400 text-sm">{device.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-white font-medium mb-3">Weekly Activity</h5>
                  <div className="space-y-3">
                    {[
                      { day: 'Monday', activity: 92 },
                      { day: 'Tuesday', activity: 89 },
                      { day: 'Wednesday', activity: 95 },
                      { day: 'Thursday', activity: 87 },
                      { day: 'Friday', activity: 78 },
                      { day: 'Saturday', activity: 45 },
                      { day: 'Sunday', activity: 32 }
                    ].map((day, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium">{day.day}</span>
                          <span className="text-gray-300">{day.activity}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full" 
                            style={{ width: `${day.activity}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'performance-reports' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Generated Reports</h4>
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                  <Icons.Plus size={16} className="inline mr-1" />
                  Generate Report
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { 
                    title: 'Monthly Performance Summary', 
                    type: 'Academic Performance', 
                    generated: '2 days ago', 
                    size: '2.4 MB',
                    status: 'Ready'
                  },
                  { 
                    title: 'Student Engagement Analysis', 
                    type: 'Engagement Metrics', 
                    generated: '1 week ago', 
                    size: '1.8 MB',
                    status: 'Ready'
                  },
                  { 
                    title: 'Content Usage Report', 
                    type: 'Content Analytics', 
                    generated: '2 weeks ago', 
                    size: '3.1 MB',
                    status: 'Ready'
                  },
                  { 
                    title: 'AI Performance Review', 
                    type: 'AI Analytics', 
                    generated: 'Processing...', 
                    size: '-',
                    status: 'Processing'
                  }
                ].map((report, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-white font-medium">{report.title}</h5>
                        <p className="text-gray-400 text-sm">{report.type}</p>
                        <p className="text-gray-500 text-xs">Generated {report.generated} • {report.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          report.status === 'Ready' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-orange-500/20 text-orange-300'
                        }`}>
                          {report.status}
                        </span>
                        {report.status === 'Ready' && (
                          <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                            <Icons.Download size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'custom-dashboards' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Custom Dashboards</h4>
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                  <Icons.Plus size={16} className="inline mr-1" />
                  Create Dashboard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    name: 'Principal Overview', 
                    description: 'High-level school performance metrics', 
                    widgets: 8, 
                    lastUpdated: '2 hours ago',
                    shared: true
                  },
                  { 
                    name: 'Teacher Performance', 
                    description: 'Individual teacher analytics and insights', 
                    widgets: 12, 
                    lastUpdated: '1 day ago',
                    shared: false
                  },
                  { 
                    name: 'Student Progress', 
                    description: 'Detailed student learning outcomes', 
                    widgets: 15, 
                    lastUpdated: '3 hours ago',
                    shared: true
                  },
                  { 
                    name: 'Content Analytics', 
                    description: 'Educational content performance metrics', 
                    widgets: 10, 
                    lastUpdated: '6 hours ago',
                    shared: false
                  },
                  { 
                    name: 'AI Usage Dashboard', 
                    description: 'AI concierge performance and usage', 
                    widgets: 9, 
                    lastUpdated: '4 hours ago',
                    shared: true
                  }
                ].map((dashboard, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-white font-medium">{dashboard.name}</h5>
                      {dashboard.shared && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{dashboard.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{dashboard.widgets} widgets</span>
                      <span className="text-gray-400">Updated {dashboard.lastUpdated}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 text-sm">
                        View
                      </button>
                      <button className="flex-1 py-2 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30 text-sm">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
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
        <h3 className="text-lg font-semibold text-white mb-4">School Analytics</h3>
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

export default SchoolAnalytics;
