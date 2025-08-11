
import React, { useState, useEffect } from 'react';
import { aiProvider } from '../../../../services/aiProvider';
import '../shared.css';
import './AIGrading.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface GradingHistory {
  id: string;
  timestamp: string;
  assignment_title: string;
  student_name: string;
  grade: string;
  feedback_summary: string;
  rubric_used: string;
}

interface GradingResult {
  overall_score: number;
  max_score: number;
  percentage: number;
  letter_grade: string;
  detailed_feedback: string;
  rubric_breakdown: Array<{
    criterion: string;
    score: number;
    max_score: number;
    feedback: string;
  }>;
  suggestions_for_improvement: string[];
  strengths: string[];
}

const AIGrading: React.FC = () => {
    const [submission, setSubmission] = useState('');
    const [rubric, setRubric] = useState('- Correctness (40%)\n- Clarity (30%)\n- Depth of analysis (30%)');
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [studentName, setStudentName] = useState('');
    const [gradingType, setGradingType] = useState<'essay' | 'math' | 'code' | 'general'>('general');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<GradingHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [savedRubrics, setSavedRubrics] = useState<{[key: string]: string}>({});

    // Pre-defined rubrics for different subjects
    const predefinedRubrics = {
        essay: `Writing Quality (25%)
- Grammar and spelling
- Sentence structure and flow
- Vocabulary and word choice

Content and Ideas (30%)
- Thesis statement clarity
- Supporting evidence
- Organization and structure

Critical Thinking (25%)
- Analysis depth
- Argument strength
- Use of examples

Formatting and Citations (20%)
- Proper formatting
- Accurate citations
- Bibliography completeness`,
        
        math: `Problem Solving (40%)
- Correct approach/method
- Mathematical reasoning
- Solution accuracy

Work Shown (30%)
- Clear step-by-step process
- Proper mathematical notation
- Logical progression

Understanding (30%)
- Conceptual grasp
- Application of formulas
- Explanation clarity`,
        
        code: `Functionality (35%)
- Code runs without errors
- Meets all requirements
- Handles edge cases

Code Quality (25%)
- Clean, readable code
- Proper naming conventions
- Efficient algorithms

Documentation (20%)
- Comments and explanations
- Code organization
- Variable documentation

Best Practices (20%)
- Proper syntax
- Error handling
- Security considerations`,
        
        general: `Content Accuracy (40%)
- Factual correctness
- Completeness of response
- Relevance to topic

Clarity and Organization (30%)
- Logical structure
- Clear explanations
- Easy to follow

Effort and Depth (30%)
- Thoroughness
- Critical thinking
- Original insights`
    };

    useEffect(() => {
        loadGradingHistory();
        loadSavedRubrics();
    }, []);

    const loadGradingHistory = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/crm/grading-history');
            if (response.ok) {
                const data = await response.json();
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error('Failed to load grading history:', error);
            // Load mock history
            setHistory([
                {
                    id: '1',
                    timestamp: '2025-08-01 14:30',
                    assignment_title: 'Essay on Climate Change',
                    student_name: 'Emma Johnson',
                    grade: 'B+',
                    feedback_summary: 'Good analysis but needs stronger conclusion',
                    rubric_used: 'Essay Writing'
                }
            ]);
        }
    };

    const loadSavedRubrics = () => {
        const saved = localStorage.getItem('aiGradingRubrics');
        if (saved) {
            setSavedRubrics(JSON.parse(saved));
        }
    };

    const saveRubric = (name: string, rubricText: string) => {
        const updated = { ...savedRubrics, [name]: rubricText };
        setSavedRubrics(updated);
        localStorage.setItem('aiGradingRubrics', JSON.stringify(updated));
    };

    const handleGradingTypeChange = (type: 'essay' | 'math' | 'code' | 'general') => {
        setGradingType(type);
        setRubric(predefinedRubrics[type]);
    };

    const parseGradingResult = (aiResponse: string): GradingResult | null => {
        try {
            // Try to parse structured response
            if (aiResponse.includes('SCORE:') && aiResponse.includes('FEEDBACK:')) {
                const scoreMatch = aiResponse.match(/SCORE:\s*(\d+)\/(\d+)/);
                const feedbackMatch = aiResponse.match(/FEEDBACK:([\s\S]*?)(?=STRENGTHS:|$)/);
                const strengthsMatch = aiResponse.match(/STRENGTHS:([\s\S]*?)(?=IMPROVEMENTS:|$)/);
                const improvementsMatch = aiResponse.match(/IMPROVEMENTS:([\s\S]*?)$/);

                if (scoreMatch) {
                    const score = parseInt(scoreMatch[1]);
                    const maxScore = parseInt(scoreMatch[2]);
                    const percentage = Math.round((score / maxScore) * 100);
                    
                    return {
                        overall_score: score,
                        max_score: maxScore,
                        percentage,
                        letter_grade: getLetterGrade(percentage),
                        detailed_feedback: feedbackMatch?.[1]?.trim() || aiResponse,
                        rubric_breakdown: [],
                        suggestions_for_improvement: improvementsMatch?.[1]?.split('\n').filter(s => s.trim()) || [],
                        strengths: strengthsMatch?.[1]?.split('\n').filter(s => s.trim()) || []
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error parsing grading result:', error);
            return null;
        }
    };

    const getLetterGrade = (percentage: number): string => {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 63) return 'D';
        if (percentage >= 60) return 'D-';
        return 'F';
    };

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!submission.trim() || !rubric.trim()) return;

        setIsLoading(true);
        setError('');
        setFeedback('');
        setGradingResult(null);

        try {
            // Enhanced prompt for better structured output
            const enhancedPrompt = `
Please grade this ${gradingType} submission using the provided rubric. 
${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

Format your response as:
SCORE: [points earned]/[total points]
FEEDBACK: [Detailed feedback paragraph]
STRENGTHS: [List specific strengths]
IMPROVEMENTS: [List specific areas for improvement]

RUBRIC:
${rubric}

SUBMISSION:
${submission}
`;

            const aiResponse = await aiProvider.gradeSubmission(enhancedPrompt, rubric);
            setFeedback(aiResponse);
            
            const parsedResult = parseGradingResult(aiResponse);
            if (parsedResult) {
                setGradingResult(parsedResult);
            }

            // Save to history
            if (assignmentTitle && studentName) {
                const historyEntry: GradingHistory = {
                    id: Date.now().toString(),
                    timestamp: new Date().toLocaleString(),
                    assignment_title: assignmentTitle,
                    student_name: studentName,
                    grade: parsedResult?.letter_grade || 'N/A',
                    feedback_summary: aiResponse.substring(0, 100) + '...',
                    rubric_used: gradingType
                };
                
                setHistory(prev => [historyEntry, ...prev]);
                
                // Try to save to API
                try {
                    await fetch('http://localhost:5000/api/crm/grading-history', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(historyEntry)
                    });
                } catch (apiError) {
                    console.error('Failed to save to API:', apiError);
                }
            }

        } catch (err) {
            console.error("AI grading error:", err);
            setError("Failed to grade submission. Please check your AI connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const exportFeedback = () => {
        const exportData = {
            assignment: assignmentTitle,
            student: studentName,
            grade: gradingResult?.letter_grade,
            score: `${gradingResult?.overall_score}/${gradingResult?.max_score}`,
            percentage: `${gradingResult?.percentage}%`,
            feedback: feedback,
            timestamp: new Date().toLocaleString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grading_${studentName}_${assignmentTitle}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="ai-grading-container">
            <div className="ai-grading-header">
                <Icons.AIGrading size={48} className="text-cyan-400 opacity-80" />
                <h2 className="font-orbitron text-3xl font-bold text-white">AI-Assisted Grading</h2>
                <p className="text-gray-400 max-w-2xl text-center">
                    Advanced AI-powered grading with detailed feedback, rubric analysis, and grading history.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{history.length}</div>
                    <div className="text-gray-400 text-sm">Total Graded</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {history.filter(h => ['A', 'B'].some(grade => h.grade.startsWith(grade))).length}
                    </div>
                    <div className="text-gray-400 text-sm">A/B Grades</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{Object.keys(savedRubrics).length}</div>
                    <div className="text-gray-400 text-sm">Saved Rubrics</div>
                </GlassmorphicContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Grading Form */}
                <div className="lg:col-span-2">
                    <GlassmorphicContainer className="p-6">
                        <form onSubmit={handleGrade} className="space-y-4">
                            {/* Assignment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-white mb-2">Assignment Title</label>
                                    <input
                                        type="text"
                                        value={assignmentTitle}
                                        onChange={(e) => setAssignmentTitle(e.target.value)}
                                        placeholder="e.g., Essay on Climate Change"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Student Name</label>
                                    <input
                                        type="text"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                        placeholder="e.g., John Smith"
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Grading Type Selection */}
                            <div>
                                <label className="block text-white mb-2">Assignment Type</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {Object.keys(predefinedRubrics).map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => handleGradingTypeChange(type as any)}
                                            className={`p-2 rounded-lg text-sm transition-all duration-200 ${
                                                gradingType === type
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                                            }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student Submission */}
                            <div>
                                <label className="block text-white mb-2">Student Submission</label>
                                <textarea
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                    placeholder="Paste student's work here..."
                                    rows={8}
                                    disabled={isLoading}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-vertical"
                                />
                            </div>

                            {/* Rubric */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-white">Grading Rubric</label>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const name = prompt('Save rubric as:');
                                                if (name) saveRubric(name, rubric);
                                            }}
                                            className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                                        >
                                            Save Rubric
                                        </button>
                                        {Object.keys(savedRubrics).length > 0 && (
                                            <select
                                                onChange={(e) => {
                                                    if (e.target.value) setRubric(savedRubrics[e.target.value]);
                                                }}
                                                className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                                            >
                                                <option value="">Load Saved...</option>
                                                {Object.keys(savedRubrics).map(name => (
                                                    <option key={name} value={name} className="bg-gray-800">{name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                                <textarea
                                    value={rubric}
                                    onChange={(e) => setRubric(e.target.value)}
                                    placeholder="Define your grading criteria..."
                                    rows={6}
                                    disabled={isLoading}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                />
                            </div>

                            {/* Custom Instructions */}
                            <div>
                                <label className="block text-white mb-2">Additional Instructions (Optional)</label>
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g., Focus on creativity, Consider ESL background"
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !submission.trim() || !rubric.trim()}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Grading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Icons.ScanLine size={20} />
                                        <span>Grade with AI</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </GlassmorphicContainer>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* History Toggle */}
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                        <Icons.History size={16} />
                        <span>{showHistory ? 'Hide' : 'Show'} History</span>
                    </button>

                    {/* Grading History */}
                    {showHistory && (
                        <GlassmorphicContainer className="p-4">
                            <h3 className="text-white font-semibold mb-3">Recent Gradings</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {history.map(item => (
                                    <div key={item.id} className="p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white text-sm font-medium">{item.student_name}</span>
                                            <span className="text-green-400 text-sm">{item.grade}</span>
                                        </div>
                                        <div className="text-gray-400 text-xs">{item.assignment_title}</div>
                                        <div className="text-gray-500 text-xs">{item.timestamp}</div>
                                    </div>
                                ))}
                            </div>
                        </GlassmorphicContainer>
                    )}
                </div>
            </div>

            {/* Results */}
            {(feedback || gradingResult || error || isLoading) && (
                <GlassmorphicContainer className="p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-orbitron text-xl font-bold text-white">AI Evaluation</h3>
                        {feedback && !isLoading && (
                            <button
                                onClick={exportFeedback}
                                className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                            >
                                Export Results
                            </button>
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

                    {gradingResult && (
                        <div className="space-y-4">
                            {/* Score Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-white/10 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{gradingResult.letter_grade}</div>
                                    <div className="text-gray-400 text-sm">Letter Grade</div>
                                </div>
                                <div className="text-center p-3 bg-white/10 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{gradingResult.percentage}%</div>
                                    <div className="text-gray-400 text-sm">Percentage</div>
                                </div>
                                <div className="text-center p-3 bg-white/10 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{gradingResult.overall_score}</div>
                                    <div className="text-gray-400 text-sm">Points Earned</div>
                                </div>
                                <div className="text-center p-3 bg-white/10 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{gradingResult.max_score}</div>
                                    <div className="text-gray-400 text-sm">Total Points</div>
                                </div>
                            </div>

                            {/* Strengths and Improvements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gradingResult.strengths.length > 0 && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <h4 className="text-green-400 font-medium mb-2">Strengths</h4>
                                        <ul className="text-gray-300 text-sm space-y-1">
                                            {gradingResult.strengths.map((strength, index) => (
                                                <li key={index}>• {strength}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {gradingResult.suggestions_for_improvement.length > 0 && (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <h4 className="text-yellow-400 font-medium mb-2">Areas for Improvement</h4>
                                        <ul className="text-gray-300 text-sm space-y-1">
                                            {gradingResult.suggestions_for_improvement.map((suggestion, index) => (
                                                <li key={index}>• {suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {feedback && (
                        <div className="mt-4">
                            <h4 className="text-white font-medium mb-2">Detailed Feedback</h4>
                            <div className="p-4 bg-white/5 rounded-lg">
                                <pre className="text-gray-300 text-sm whitespace-pre-wrap">{feedback}</pre>
                            </div>
                        </div>
                    )}
                </GlassmorphicContainer>
            )}
        </div>
    );
};

export default AIGrading;
