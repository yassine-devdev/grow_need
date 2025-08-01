import React, { useState, useEffect } from 'react';
import TaskManagementDashboard from './TaskManagementDashboard';
import AgentMemorySystem from './AgentMemorySystem';
import AIAgentTools from './AIAgentTools';
import { agenticTools } from '../../services/agenticToolsIntegration';

interface AgenticToolsDashboardProps {
  className?: string;
}

const AgenticToolsDashboard: React.FC<AgenticToolsDashboardProps> = ({ className = '' }) => {
  const [activeModule, setActiveModule] = useState<'overview' | 'tasks' | 'memories' | 'ai-tools' | 'research'>('overview');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalMemories: 0,
    activeRecommendations: 0
  });

  // Mock stats for demonstration
  const mockStats = {
    totalProjects: 1,
    totalTasks: 15,
    completedTasks: 8,
    totalMemories: 24,
    activeRecommendations: 3
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        // In a real implementation, these would call the MCP server
        setStats(mockStats);
      } catch (error) {
        console.error('Failed to load agentic tools stats:', error);
      }
    };

    loadStats();
  }, []);

  const modules = [
    {
      id: 'overview',
      name: 'Overview',
      description: 'System overview and quick stats',
      icon: '📊',
      color: 'text-blue-400'
    },
    {
      id: 'tasks',
      name: 'Task Management',
      description: 'Advanced task management with unlimited hierarchy',
      icon: '✅',
      color: 'text-green-400',
      count: stats.totalTasks
    },
    {
      id: 'memories',
      name: 'Agent Memories',
      description: 'Intelligent knowledge storage and retrieval',
      icon: '🧠',
      color: 'text-purple-400',
      count: stats.totalMemories
    },
    {
      id: 'ai-tools',
      name: 'AI Agent Tools',
      description: 'Intelligent workflow automation and analysis',
      icon: '🤖',
      color: 'text-cyan-400',
      count: stats.activeRecommendations
    },
    {
      id: 'research',
      name: 'Research Hub',
      description: 'Hybrid web research with memory caching',
      icon: '🔍',
      color: 'text-yellow-400'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Agentic Tools MCP Integration</h2>
        <p className="text-gray-400">
          Advanced AI capabilities with task management, agent memories, and intelligent workflow automation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Projects', value: stats.totalProjects, color: 'text-blue-400', icon: '📁' },
          { label: 'Total Tasks', value: stats.totalTasks, color: 'text-green-400', icon: '✅' },
          { label: 'Completed', value: stats.completedTasks, color: 'text-emerald-400', icon: '✨' },
          { label: 'Memories', value: stats.totalMemories, color: 'text-purple-400', icon: '🧠' },
          { label: 'AI Recommendations', value: stats.activeRecommendations, color: 'text-cyan-400', icon: '🤖' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Management Features */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            ✅ Enhanced Task Management
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Unlimited hierarchy with parentId relationships
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Dependencies and priority management (1-10)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Complexity estimation and breakdown suggestions
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Time tracking and progress visualization
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Status workflow: pending → in-progress → blocked → done
            </div>
          </div>
        </div>

        {/* Agent Memories Features */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🧠 Agent Memory System
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Intelligent text-based search with relevance scoring
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Categorization and metadata support
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              JSON file storage for Git trackability
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              Context retention across conversations
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
              User preferences and project knowledge
            </div>
          </div>
        </div>

        {/* AI Agent Tools Features */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🤖 AI Agent Tools
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              Intelligent task recommendations with scoring
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              Complexity analysis and breakdown suggestions
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              Progress inference from codebase analysis
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              PRD parsing with automatic task generation
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              Research integration with memory caching
            </div>
          </div>
        </div>

        {/* Research Hub Features */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            🔍 Research Integration
          </h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Hybrid web research with intelligent queries
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Automatic memory creation from findings
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Research depth control (quick/standard/comprehensive)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Knowledge building and context accumulation
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Task-specific research with targeted queries
            </div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Integration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { component: 'MCP Server', status: 'Connected', color: 'text-green-400' },
            { component: 'Task Management', status: 'Active', color: 'text-green-400' },
            { component: 'Agent Memories', status: 'Active', color: 'text-green-400' },
            { component: 'AI Agent Tools', status: 'Active', color: 'text-green-400' },
            { component: 'Research Integration', status: 'Ready', color: 'text-yellow-400' },
            { component: 'Project Storage', status: 'Configured', color: 'text-green-400' }
          ].map(item => (
            <div key={item.component} className="flex items-center justify-between p-3 bg-gray-700/50 rounded">
              <span className="text-gray-300">{item.component}</span>
              <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Create Task', action: () => setActiveModule('tasks'), color: 'bg-green-500' },
            { label: 'Add Memory', action: () => setActiveModule('memories'), color: 'bg-purple-500' },
            { label: 'Get Recommendations', action: () => setActiveModule('ai-tools'), color: 'bg-cyan-500' },
            { label: 'Start Research', action: () => setActiveModule('research'), color: 'bg-yellow-500' }
          ].map(action => (
            <button
              key={action.label}
              onClick={action.action}
              className={`${action.color} hover:opacity-80 text-white px-4 py-2 rounded text-sm font-medium`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResearchHub = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Research Hub</h2>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Research Integration Coming Soon</h3>
          <p className="text-gray-400 mb-6">
            Hybrid web research with memory caching and intelligent query generation
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <div>• Automatic research query generation for tasks</div>
            <div>• Web search integration with result caching</div>
            <div>• Memory creation from research findings</div>
            <div>• Knowledge building and context accumulation</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Agentic Tools Dashboard</h1>
            <p className="text-gray-400">Advanced AI capabilities powered by MCP integration</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-sm text-gray-400">MCP Server Connected</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
        <div className="flex space-x-1 overflow-x-auto">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeModule === module.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="text-lg">{module.icon}</span>
              {module.name}
              {module.count !== undefined && (
                <span className="ml-1 px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                  {module.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeModule === 'overview' && renderOverview()}
        {activeModule === 'tasks' && <TaskManagementDashboard />}
        {activeModule === 'memories' && <AgentMemorySystem />}
        {activeModule === 'ai-tools' && <AIAgentTools />}
        {activeModule === 'research' && renderResearchHub()}
      </div>
    </div>
  );
};

export default AgenticToolsDashboard;
