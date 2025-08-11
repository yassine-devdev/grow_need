
import React, { useState, useEffect } from 'react';
import '../shared.css';
import './BehaviorDashboard.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface StudentBehaviorData {
  student_id: string;
  student_name: string;
  class: string;
  recent_incidents: Array<{
    id: string;
    date: string;
    type: 'positive' | 'negative' | 'neutral';
    category: string;
    description: string;
    reporter: string;
    follow_up_required: boolean;
  }>;
  behavior_trends: {
    weekly_score: number;
    monthly_score: number;
    improvement_rate: number;
  };
  communication_log: Array<{
    id: string;
    date: string;
    type: 'parent_contact' | 'admin_note' | 'intervention' | 'praise';
    message: string;
    sent_by: string;
    response_status: 'pending' | 'responded' | 'no_response';
  }>;
}

interface BehaviorAnalytics {
  class_overview: {
    total_students: number;
    positive_behaviors_today: number;
    incidents_requiring_follow_up: number;
    parent_communications_pending: number;
  };
  top_concerns: Array<{
    category: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  success_stories: Array<{
    student_name: string;
    improvement_area: string;
    progress_note: string;
  }>;
}

const BehaviorDashboard: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [behaviorData, setBehaviorData] = useState<StudentBehaviorData[]>([]);
  const [analytics, setAnalytics] = useState<BehaviorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'student' | 'communications'>('overview');
  const [newIncident, setNewIncident] = useState({
    student_id: '',
    type: 'neutral' as 'positive' | 'negative' | 'neutral',
    category: '',
    description: ''
  });

  useEffect(() => {
    fetchBehaviorData();
  }, []);

