import React, { useState, useEffect } from 'react';
import { agenticTools, TaskRecommendation, ComplexityAnalysis, ProgressInference, ResearchResult } from '../../services/agenticToolsIntegration';

interface AIAgentToolsProps {
  className?: string;
}

const AIAgentTools: React.FC<AIAgentToolsProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'complexity' | 'progress' | 'research' | 'prd'>('recommendations');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [complexityAnalysis, setComplexityAnalysis] = useState<ComplexityAnalysis[]>([]);
  const [progressInference, setProgressInference] = useState<ProgressInference[]>([]);
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [prdContent, setPrdContent] = useState('');

  // Mock data for demonstration
  const mockRecommendations: TaskRecommendation[] = [
    {
      task: {
        id: 'task-rec-1',
        name: 'Implement Payment Gateway Integration',
        details: 'Set up secure payment processing for tuition and fees with Stripe/PayPal integration',
        projectId: 'project-1',
        completed: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
        priority: 10,
        complexity: 8,
        status: 'pending',
        tags: ['backend', 'payments', 'security', 'integration'],
        estimatedHours: 24,
        dependsOn: ['task-1', 'task-2']
      },
      score: 95,
      reasoning: 'High priority task with all dependencies completed. Critical for revenue generation and user experience. Payment integration is essential for school operations.',
      dependencies: []
    },
    {
      task: {
        id: 'task-rec-2',
        name: 'Optimize Database Queries',
        details: 'Improve performance of student enrollment and grade reporting queries',
        projectId: 'project-1',
        completed: false,
        createdAt: '2024-01-20T11:00:00Z',
        updatedAt: '2024-01-20T11:00:00Z',
        priority: 7,
        complexity: 6,
        status: 'pending',
        tags: ['backend', 'performance', 'database'],
        estimatedHours: 12
      },
      score: 78,
      reasoning: 'Medium-high priority task that will improve overall system performance. Good candidate for next sprint.',
      dependencies: []
    }
  ];

  const mockComplexityAnalysis: ComplexityAnalysis[] = [
    {
      taskId: 'task-complex-1',
      currentComplexity: 9,
      recommendedBreakdown: true,
      suggestedSubtasks: [
        'Research payment gateway options',
        'Set up Stripe API integration',
        'Implement payment form UI',
        'Add payment validation',
        'Create payment confirmation flow',
        'Implement refund functionality',
        'Add payment history tracking'
      ],
      reasoning: 'This task has very high complexity (9/10) and should be broken down into smaller, manageable subtasks. The payment integration involves multiple components: API integration, UI development, security considerations, and error handling.'
    },
    {
      taskId: 'task-complex-2',
      currentComplexity: 4,
      recommendedBreakdown: false,
      reasoning: 'This task has moderate complexity (4/10) and can be completed as a single unit. The scope is well-defined and manageable.'
    }
  ];

  const mockProgressInference: ProgressInference[] = [
    {
      taskId: 'task-progress-1',
      inferredStatus: 'in-progress',
      confidence: 0.85,
      evidence: [
        'Found payment-related components in src/components/payments/',
        'Stripe API key configuration in environment variables',
        'Payment form component partially implemented',
        'Unit tests for payment validation created'
      ],
      reasoning: 'Code analysis indicates significant progress on payment integration. Multiple payment-related files have been created and modified recently.'
    },
    {
      taskId: 'task-progress-2',
      inferredStatus: 'done',
      confidence: 0.92,
      evidence: [
        'All database optimization files committed',
        'Performance tests passing',
        'Query execution time improved by 60%',
        'Documentation updated'
      ],
      reasoning: 'Strong evidence suggests this task is complete. All related files are committed, tests are passing, and performance metrics show improvement.'
    }
  ];

  const mockResearchResults: ResearchResult[] = [
    {
      taskId: 'task-research-1',
      researchAreas: [
        'Payment Gateway Best Practices',
        'School Management System Security',
        'PCI Compliance Requirements',
        'React Payment Form Libraries'
      ],
      findings: [
        'Stripe is the most popular choice for educational institutions',
        'PCI DSS compliance is mandatory for handling card data',
        'React Stripe.js provides secure payment forms',
        'Webhook handling is crucial for payment confirmation'
      ],
      memoriesCreated: ['payment-gateway-research', 'pci-compliance-guide', 'stripe-integration-best-practices'],
      queries: [
        'best payment gateways for schools 2024',
        'PCI compliance requirements education sector',
        'React Stripe integration tutorial',
        'payment webhook security best practices'
      ]
    }
  ];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would call the MCP server
      switch (activeTab) {
        case 'recommendations':
          setRecommendations(mockRecommendations);
          break;
        case 'complexity':
          setComplexityAnalysis(mockComplexityAnalysis);
          break;
        case 'progress':
          setProgressInference(mockProgressInference);
          break;
        case 'research':
          setResearchResults(mockResearchResults);
          break;
      }
    } catch (error) {
      console.error('Failed to load AI agent tools data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async (type: string) => {
    setLoading(true);
    try {
      switch (type) {
        case 'recommendations':
          const recs = await agenticTools.getTaskRecommendations('project-1', {
            maxRecommendations: 5,
            considerComplexity: true
          });
          setRecommendations(recs);
          break;
        case 'complexity':
          const analysis = await agenticTools.analyzeTaskComplexity(undefined, {
            complexityThreshold: 7,
            suggestBreakdown: true
          });
          setComplexityAnalysis(analysis);
          break;
        case 'progress':
          const progress = await agenticTools.inferTaskProgress('project-1', {
            scanDepth: 3,
            autoUpdateTasks: false
          });
          setProgressInference(progress);
          break;
      }
    } catch (error) {
      console.error(`Failed to run ${type} analysis:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleResearchTask = async (taskId: string) => {
    setLoading(true);
    try {
      const result = await agenticTools.researchTask(taskId, {
        saveToMemories: true,
        researchDepth: 'comprehensive'
      });
      setResearchResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Failed to research task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParsePRD = async () => {
    if (!prdContent.trim()) return;
    
    setLoading(true);
    try {
      const tasks = await agenticTools.parsePRD('project-1', prdContent, {
        generateSubtasks: true,
        defaultPriority: 5,
        estimateComplexity: true
      });
      console.log('Generated tasks from PRD:', tasks);
      // In a real implementation, these would be added to the task list
    } catch (error) {
      console.error('Failed to parse PRD:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-400 bg-green-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/20';
      case 'blocked': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400';
    if (confidence >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">AI Agent Tools</h2>
          <button
            onClick={() => handleRunAnalysis(activeTab)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? 'Running...' : 'Run Analysis'}
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          {[
            { id: 'recommendations', label: 'Task Recommendations', count: recommendations.length },
            { id: 'complexity', label: 'Complexity Analysis', count: complexityAnalysis.length },
            { id: 'progress', label: 'Progress Inference', count: progressInference.length },
            { id: 'research', label: 'Research Results', count: researchResults.length },
            { id: 'prd', label: 'PRD Parser', count: null }
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
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">AI Task Recommendations</h3>
              <div className="text-sm text-gray-400">
                Based on dependencies, priorities, and current progress
              </div>
            </div>
            
            {recommendations.map(rec => (
              <div key={rec.task.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-medium">{rec.task.name}</h4>
                      <span className="text-green-400 font-medium text-sm">Score: {rec.score}</span>
                      <span className="text-red-400 font-medium text-sm">P{rec.task.priority}</span>
                      <span className="text-yellow-400 font-medium text-sm">C{rec.task.complexity}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{rec.task.details}</p>
                    <p className="text-gray-400 text-sm mb-3">{rec.reasoning}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResearchTask(rec.task.id)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Research
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                      Start Task
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {rec.task.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Estimated: {rec.task.estimatedHours}h</span>
                  {rec.task.dependsOn && rec.task.dependsOn.length > 0 && (
                    <span>Depends on: {rec.task.dependsOn.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'complexity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Task Complexity Analysis</h3>
            
            {complexityAnalysis.map(analysis => (
              <div key={analysis.taskId} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-medium">Task: {analysis.taskId}</h4>
                      <span className="text-yellow-400 font-medium">Complexity: {analysis.currentComplexity}/10</span>
                      {analysis.recommendedBreakdown && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Breakdown Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{analysis.reasoning}</p>
                  </div>
                </div>
                
                {analysis.suggestedSubtasks && (
                  <div>
                    <h5 className="text-white font-medium mb-2">Suggested Subtasks:</h5>
                    <div className="space-y-1">
                      {analysis.suggestedSubtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-4 h-4 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          {subtask}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Progress Inference from Codebase</h3>
            
            {progressInference.map(inference => (
              <div key={inference.taskId} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-medium">Task: {inference.taskId}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inference.inferredStatus)}`}>
                        {inference.inferredStatus.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className={`font-medium ${getConfidenceColor(inference.confidence)}`}>
                        {Math.round(inference.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{inference.reasoning}</p>
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                    Update Task
                  </button>
                </div>
                
                <div>
                  <h5 className="text-white font-medium mb-2">Evidence:</h5>
                  <div className="space-y-1">
                    {inference.evidence.map((evidence, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                        {evidence}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">Research Results</h3>
            
            {researchResults.map(result => (
              <div key={result.taskId} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-medium">Research for Task: {result.taskId}</h4>
                  <span className="text-sm text-gray-400">
                    {result.memoriesCreated.length} memories created
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white font-medium mb-2">Research Areas:</h5>
                    <div className="space-y-1">
                      {result.researchAreas.map((area, index) => (
                        <div key={index} className="text-sm text-gray-300">• {area}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-white font-medium mb-2">Key Findings:</h5>
                    <div className="space-y-1">
                      {result.findings.map((finding, index) => (
                        <div key={index} className="text-sm text-gray-300">• {finding}</div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="text-white font-medium mb-2">Memories Created:</h5>
                  <div className="flex flex-wrap gap-1">
                    {result.memoriesCreated.map(memory => (
                      <span key={memory} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                        {memory}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prd' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white mb-4">PRD Parser</h3>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Product Requirements Document Content
                </label>
                <textarea
                  value={prdContent}
                  onChange={(e) => setPrdContent(e.target.value)}
                  placeholder="Paste your PRD content here. The AI will automatically parse it and generate structured tasks with priorities, complexity estimates, and dependencies..."
                  rows={12}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  AI will generate tasks with priorities, complexity estimates, and dependencies
                </div>
                <button
                  onClick={handleParsePRD}
                  disabled={!prdContent.trim() || loading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Parsing...' : 'Parse PRD'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgentTools;
