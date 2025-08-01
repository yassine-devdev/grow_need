import React, { useState, useEffect } from 'react';
import { Icons } from '../../icons';
import GlassmorphicContainer from '../../ui/GlassmorphicContainer';

interface UserData {
  teachers: Array<{id: string; name: string; email: string; department: string; status: string; last_login: string; courses: number}>;
  students: Array<{id: string; name: string; grade: string; enrolled: string; status: string; gpa: number}>;
  account_requests: Array<{id: string; name: string; email: string; role: string; department?: string; student?: string; submitted: string}>;
  roles: Array<{name: string; users: number; permissions: string[]}>;
  stats: {
    total_teachers: number;
    total_students: number;
    pending_requests: number;
    active_today: number;
  };
}

const UserAdministration: React.FC = () => {
  const [activeL2, setActiveL2] = useState<string>('teacher-management');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/crm/user-administration');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // L2 Sub-categories for User Administration
  const l2Categories = [
    { id: 'teacher-management', name: 'Teacher Management', icon: Icons.GraduationCap, count: userData?.stats.total_teachers || 0 },
    { id: 'student-management', name: 'Student Management', icon: Icons.Users, count: userData?.stats.total_students || 0 },
    { id: 'role-permissions', name: 'Role & Permissions', icon: Icons.Shield, count: userData?.roles.length || 0 },
    { id: 'user-activity', name: 'User Activity', icon: Icons.Activity, count: userData?.stats.active_today || 0 },
    { id: 'account-requests', name: 'Account Requests', icon: Icons.UserPlus, count: userData?.stats.pending_requests || 0 },
    { id: 'user-analytics', name: 'User Analytics', icon: Icons.TrendingUp, count: 0 }
  ];

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/crm/users/approve/${userId}`, {
        method: 'POST'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to approve user:', err);
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/crm/users/reject/${userId}`, {
        method: 'POST'
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to reject user:', err);
    }
  };

  const renderL2Content = () => {
    const currentL2 = l2Categories.find(item => item.id === activeL2);
    if (!currentL2) return null;

    if (loading) {
      return (
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading user data...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-300">Error loading users: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!userData) return null;

    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <currentL2.icon size={32} className="text-blue-400" />
          <div>
            <h3 className="text-xl font-semibold text-white">{currentL2.name}</h3>
            <p className="text-gray-400">
              {currentL2.count > 0 ? `${currentL2.count} items` : 'No items'}
            </p>
          </div>
        </div>

        {/* Content based on selected L2 category */}
        {activeL2 === 'teacher-management' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Active Teachers</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.Plus size={16} className="inline mr-1" />
                    Add Teacher
                  </button>
                  <button className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                    <Icons.Download size={16} className="inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {userData.teachers.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Icons.User size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{teacher.name}</h5>
                        <p className="text-gray-400 text-sm">{teacher.email}</p>
                        <p className="text-gray-500 text-xs">{teacher.department} • {teacher.courses} courses • Last login: {teacher.last_login}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        teacher.status === 'Active'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {teacher.status}
                      </span>
                      <button className="p-2 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30" title="Edit teacher">
                        <Icons.Edit size={16} />
                      </button>
                      <button className="p-2 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30" title="View details">
                        <Icons.Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'student-management' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Student Overview</h4>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                    <Icons.Plus size={16} className="inline mr-1" />
                    Add Student
                  </button>
                  <button className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30">
                    <Icons.Upload size={16} className="inline mr-1" />
                    Bulk Import
                  </button>
                </div>
              </div>

              {/* Student Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Students', value: '1,250', icon: Icons.Users, color: 'blue' },
                  { label: 'Active Today', value: '892', icon: Icons.UserCheck, color: 'green' },
                  { label: 'New This Month', value: '45', icon: Icons.UserPlus, color: 'purple' },
                  { label: 'Pending Approval', value: '3', icon: Icons.Clock, color: 'orange' }
                ].map((stat, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={20} className={`text-${stat.color}-400`} />
                      <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Students */}
              <div className="space-y-3">
                <h5 className="text-white font-medium">Recent Enrollments</h5>
                {[
                  { name: 'Alex Thompson', grade: '10th Grade', enrolled: '2 days ago', status: 'Active' },
                  { name: 'Maria Garcia', grade: '9th Grade', enrolled: '3 days ago', status: 'Pending' },
                  { name: 'James Wilson', grade: '11th Grade', enrolled: '1 week ago', status: 'Active' }
                ].map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Icons.User size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <h6 className="text-white font-medium">{student.name}</h6>
                        <p className="text-gray-400 text-sm">{student.grade} • Enrolled {student.enrolled}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      student.status === 'Active' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'role-permissions' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">User Roles & Permissions</h4>
                <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30">
                  <Icons.Plus size={16} className="inline mr-1" />
                  Create Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { 
                    name: 'Administrator', 
                    users: 5, 
                    permissions: ['Full Access', 'User Management', 'System Settings', 'Content Approval'],
                    color: 'red'
                  },
                  { 
                    name: 'Teacher', 
                    users: 45, 
                    permissions: ['Content Creation', 'Student Management', 'Grade Management'],
                    color: 'blue'
                  },
                  { 
                    name: 'Student', 
                    users: 1250, 
                    permissions: ['View Content', 'Submit Assignments', 'Access Resources'],
                    color: 'green'
                  },
                  { 
                    name: 'Parent', 
                    users: 890, 
                    permissions: ['View Progress', 'Communication', 'Event Access'],
                    color: 'purple'
                  }
                ].map((role, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">{role.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs bg-${role.color}-500/20 text-${role.color}-300`}>
                        {role.users} users
                      </span>
                    </div>
                    <div className="space-y-1">
                      {role.permissions.map((permission, pIndex) => (
                        <div key={pIndex} className="flex items-center gap-2">
                          <Icons.CheckCircle size={14} className="text-green-400" />
                          <span className="text-gray-300 text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 text-sm">
                      Edit Permissions
                    </button>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {activeL2 === 'account-requests' && (
          <div className="space-y-4">
            <GlassmorphicContainer className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Pending Account Requests</h4>
                <span className="text-sm bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                  {currentL2.count} pending
                </span>
              </div>

              <div className="space-y-3">
                {userData.account_requests.length > 0 ? (
                  userData.account_requests.map((request) => (
                    <div key={request.id} className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">{request.name}</h5>
                          <p className="text-gray-400 text-sm">{request.email}</p>
                          <p className="text-gray-500 text-xs">
                            Role: {request.role}
                            {request.department && ` • Department: ${request.department}`}
                            {request.student && ` • Student: ${request.student}`}
                            • Submitted {request.submitted}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveUser(request.id)}
                            className="p-2 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30"
                            title="Approve request"
                          >
                            <Icons.CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleRejectUser(request.id)}
                            className="p-2 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30"
                            title="Reject request"
                          >
                            <Icons.XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Icons.UserPlus size={48} className="mx-auto mb-4 text-gray-400 opacity-50" />
                    <p className="text-gray-400">No pending account requests</p>
                  </div>
                )}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {(activeL2 === 'user-activity' || activeL2 === 'user-analytics') && (
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
        <h3 className="text-lg font-semibold text-white mb-4">User Administration</h3>
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

export default UserAdministration;
