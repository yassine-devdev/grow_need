import React, { useState, useEffect } from 'react';
import { agenticTools, Task, Project, TaskRecommendation } from '../../services/agenticToolsIntegration';

interface TaskManagementDashboardProps {
  projectId?: string;
  className?: string;
}

const TaskManagementDashboard: React.FC<TaskManagementDashboardProps> = ({
  projectId,
  className = ''
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'recommendations' | 'analytics'>('tasks');

  // Mock data for demonstration
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      name: 'Implement CRM Dashboard',
      details: 'Create comprehensive CRM dashboard with real-time metrics and analytics',
      projectId: 'project-1',
      completed: false,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T10:00:00Z',
      priority: 9,
      complexity: 7,
      status: 'in-progress',
      tags: ['frontend', 'dashboard', 'crm'],
      estimatedHours: 16,
      actualHours: 12
    },
    {
      id: 'task-2',
      name: 'Design Student Enrollment Flow',
      details: 'Create user-friendly enrollment process with validation and confirmation',
      projectId: 'project-1',
      completed: true,
      createdAt: '2024-01-19T09:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      parentId: 'task-1',
      priority: 8,
      complexity: 6,
      status: 'done',
      tags: ['design', 'enrollment', 'ux'],
      estimatedHours: 8,
      actualHours: 10
    },
    {
      id: 'task-3',
      name: 'Integrate Payment Processing',
      details: 'Set up secure payment processing for tuition and fees',
      projectId: 'project-1',
      completed: false,
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
      priority: 10,
      complexity: 9,
      status: 'pending',
      tags: ['backend', 'payments', 'security'],
      estimatedHours: 24,
      dependsOn: ['task-1']
    }
  ];

  const mockProjects: Project[] = [
    {
      id: 'project-1',
      name: 'GROW YouR NEED SaaS School',
      description: 'Comprehensive school management system with CRM, AI concierge, and educational tools',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z'
    }
  ];

  const mockRecommendations: TaskRecommendation[] = [
    {
      task: mockTasks[2],
      score: 95,
      reasoning: 'High priority task with all dependencies completed. Critical for revenue generation.',
      dependencies: []
    },
    {
      task: mockTasks[0],
      score: 85,
      reasoning: 'Currently in progress with good momentum. Should be completed to unblock dependent tasks.',
      dependencies: []
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real implementation, these would call the MCP server
        setProjects(mockProjects);
        setTasks(mockTasks);
        setRecommendations(mockRecommendations);
        
        if (!selectedProject && mockProjects.length > 0) {
          setSelectedProject(mockProjects[0].id);
        }
      } catch (error) {
        console.error('Failed to load task data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedProject]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'done': return 'text-green-400 bg-green-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/20';
      case 'blocked': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-400';
    if (priority >= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getComplexityBar = (complexity: number) => {
    const percentage = (complexity / 10) * 100;
    const color = complexity >= 8 ? 'bg-red-400' : complexity >= 6 ? 'bg-yellow-400' : 'bg-green-400';
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderTaskHierarchy = (tasks: Task[], parentId?: string, level = 0) => {
    const filteredTasks = tasks.filter(task => task.parentId === parentId);
    
    return filteredTasks.map(task => (
      <div key={task.id} className={`${level > 0 ? 'ml-6 border-l border-gray-600 pl-4' : ''}`}>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white font-medium">{task.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className={`text-sm font-medium ${getPriorityColor(task.priority || 5)}`}>
                  P{task.priority}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{task.details}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Complexity</label>
                  <div className="flex items-center gap-2">
                    {getComplexityBar(task.complexity || 5)}
                    <span className="text-xs text-gray-400">{task.complexity}/10</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Progress</label>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-400" 
                        style={{ 
                          width: `${task.actualHours && task.estimatedHours 
                            ? Math.min((task.actualHours / task.estimatedHours) * 100, 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">
                      {task.actualHours || 0}h / {task.estimatedHours || 0}h
                    </span>
                  </div>
                </div>
              </div>
              
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {task.dependsOn && task.dependsOn.length > 0 && (
                <div className="text-xs text-gray-400">
                  Depends on: {task.dependsOn.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Render child tasks */}
        {renderTaskHierarchy(tasks, task.id, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Enhanced Task Management</h2>
          <div className="flex items-center gap-2">
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
              New Task
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'tasks', label: 'Tasks', count: tasks.length },
            { id: 'recommendations', label: 'Recommendations', count: recommendations.length },
            { id: 'analytics', label: 'Analytics', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Task Hierarchy</h3>
              <div className="text-sm text-gray-400">
                {tasks.filter(t => t.completed).length} of {tasks.length} completed
              </div>
            </div>
            {renderTaskHierarchy(tasks)}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">AI Task Recommendations</h3>
            {recommendations.map(rec => (
              <div key={rec.task.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium">{rec.task.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 font-medium">Score: {rec.score}</span>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                      Start Task
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{rec.reasoning}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Priority: {rec.task.priority}</span>
                  <span>Complexity: {rec.task.complexity}</span>
                  <span>Estimated: {rec.task.estimatedHours}h</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">Task Analytics</h3>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total Tasks', value: tasks.length, color: 'text-blue-400' },
                { label: 'Completed', value: tasks.filter(t => t.completed).length, color: 'text-green-400' },
                { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'text-yellow-400' },
                { label: 'Avg Complexity', value: (tasks.reduce((sum, t) => sum + (t.complexity || 5), 0) / tasks.length).toFixed(1), color: 'text-purple-400' }
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Complexity Distribution</h4>
              <div className="space-y-2">
                {[
                  { range: '1-3 (Low)', count: tasks.filter(t => (t.complexity || 5) <= 3).length, color: 'bg-green-400' },
                  { range: '4-6 (Medium)', count: tasks.filter(t => (t.complexity || 5) >= 4 && (t.complexity || 5) <= 6).length, color: 'bg-yellow-400' },
                  { range: '7-10 (High)', count: tasks.filter(t => (t.complexity || 5) >= 7).length, color: 'bg-red-400' }
                ].map(item => (
                  <div key={item.range} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-400">{item.range}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`} 
                        style={{ width: `${(item.count / tasks.length) * 100}%` }}
                      />
                    </div>
                    <div className="w-8 text-sm text-gray-400">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagementDashboard;
