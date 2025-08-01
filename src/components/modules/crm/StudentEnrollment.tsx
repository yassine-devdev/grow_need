import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface EnrollmentData {
  applications: Array<{
    id: string;
    student_name: string;
    grade: string;
    status: 'pending' | 'approved' | 'rejected' | 'waitlisted';
    application_date: string;
    parent_contact: string;
    documents_complete: boolean;
    interview_scheduled: boolean;
    priority_score: number;
  }>;
  enrollment_stats: {
    total_applications: number;
    pending_review: number;
    approved: number;
    rejected: number;
    waitlisted: number;
    capacity_by_grade: Array<{grade: string; capacity: number; enrolled: number; available: number}>;
  };
  upcoming_deadlines: Array<{
    type: string;
    date: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const StudentEnrollment: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('applications');
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load enrollment data from API
  useEffect(() => {
    const fetchEnrollmentData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/student-enrollment');
        if (!response.ok) throw new Error('Failed to fetch enrollment data');
        const data = await response.json();
        setEnrollmentData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch enrollment data:', err);
        // Fallback to mock data
        setEnrollmentData({
          applications: [
            {
              id: 'APP001',
              student_name: 'Emma Johnson',
              grade: '9th Grade',
              status: 'pending',
              application_date: '2024-01-15',
              parent_contact: 'sarah.johnson@email.com',
              documents_complete: true,
              interview_scheduled: false,
              priority_score: 85
            },
            {
              id: 'APP002',
              student_name: 'Michael Chen',
              grade: '10th Grade',
              status: 'approved',
              application_date: '2024-01-12',
              parent_contact: 'david.chen@email.com',
              documents_complete: true,
              interview_scheduled: true,
              priority_score: 92
            },
            {
              id: 'APP003',
              student_name: 'Sofia Rodriguez',
              grade: '11th Grade',
              status: 'waitlisted',
              application_date: '2024-01-18',
              parent_contact: 'maria.rodriguez@email.com',
              documents_complete: false,
              interview_scheduled: false,
              priority_score: 78
            }
          ],
          enrollment_stats: {
            total_applications: 156,
            pending_review: 23,
            approved: 89,
            rejected: 12,
            waitlisted: 32,
            capacity_by_grade: [
              { grade: '9th Grade', capacity: 120, enrolled: 98, available: 22 },
              { grade: '10th Grade', capacity: 115, enrolled: 102, available: 13 },
              { grade: '11th Grade', capacity: 110, enrolled: 95, available: 15 },
              { grade: '12th Grade', capacity: 105, enrolled: 88, available: 17 }
            ]
          },
          upcoming_deadlines: [
            {
              type: 'Application Deadline',
              date: '2024-02-15',
              description: 'Final deadline for fall semester applications',
              priority: 'high'
            },
            {
              type: 'Interview Period',
              date: '2024-02-20',
              description: 'Complete all pending student interviews',
              priority: 'medium'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollmentData();
  }, []);

  // L2 Sub-categories for Student Enrollment
  const l2Categories = [
    { id: 'applications', name: 'Applications', icon: Icons.FileText, count: enrollmentData?.enrollment_stats.total_applications || 0 },
    { id: 'capacity-planning', name: 'Capacity Planning', icon: Icons.BarChart, count: 0 },
    { id: 'interviews', name: 'Interviews', icon: Icons.Calendar, count: 0 },
    { id: 'documents', name: 'Documents', icon: Icons.FolderOpen, count: 0 },
    { id: 'communications', name: 'Communications', icon: Icons.MessageSquare, count: 0 },
    { id: 'reports', name: 'Reports', icon: Icons.PieChart, count: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      case 'waitlisted': return 'text-blue-400 bg-blue-500/20';
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

  const renderL2Content = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Loading enrollment data...</span>
        </div>
      );
    }

    if (error && !enrollmentData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Icons.AlertTriangle size={48} className="text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Failed to load enrollment data</h3>
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
      case 'applications':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{enrollmentData?.enrollment_stats.total_applications}</div>
                <div className="text-sm text-gray-400">Total Applications</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{enrollmentData?.enrollment_stats.pending_review}</div>
                <div className="text-sm text-gray-400">Pending Review</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{enrollmentData?.enrollment_stats.approved}</div>
                <div className="text-sm text-gray-400">Approved</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{enrollmentData?.enrollment_stats.waitlisted}</div>
                <div className="text-sm text-gray-400">Waitlisted</div>
              </GlassmorphicContainer>
              <GlassmorphicContainer className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{enrollmentData?.enrollment_stats.rejected}</div>
                <div className="text-sm text-gray-400">Rejected</div>
              </GlassmorphicContainer>
            </div>

            {/* Applications Table */}
            <GlassmorphicContainer className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  <Icons.UserPlus size={16} className="inline mr-2" />
                  New Application
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Student</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Grade</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Applied</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Documents</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Score</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollmentData?.applications.map((application) => (
                      <tr key={application.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-white">{application.student_name}</div>
                            <div className="text-sm text-gray-400">{application.parent_contact}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{application.grade}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{application.application_date}</td>
                        <td className="py-3 px-4">
                          {application.documents_complete ? (
                            <Icons.CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Icons.Clock size={16} className="text-yellow-400" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <span className="text-white font-medium">{application.priority_score}</span>
                            <div className="ml-2 w-16 h-2 bg-gray-700 rounded-full">
                              <div 
                                className="h-full bg-blue-400 rounded-full" 
                                style={{ width: `${application.priority_score}%` }}
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

      case 'capacity-planning':
        return (
          <div className="space-y-6">
            <GlassmorphicContainer className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Enrollment Capacity by Grade</h3>
              <div className="space-y-4">
                {enrollmentData?.enrollment_stats.capacity_by_grade.map((grade) => (
                  <div key={grade.grade} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{grade.grade}</div>
                      <div className="text-sm text-gray-400">
                        {grade.enrolled} enrolled / {grade.capacity} capacity
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-3 bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-blue-400 rounded-full" 
                          style={{ width: `${(grade.enrolled / grade.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-400">{grade.available}</div>
                        <div className="text-xs text-gray-400">available</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>

            {/* Upcoming Deadlines */}
            <GlassmorphicContainer className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
              <div className="space-y-3">
                {enrollmentData?.upcoming_deadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icons.Calendar size={20} className="text-blue-400" />
                      <div>
                        <div className="font-medium text-white">{deadline.type}</div>
                        <div className="text-sm text-gray-400">{deadline.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{deadline.date}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
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
            <Icons.FileText size={48} className="text-gray-600 mb-4" />
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
          <Icons.GraduationCap size={32} className="text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Student Enrollment</h2>
            <p className="text-gray-400">Manage applications, capacity, and enrollment processes</p>
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

export default StudentEnrollment;
