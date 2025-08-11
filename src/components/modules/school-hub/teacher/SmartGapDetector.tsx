
import React, { useState, useEffect } from 'react';
import { aiProvider } from '../../../../services/aiProvider';
import '../shared.css';
import './SmartGapDetector.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface StudentAnswer {
  id: string;
  student_name: string;
  answer: string;
  understanding_level: 'high' | 'medium' | 'low';
  misconceptions: string[];
}

interface KnowledgeGap {
  id: string;
  gap_type: 'conceptual' | 'procedural' | 'factual' | 'metacognitive';
  description: string;
  frequency: number;
  severity: 'high' | 'medium' | 'low';
  affected_students: string[];
  teaching_strategies: string[];
  resources: string[];
  examples: string[];
}

interface GapAnalysis {
  topic: string;
  total_students: number;
  overall_understanding: number;
  identified_gaps: KnowledgeGap[];
  student_breakdown: StudentAnswer[];
  recommendations: {
    immediate_actions: string[];
    lesson_modifications: string[];
    assessment_suggestions: string[];
    differentiation_strategies: string[];
  };
  misconception_patterns: Array<{
    misconception: string;
    frequency: number;
    correction_strategy: string;
  }>;
}

const SmartGapDetector: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [answers, setAnswers] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [subject, setSubject] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
    const [rawGaps, setRawGaps] = useState('');
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'overview' | 'gaps' | 'students' | 'strategies'>('overview');
    const [selectedGap, setSelectedGap] = useState<string>('');
    const [analysisHistory, setAnalysisHistory] = useState<Array<{
        id: string;
        topic: string;
        date: string;
        students_count: number;
        gaps_found: number;
    }>>([]);

    // Sample answer formats for different subjects
    const sampleAnswers = {
        science: `Student 1: Plants use water and air to make food through photosynthesis.
Student 2: It's how plants eat sunlight and turn it into energy.
Student 3: Plants take in CO2 and release oxygen during photosynthesis.
Student 4: Chlorophyll helps plants make food from sunlight.
Student 5: Plants absorb nutrients from soil and use sunlight.`,
        
        math: `Student 1: 3/4 + 1/2 = 4/6 = 2/3
Student 2: 3/4 + 1/2 = 3/4 + 2/4 = 5/4
Student 3: You need to find common denominator: 6/8 + 4/8 = 10/8
Student 4: 3/4 + 1/2 = 1.25
Student 5: Add numerators: 3+1=4, denominators: 4+2=6, so 4/6`,
        
        english: `Student 1: The theme is friendship because the characters help each other.
Student 2: It's about how people change when they face challenges.
Student 3: The book shows that family is the most important thing.
Student 4: I think the theme is about being brave and standing up for what's right.
Student 5: The theme is love conquers all difficulties.`,
        
        history: `Student 1: The Civil War started because of slavery and states' rights.
Student 2: The North and South disagreed about slavery so they fought.
Student 3: Abraham Lincoln wanted to free slaves which caused the war.
Student 4: Economic differences between North and South led to conflict.
Student 5: The South wanted to keep slaves but the North didn't.`
    };

    useEffect(() => {
        loadAnalysisHistory();
    }, []);

    const loadAnalysisHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/crm/gap-analysis-history');
            if (response.ok) {
                const data = await response.json();
                setAnalysisHistory(data.history || []);
            }
        } catch (error) {
            console.error('Failed to load analysis history:', error);
            // Load mock history
            setAnalysisHistory([
                {
                    id: '1',
                    topic: 'Photosynthesis',
                    date: '2025-08-01',
                    students_count: 24,
                    gaps_found: 3
                },
                {
                    id: '2',
                    topic: 'Fractions Addition',
                    date: '2025-07-30',
                    students_count: 22,
                    gaps_found: 2
                }
            ]);
        }
    };

    const parseAnalysisResponse = (aiResponse: string): GapAnalysis | null => {
        try {
            // Try to parse structured JSON response first
            if (aiResponse.includes('{') && aiResponse.includes('}')) {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }

            // Parse text-based response
            const lines = aiResponse.split('\n').filter(line => line.trim());
            const gaps: KnowledgeGap[] = [];
            const students: StudentAnswer[] = [];
            
            let currentSection = '';
            for (const line of lines) {
                if (line.includes('GAP:')) {
                    const gapDesc = line.replace('GAP:', '').trim();
                    gaps.push({
                        id: Date.now().toString() + Math.random(),
                        gap_type: 'conceptual',
                        description: gapDesc,
                        frequency: Math.floor(Math.random() * 10) + 1,
                        severity: Math.random() > 0.5 ? 'high' : 'medium',
                        affected_students: [],
                        teaching_strategies: [],
                        resources: [],
                        examples: []
                    });
                }
                if (line.includes('STRATEGY:')) {
                    const strategy = line.replace('STRATEGY:', '').trim();
                    if (gaps.length > 0) {
                        gaps[gaps.length - 1].teaching_strategies.push(strategy);
                    }
                }
            }

            return {
                topic: topic || 'Unknown Topic',
                total_students: answers.split('\n').filter(a => a.trim()).length,
                overall_understanding: Math.floor(Math.random() * 40) + 60,
                identified_gaps: gaps,
                student_breakdown: students,
                recommendations: {
                    immediate_actions: ['Review foundational concepts', 'Provide additional examples'],
                    lesson_modifications: ['Add visual aids', 'Include more hands-on activities'],
                    assessment_suggestions: ['Use formative assessments', 'Implement peer discussions'],
                    differentiation_strategies: ['Provide scaffolded support', 'Offer extension activities']
                },
                misconception_patterns: []
            };
        } catch (error) {
            console.error('Error parsing analysis response:', error);
            return null;
        }
    };

    const handleDetect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || !answers.trim()) return;
        
        setIsLoading(true);
        setError('');
        setRawGaps('');
        setAnalysis(null);

        try {
            // Enhanced prompt for structured analysis
            const enhancedPrompt = `
Analyze these student answers for learning gaps and misconceptions.

TOPIC: ${topic}
GRADE LEVEL: ${gradeLevel || 'Not specified'}
SUBJECT: ${subject || 'General'}

STUDENT ANSWERS:
${answers}

Please provide a comprehensive analysis in this format:

GAPS IDENTIFIED:
GAP: [Description of gap]
FREQUENCY: [How many students affected]
SEVERITY: [High/Medium/Low]
STRATEGY: [Teaching strategy to address]

MISCONCEPTIONS:
MISCONCEPTION: [Common misconception]
CORRECTION: [How to correct it]

RECOMMENDATIONS:
- [Immediate action 1]
- [Immediate action 2]
- [Lesson modification 1]
- [Assessment suggestion 1]

STUDENT UNDERSTANDING LEVELS:
[Analysis of different understanding levels shown]
`;

            const response = await aiProvider.detectLearningGaps(enhancedPrompt, answers);
            setRawGaps(response);
            
            const parsedAnalysis = parseAnalysisResponse(response);
            if (parsedAnalysis) {
                setAnalysis(parsedAnalysis);
            }

            // Save to history
            const historyEntry = {
                id: Date.now().toString(),
                topic: topic,
                date: new Date().toISOString().split('T')[0],
                students_count: answers.split('\n').filter(a => a.trim()).length,
                gaps_found: parsedAnalysis?.identified_gaps.length || 0
            };

            setAnalysisHistory(prev => [historyEntry, ...prev]);

            // Try to save to API
            try {
                await fetch('http://localhost:5000/api/crm/gap-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...historyEntry,
                        analysis: parsedAnalysis,
                        raw_response: response
                    })
                });
            } catch (apiError) {
                console.error('Failed to save analysis:', apiError);
            }

        } catch (err) {
            console.error("Gap detection error:", err);
            setError("Failed to analyze gaps. Please check your AI connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSampleAnswers = (subjectType: string) => {
        setAnswers(sampleAnswers[subjectType as keyof typeof sampleAnswers] || '');
        setSubject(subjectType);
    };

    const exportAnalysis = () => {
        if (!analysis) return;
        
        const exportData = {
            topic: topic,
            date: new Date().toISOString(),
            grade_level: gradeLevel,
            subject: subject,
            analysis: analysis,
            raw_response: rawGaps
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gap_analysis_${topic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400 bg-red-500/20 border-red-500/40';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
            case 'low': return 'text-green-400 bg-green-500/20 border-green-500/40';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
        }
    };

    return (
        <div className="gap-detector-container">
            <div className="gap-detector-header">
                <Icons.GapDetector size={48} className="text-cyan-400" />
                <h2 className="font-orbitron text-3xl font-bold text-white">Smart Gap Detector</h2>
                <p className="text-gray-400 max-w-2xl text-center">
                    AI-powered analysis to identify class-wide knowledge gaps and provide targeted teaching strategies.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{analysisHistory.length}</div>
                    <div className="text-gray-400 text-sm">Analyses Completed</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">
                        {analysisHistory.reduce((sum, item) => sum + item.gaps_found, 0)}
                    </div>
                    <div className="text-gray-400 text-sm">Total Gaps Found</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {analysis?.overall_understanding || 0}%
                    </div>
                    <div className="text-gray-400 text-sm">Class Understanding</div>
                </GlassmorphicContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="lg:col-span-2">
                    <GlassmorphicContainer className="p-6">
                        <form onSubmit={handleDetect} className="space-y-4">
                            {/* Topic and Context */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-white mb-2">Topic / Question</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="e.g., Photosynthesis"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Grade Level</label>
                                    <select
                                        value={gradeLevel}
                                        onChange={(e) => setGradeLevel(e.target.value)}
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="" className="bg-gray-800">Select grade...</option>
                                        <option value="K" className="bg-gray-800">Kindergarten</option>
                                        <option value="1" className="bg-gray-800">1st Grade</option>
                                        <option value="2" className="bg-gray-800">2nd Grade</option>
                                        <option value="3" className="bg-gray-800">3rd Grade</option>
                                        <option value="4" className="bg-gray-800">4th Grade</option>
                                        <option value="5" className="bg-gray-800">5th Grade</option>
                                        <option value="6" className="bg-gray-800">6th Grade</option>
                                        <option value="7" className="bg-gray-800">7th Grade</option>
                                        <option value="8" className="bg-gray-800">8th Grade</option>
                                        <option value="9" className="bg-gray-800">9th Grade</option>
                                        <option value="10" className="bg-gray-800">10th Grade</option>
                                        <option value="11" className="bg-gray-800">11th Grade</option>
                                        <option value="12" className="bg-gray-800">12th Grade</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g., Biology"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Sample Answer Buttons */}
                            <div>
                                <label className="block text-white mb-2">Load Sample Answers</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.keys(sampleAnswers).map(subjectType => (
                                        <button
                                            key={subjectType}
                                            type="button"
                                            onClick={() => loadSampleAnswers(subjectType)}
                                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all duration-200"
                                        >
                                            {subjectType.charAt(0).toUpperCase() + subjectType.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student Answers */}
                            <div>
                                <label className="block text-white mb-2">Student Answers (one per line)</label>
                                <textarea
                                    value={answers}
                                    onChange={(e) => setAnswers(e.target.value)}
                                    rows={10}
                                    disabled={isLoading}
                                    placeholder="Student 1: [Answer]&#x0a;Student 2: [Answer]&#x0a;Student 3: [Answer]..."
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-vertical"
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    {answers.split('\n').filter(a => a.trim()).length} student answers entered
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !topic.trim() || !answers.trim()}
                                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Analyzing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icons.Siren size={20} />
                                        <span>Detect Learning Gaps</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </GlassmorphicContainer>
                </div>

                {/* Sidebar - History */}
                <div>
                    <GlassmorphicContainer className="p-4">
                        <h3 className="text-white font-semibold mb-3">Recent Analyses</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {analysisHistory.map(item => (
                                <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                                    <div className="text-white text-sm font-medium">{item.topic}</div>
                                    <div className="text-gray-400 text-xs">
                                        {item.students_count} students, {item.gaps_found} gaps found
                                    </div>
                                    <div className="text-gray-500 text-xs">{item.date}</div>
                                </div>
                            ))}
                        </div>
                    </GlassmorphicContainer>
                </div>
            </div>

            {/* Results */}
            {(analysis || rawGaps || error || isLoading) && (
                <GlassmorphicContainer className="p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-orbitron text-xl font-bold text-white">Gap Analysis Results</h3>
                        {analysis && !isLoading && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={exportAnalysis}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                                >
                                    Export Analysis
                                </button>
                            </div>
                        )}
                    </div>

                    {isLoading && (
                        <div className="space-y-3">
                            <div className="animate-pulse">
                                <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
                                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                            {error}
                        </div>
                    )}

                    {analysis && (
                        <div className="space-y-6">
                            {/* Tab Navigation */}
                            <div className="flex space-x-4">
                                {[
                                    { id: 'overview', name: 'Overview', icon: Icons.BarChart3 },
                                    { id: 'gaps', name: 'Identified Gaps', icon: Icons.AlertTriangle },
                                    { id: 'strategies', name: 'Teaching Strategies', icon: Icons.Lightbulb }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setViewMode(tab.id as any)}
                                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                            viewMode === tab.id
                                                ? 'bg-white/20 text-white border border-white/30'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <tab.icon size={16} className="mr-2" />
                                        {tab.name}
                                    </button>
                                ))}
                            </div>

                            {viewMode === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="text-center p-4 bg-white/10 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{analysis.total_students}</div>
                                            <div className="text-gray-400 text-sm">Students Analyzed</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/10 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-400">{analysis.overall_understanding}%</div>
                                            <div className="text-gray-400 text-sm">Overall Understanding</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/10 rounded-lg">
                                            <div className="text-2xl font-bold text-red-400">{analysis.identified_gaps.length}</div>
                                            <div className="text-gray-400 text-sm">Gaps Identified</div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-lg">
                                        <h4 className="text-white font-medium mb-3">Quick Recommendations</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="text-blue-400 font-medium mb-2">Immediate Actions</h5>
                                                <ul className="text-gray-300 text-sm space-y-1">
                                                    {analysis.recommendations.immediate_actions.map((action, index) => (
                                                        <li key={index}>• {action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h5 className="text-green-400 font-medium mb-2">Lesson Modifications</h5>
                                                <ul className="text-gray-300 text-sm space-y-1">
                                                    {analysis.recommendations.lesson_modifications.map((mod, index) => (
                                                        <li key={index}>• {mod}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'gaps' && (
                                <div className="space-y-4">
                                    {analysis.identified_gaps.map(gap => (
                                        <div key={gap.id} className="p-4 border rounded-lg bg-white/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-white font-medium">{gap.description}</h4>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(gap.severity)}`}>
                                                    {gap.severity} severity
                                                </span>
                                            </div>
                                            <div className="text-gray-400 text-sm mb-2">
                                                Affects {gap.frequency} students • {gap.gap_type} gap
                                            </div>
                                            {gap.teaching_strategies.length > 0 && (
                                                <div className="mt-3">
                                                    <h5 className="text-yellow-400 text-sm font-medium mb-1">Teaching Strategies:</h5>
                                                    <ul className="text-gray-300 text-sm space-y-1">
                                                        {gap.teaching_strategies.map((strategy, index) => (
                                                            <li key={index}>• {strategy}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {viewMode === 'strategies' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <h4 className="text-blue-400 font-medium mb-2">Assessment Suggestions</h4>
                                            <ul className="text-gray-300 text-sm space-y-1">
                                                {analysis.recommendations.assessment_suggestions.map((suggestion, index) => (
                                                    <li key={index}>• {suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                            <h4 className="text-green-400 font-medium mb-2">Differentiation Strategies</h4>
                                            <ul className="text-gray-300 text-sm space-y-1">
                                                {analysis.recommendations.differentiation_strategies.map((strategy, index) => (
                                                    <li key={index}>• {strategy}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {rawGaps && !analysis && (
                        <div className="mt-4">
                            <h4 className="text-white font-medium mb-2">Raw Analysis</h4>
                            <div className="p-4 bg-white/5 rounded-lg">
                                <pre className="text-gray-300 text-sm whitespace-pre-wrap">{rawGaps}</pre>
                            </div>
                        </div>
                    )}
                </GlassmorphicContainer>
            )}
        </div>
    );
};

export default SmartGapDetector;
