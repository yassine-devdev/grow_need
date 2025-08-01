import React, { useState, useEffect } from 'react';
import { agenticTools, Memory } from '../../services/agenticToolsIntegration';

interface AgentMemorySystemProps {
  className?: string;
}

const AgentMemorySystem: React.FC<AgentMemorySystemProps> = ({ className = '' }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'create'>('browse');
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    category: '',
    metadata: {}
  });

  // Mock data for demonstration
  const mockMemories: Memory[] = [
    {
      id: 'mem-1',
      title: 'CRM Integration Best Practices',
      content: 'Key learnings from implementing CRM systems: 1) Always use fallback data for API failures, 2) Implement proper loading states, 3) Use glassmorphic design for modern UI, 4) Include comprehensive error handling...',
      metadata: { 
        project: 'GROW YouR NEED', 
        tags: ['crm', 'best-practices', 'frontend'],
        importance: 'high',
        source: 'implementation-experience'
      },
      createdAt: '2024-01-20T10:30:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      category: 'technical_knowledge'
    },
    {
      id: 'mem-2',
      title: 'User Preferences and Feedback',
      content: 'User prefers thorough verification and clean state checking before confirming fixes work. Wants AI to create actual enforcement tools rather than just verbal commitments. Prefers incentive-based methodology adoption over enforcement.',
      metadata: { 
        user: 'primary',
        preferences: ['verification', 'enforcement-tools', 'incentive-based'],
        priority: 'critical'
      },
      createdAt: '2024-01-19T15:45:00Z',
      updatedAt: '2024-01-20T09:15:00Z',
      category: 'user_preferences'
    },
    {
      id: 'mem-3',
      title: 'Agentic Tools MCP Integration',
      content: 'Successfully integrated @pimzino/agentic-tools-mcp v1.8.1 providing advanced task management, agent memories, and AI workflow automation. Features unlimited hierarchy, dependencies, priorities, complexity estimation...',
      metadata: { 
        integration: 'agentic-tools-mcp',
        version: '1.8.1',
        status: 'completed',
        capabilities: ['task-management', 'memories', 'ai-tools']
      },
      createdAt: '2024-01-20T16:00:00Z',
      updatedAt: '2024-01-20T16:00:00Z',
      category: 'integration_progress'
    },
    {
      id: 'mem-4',
      title: 'School Management System Architecture',
      content: 'The system follows a modular architecture with separate modules for CRM, AI concierge, content management, and user administration. Each module has its own L1/L2 navigation and component structure...',
      metadata: { 
        architecture: 'modular',
        modules: ['crm', 'ai-concierge', 'content', 'user-admin'],
        patterns: ['component-based', 'navigation-hierarchy']
      },
      createdAt: '2024-01-18T12:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      category: 'system_architecture'
    }
  ];

  const categories = [
    'all',
    'technical_knowledge',
    'user_preferences', 
    'integration_progress',
    'system_architecture',
    'project_context',
    'troubleshooting'
  ];

  useEffect(() => {
    const loadMemories = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would call the MCP server
        setMemories(mockMemories);
        setSearchResults(mockMemories);
      } catch (error) {
        console.error('Failed to load memories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, []);

  useEffect(() => {
    const filtered = selectedCategory === 'all' 
      ? memories 
      : memories.filter(memory => memory.category === selectedCategory);
    setSearchResults(filtered);
  }, [selectedCategory, memories]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(memories);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would call the MCP server's intelligent search
      const results = memories.filter(memory => 
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(memory.metadata).some(value => 
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMemory = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) return;

    try {
      const memory = await agenticTools.createMemory(
        newMemory.title,
        newMemory.content,
        {
          category: newMemory.category || undefined,
          metadata: newMemory.metadata
        }
      );
      
      setMemories(prev => [memory, ...prev]);
      setNewMemory({ title: '', content: '', category: '', metadata: {} });
      setActiveTab('browse');
    } catch (error) {
      console.error('Failed to create memory:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical_knowledge: 'text-blue-400 bg-blue-400/20',
      user_preferences: 'text-purple-400 bg-purple-400/20',
      integration_progress: 'text-green-400 bg-green-400/20',
      system_architecture: 'text-yellow-400 bg-yellow-400/20',
      project_context: 'text-cyan-400 bg-cyan-400/20',
      troubleshooting: 'text-red-400 bg-red-400/20'
    };
    return colors[category as keyof typeof colors] || 'text-gray-400 bg-gray-400/20';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Agent Memory System</h2>
          <div className="text-sm text-gray-400">
            {memories.length} memories stored
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'browse', label: 'Browse', count: searchResults.length },
            { id: 'search', label: 'Search', count: null },
            { id: 'create', label: 'Create', count: null }
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
        {activeTab === 'browse' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm text-gray-400">Category:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Memory List */}
            <div className="space-y-3">
              {searchResults.map(memory => (
                <div key={memory.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{memory.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memory.category || '')}`}>
                        {memory.category?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(memory.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                    {memory.content}
                  </p>
                  
                  {Object.keys(memory.metadata).length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(memory.metadata).slice(0, 5).map(([key, value]) => (
                        <span key={key} className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
                          {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search memories by content, title, or metadata..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            <div className="text-sm text-gray-400 mb-4">
              Found {searchResults.length} memories
            </div>

            {/* Search Results */}
            <div className="space-y-3">
              {searchResults.map(memory => (
                <div key={memory.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium">{memory.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(memory.category || '')}`}>
                      {memory.category?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {memory.content.substring(0, 200)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={newMemory.title}
                onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Memory title..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <select 
                value={newMemory.category} 
                onChange={(e) => setNewMemory(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Select category...</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Content</label>
              <textarea
                value={newMemory.content}
                onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Memory content..."
                rows={6}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveTab('browse')}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMemory}
                disabled={!newMemory.title.trim() || !newMemory.content.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded"
              >
                Create Memory
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMemorySystem;