  const fetchBehaviorData = async () => {
    setLoading(true);
    try {
      // Try to fetch real data from CRM
      const response = await fetch('http://localhost:5000/api/crm/behavior-analytics');
      if (response.ok) {
        const data = await response.json();
        setBehaviorData(data.student_behavior || []);
        setAnalytics(data.analytics || null);
      } else {
        // Fallback to mock data
        loadMockData();
      }
    } catch (error) {
      console.error('Failed to fetch behavior data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockStudents: StudentBehaviorData[] = [
      {
        student_id: '1',
        student_name: 'Emma Johnson',
        class: '5A',
        recent_incidents: [
          {
            id: '1',
            date: '2025-08-01',
            type: 'positive',
            category: 'Participation',
            description: 'Excellent participation in science discussion',
            reporter: 'Ms. Smith',
            follow_up_required: false
          },
          {
            id: '2',
            date: '2025-07-30',
            type: 'negative',
            category: 'Disruption',
            description: 'Talking during quiet reading time',
            reporter: 'Ms. Smith',
            follow_up_required: true
          }
        ],
        behavior_trends: {
          weekly_score: 85,
          monthly_score: 78,
          improvement_rate: 12
        },
        communication_log: [
          {
            id: '1',
            date: '2025-07-30',
            type: 'parent_contact',
            message: 'Called parent regarding reading time behavior',
            sent_by: 'Ms. Smith',
            response_status: 'responded'
          }
        ]
      },
      {
        student_id: '2',
        student_name: 'Michael Chen',
        class: '5A',
        recent_incidents: [
          {
            id: '3',
            date: '2025-08-01',
            type: 'positive',
            category: 'Leadership',
            description: 'Helped organize group project effectively',
            reporter: 'Ms. Smith',
            follow_up_required: false
          }
        ],
        behavior_trends: {
          weekly_score: 92,
          monthly_score: 89,
          improvement_rate: 8
        },
        communication_log: []
      }
    ];

    const mockAnalytics: BehaviorAnalytics = {
      class_overview: {
        total_students: 24,
        positive_behaviors_today: 18,
        incidents_requiring_follow_up: 3,
        parent_communications_pending: 2
      },
      top_concerns: [
        { category: 'Disruption', frequency: 8, trend: 'decreasing' },
        { category: 'Late Assignment', frequency: 5, trend: 'stable' },
        { category: 'Social Conflict', frequency: 3, trend: 'increasing' }
      ],
      success_stories: [
        {
          student_name: 'Sarah Wilson',
          improvement_area: 'Class Participation',
          progress_note: 'Significant improvement in speaking up during discussions'
        },
        {
          student_name: 'Alex Rodriguez',
          improvement_area: 'Time Management',
          progress_note: 'Has turned in all assignments on time this week'
        }
      ]
    };

    setBehaviorData(mockStudents);
    setAnalytics(mockAnalytics);
  };

  const handleAddIncident = async () => {
    if (!newIncident.student_id || !newIncident.description) return;

    const incident = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: newIncident.type,
      category: newIncident.category || 'General',
      description: newIncident.description,
      reporter: 'Current Teacher',
      follow_up_required: newIncident.type === 'negative'
    };

    // Update local state
    setBehaviorData(prev => prev.map(student => 
      student.student_id === newIncident.student_id
        ? { ...student, recent_incidents: [incident, ...student.recent_incidents] }
        : student
    ));

    // Reset form
    setNewIncident({
      student_id: '',
      type: 'neutral',
      category: '',
      description: ''
    });

    // In a real app, send to API
    try {
      await fetch('http://localhost:5000/api/crm/behavior-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
    } catch (error) {
      console.error('Failed to save incident:', error);
    }
  };

  const getBehaviorColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <Icons.TrendingUp className="text-red-400" size={16} />;
      case 'decreasing': return <Icons.TrendingDown className="text-green-400" size={16} />;
      default: return <Icons.TrendingFlat className="text-yellow-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="school-hub-content-pane flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="school-hub-content-pane">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-cyan-400 mb-2">
            <Icons.BehaviorDashboard size={32}/>
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-1">Behavior Dashboard</h2>
          <p className="text-gray-400">Teacher / Behavior Management & Communication</p>
        </div>
        <button
          onClick={fetchBehaviorData}
          className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg text-white hover:bg-white/20 transition-all duration-200 border border-white/20"
        >
          <Icons.RefreshCw size={16} className="inline mr-2" />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        {[
          { id: 'overview', name: 'Class Overview', icon: Icons.BarChart3 },
          { id: 'student', name: 'Student Details', icon: Icons.Users },
          { id: 'communications', name: 'Communications', icon: Icons.MessageSquare }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <tab.icon size={16} className="mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Students</p>
                  <p className="text-2xl font-bold text-white">{analytics.class_overview.total_students}</p>
                </div>
                <Icons.Users className="text-blue-400" size={24} />
              </div>
            </GlassmorphicContainer>

            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Positive Today</p>
                  <p className="text-2xl font-bold text-green-400">{analytics.class_overview.positive_behaviors_today}</p>
                </div>
                <Icons.ThumbsUp className="text-green-400" size={24} />
              </div>
            </GlassmorphicContainer>

            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Follow-ups Needed</p>
                  <p className="text-2xl font-bold text-yellow-400">{analytics.class_overview.incidents_requiring_follow_up}</p>
                </div>
                <Icons.AlertTriangle className="text-yellow-400" size={24} />
              </div>
            </GlassmorphicContainer>

            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Comms</p>
                  <p className="text-2xl font-bold text-red-400">{analytics.class_overview.parent_communications_pending}</p>
                </div>
                <Icons.MessageSquare className="text-red-400" size={24} />
              </div>
            </GlassmorphicContainer>
          </div>

          {/* Top Concerns */}
          <GlassmorphicContainer className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Icons.TrendingUp className="mr-2" size={20} />
              Behavior Trends
            </h3>
            <div className="space-y-3">
              {analytics.top_concerns.map((concern, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(concern.trend)}
                    <span className="text-white">{concern.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">{concern.frequency} incidents</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      concern.trend === 'increasing' ? 'bg-red-500/20 text-red-400' :
                      concern.trend === 'decreasing' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {concern.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicContainer>

          {/* Success Stories */}
          <GlassmorphicContainer className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Icons.Award className="mr-2" size={20} />
              Success Stories
            </h3>
            <div className="space-y-3">
              {analytics.success_stories.map((story, index) => (
                <div key={index} className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-medium">{story.student_name}</span>
                    <span className="text-xs text-gray-400">{story.improvement_area}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{story.progress_note}</p>
                </div>
              ))}
            </div>
          </GlassmorphicContainer>
        </div>
      )}

      {activeTab === 'student' && (
        <div className="space-y-6">
          {/* Student Selection */}
          <GlassmorphicContainer className="p-4">
            <label className="block text-white mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Choose a student...</option>
              {behaviorData.map(student => (
                <option key={student.student_id} value={student.student_id} className="bg-gray-800">
                  {student.student_name} - {student.class}
                </option>
              ))}
            </select>
          </GlassmorphicContainer>

          {/* Student Details */}
          {selectedStudent && (
            (() => {
              const student = behaviorData.find(s => s.student_id === selectedStudent);
              if (!student) return null;

              return (
                <div className="space-y-4">
                  {/* Student Info & Trends */}
                  <GlassmorphicContainer className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{student.student_name}</h3>
                        <p className="text-gray-400">Class {student.class}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{student.behavior_trends.weekly_score}/100</div>
                        <div className="text-sm text-gray-400">Weekly Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{student.behavior_trends.weekly_score}</div>
                        <div className="text-xs text-gray-400">Week Score</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-lg font-bold text-white">{student.behavior_trends.monthly_score}</div>
                        <div className="text-xs text-gray-400">Month Score</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className={`text-lg font-bold ${student.behavior_trends.improvement_rate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {student.behavior_trends.improvement_rate > 0 ? '+' : ''}{student.behavior_trends.improvement_rate}%
                        </div>
                        <div className="text-xs text-gray-400">Improvement</div>
                      </div>
                    </div>
                  </GlassmorphicContainer>

                  {/* Recent Incidents */}
                  <GlassmorphicContainer className="p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Incidents</h4>
                    <div className="space-y-3">
                      {student.recent_incidents.map(incident => (
                        <div key={incident.id} className="p-4 bg-white/5 rounded-lg border-l-4 border-l-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${getBehaviorColor(incident.type)}`}>
                              {incident.category}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-400">{incident.date}</span>
                              {incident.follow_up_required && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                  Follow-up
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-1">{incident.description}</p>
                          <p className="text-xs text-gray-500">Reported by: {incident.reporter}</p>
                        </div>
                      ))}
                    </div>
                  </GlassmorphicContainer>
                </div>
              );
            })()
          )}

          {/* Add New Incident */}
          <GlassmorphicContainer className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Log New Incident</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-1">Student</label>
                  <select
                    value={newIncident.student_id}
                    onChange={(e) => setNewIncident({...newIncident, student_id: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Select student...</option>
                    {behaviorData.map(student => (
                      <option key={student.student_id} value={student.student_id} className="bg-gray-800">
                        {student.student_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-1">Type</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value as any})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="positive" className="bg-gray-800">Positive</option>
                    <option value="neutral" className="bg-gray-800">Neutral</option>
                    <option value="negative" className="bg-gray-800">Negative</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white mb-1">Category</label>
                <input
                  type="text"
                  value={newIncident.category}
                  onChange={(e) => setNewIncident({...newIncident, category: e.target.value})}
                  placeholder="e.g., Participation, Disruption, Leadership"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-white mb-1">Description</label>
                <textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  placeholder="Describe the incident..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleAddIncident}
                disabled={!newIncident.student_id || !newIncident.description}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
              >
                Log Incident
              </button>
            </div>
          </GlassmorphicContainer>
        </div>
      )}

      {activeTab === 'communications' && (
        <GlassmorphicContainer className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Communication Log</h3>
          <div className="space-y-4">
            {behaviorData.flatMap(student => 
              student.communication_log.map(comm => (
                <div key={comm.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{student.student_name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{comm.date}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        comm.response_status === 'responded' ? 'bg-green-500/20 text-green-400' :
                        comm.response_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {comm.response_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-1">{comm.message}</p>
                  <p className="text-xs text-gray-500">By: {comm.sent_by}</p>
                </div>
              ))
            )}
          </div>
        </GlassmorphicContainer>
      )}
    </div>
  );
};

export default BehaviorDashboard;
