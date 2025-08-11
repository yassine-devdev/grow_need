
import React, { useState, useEffect } from 'react';
import { aiProvider } from '../../../../services/aiProvider';
import '../shared.css';
import './ContentGenerator.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  icon: any;
  description: string;
  requirements: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface GeneratedContent {
  id: string;
  title: string;
  type: string;
  content: string;
  metadata: {
    gradeLevel: string;
    topic: string;
    difficulty: string;
    generatedAt: string;
    wordCount: number;
    estimatedDuration: string;
  };
  tags: string[];
}

interface ContentLibrary {
  id: string;
  title: string;
  type: string;
  date: string;
  gradeLevel: string;
  topic: string;
  rating: number;
  usage: number;
}

const ContentGenerator: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
    const [customType, setCustomType] = useState('');
    const [topic, setTopic] = useState('');
    const [gradeLevel, setGradeLevel] = useState('10');
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
    const [standards, setStandards] = useState('');
    const [duration, setDuration] = useState('45');
    const [learningObjectives, setLearningObjectives] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'generator' | 'library' | 'templates'>('generator');
    const [contentLibrary, setContentLibrary] = useState<ContentLibrary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const contentTemplates: ContentTemplate[] = [
        {
            id: 'quiz',
            name: 'Interactive Quiz',
            type: 'assessment',
            icon: Icons.ClipboardCheck,
            description: 'Multiple choice and short answer questions with instant feedback',
            requirements: 'Create 5-10 questions with explanations for answers',
            difficulty: 'beginner',
            estimatedTime: '15 min'
        },
        {
            id: 'lesson',
            name: 'Comprehensive Lesson Plan',
            type: 'instruction',
            icon: Icons.BookOpen,
            description: 'Detailed lesson with objectives, activities, and assessments',
            requirements: 'Include warm-up, main activity, assessment, and closure',
            difficulty: 'intermediate',
            estimatedTime: '45 min'
        },
        {
            id: 'worksheet',
            name: 'Practice Worksheet',
            type: 'practice',
            icon: Icons.FileText,
            description: 'Structured practice exercises with varying difficulty levels',
            requirements: 'Include examples, guided practice, and independent work',
            difficulty: 'beginner',
            estimatedTime: '30 min'
        },
        {
            id: 'project',
            name: 'Project-Based Learning',
            type: 'project',
            icon: Icons.Lightbulb,
            description: 'Real-world project with rubric and milestone checkpoints',
            requirements: 'Include project description, timeline, deliverables, and rubric',
            difficulty: 'advanced',
            estimatedTime: '2-3 weeks'
        },
        {
            id: 'lab',
            name: 'Hands-on Lab Activity',
            type: 'experiment',
            icon: Icons.FlaskConical,
            description: 'Step-by-step lab procedure with safety and analysis',
            requirements: 'Include materials, procedure, safety notes, and analysis questions',
            difficulty: 'advanced',
            estimatedTime: '60 min'
        },
        {
            id: 'discussion',
            name: 'Socratic Seminar',
            type: 'discussion',
            icon: Icons.MessageSquare,
            description: 'Structured discussion with thought-provoking questions',
            requirements: 'Include opening questions, discussion guide, and reflection',
            difficulty: 'intermediate',
            estimatedTime: '40 min'
        },
        {
            id: 'game',
            name: 'Educational Game',
            type: 'game',
            icon: Icons.Gaming,
            description: 'Interactive learning game with rules and scoring',
            requirements: 'Include game mechanics, rules, materials, and learning outcomes',
            difficulty: 'advanced',
            estimatedTime: '25 min'
        },
        {
            id: 'presentation',
            name: 'Interactive Presentation',
            type: 'presentation',
            icon: Icons.PowerPoint,
            description: 'Slide deck with speaker notes and engagement activities',
            requirements: 'Include visuals, discussion prompts, and interactive elements',
            difficulty: 'intermediate',
            estimatedTime: '30 min'
        }
    ];

    useEffect(() => {
        loadContentLibrary();
    }, []);

    const loadContentLibrary = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/crm/content-library');
            if (response.ok) {
                const data = await response.json();
                setContentLibrary(data.library || []);
            }
        } catch (error) {
            console.error('Failed to load content library:', error);
            // Mock data for fallback
            setContentLibrary([
                {
                    id: '1',
                    title: 'Photosynthesis Quiz',
                    type: 'quiz',
                    date: '2025-08-01',
                    gradeLevel: '7',
                    topic: 'Biology',
                    rating: 4.8,
                    usage: 45
                },
                {
                    id: '2',
                    title: 'World War II Lesson Plan',
                    type: 'lesson',
                    date: '2025-07-29',
                    gradeLevel: '10',
                    topic: 'History',
                    rating: 4.6,
                    usage: 32
                }
            ]);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const contentType = selectedTemplate?.name || customType;
        if (!contentType || !topic.trim()) return;
        
        setIsLoading(true);
        setError('');
        setGeneratedContent(null);

        try {
            const enhancedRequirements = `
Content Type: ${contentType}
Topic: ${topic}
Grade Level: ${gradeLevel}
Difficulty: ${difficulty}
Duration: ${duration} minutes
${standards ? `Standards: ${standards}` : ''}
${learningObjectives ? `Learning Objectives: ${learningObjectives}` : ''}

Template Requirements:
${selectedTemplate?.requirements || 'Create comprehensive educational content'}

Additional Instructions:
- Use engaging and age-appropriate language
- Include clear learning objectives
- Provide step-by-step instructions where applicable
- Add assessment or reflection questions
- Include materials list if needed
- Consider differentiation strategies
- Format using clear headings and bullet points
- Add estimated timing for activities
- Include extension activities for advanced learners
- Provide accommodations for struggling learners
`;

            const response = await aiProvider.generateEducationalContent(
                contentType,
                topic,
                gradeLevel,
                enhancedRequirements
            );
            
            // Parse and structure the response
            const newContent: GeneratedContent = {
                id: Date.now().toString(),
                title: `${contentType}: ${topic}`,
                type: selectedTemplate?.type || 'custom',
                content: response,
                metadata: {
                    gradeLevel: gradeLevel,
                    topic: topic,
                    difficulty: difficulty,
                    generatedAt: new Date().toISOString(),
                    wordCount: response.split(' ').length,
                    estimatedDuration: duration + ' minutes'
                },
                tags: [
                    contentType.toLowerCase(),
                    topic.toLowerCase(),
                    `grade-${gradeLevel}`,
                    difficulty
                ]
            };

            setGeneratedContent(newContent);

            // Save to library
            const libraryEntry: ContentLibrary = {
                id: newContent.id,
                title: newContent.title,
                type: newContent.type,
                date: new Date().toISOString().split('T')[0],
                gradeLevel: gradeLevel,
                topic: topic,
                rating: 0,
                usage: 0
            };

            setContentLibrary(prev => [libraryEntry, ...prev]);

            // Try to save to API
            try {
                await fetch('http://localhost:5000/api/crm/content-library', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: newContent,
                        libraryEntry: libraryEntry
                    })
                });
            } catch (apiError) {
                console.error('Failed to save to library:', apiError);
            }

        } catch (err) {
            console.error("Content generation error:", err);
            setError("Failed to generate content. Please check your AI connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const exportContent = (format: 'pdf' | 'docx' | 'txt') => {
        if (!generatedContent) return;
        
        const blob = new Blob([generatedContent.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${generatedContent.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format === 'docx' ? 'doc' : format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const rateContent = async (contentId: string, rating: number) => {
        setContentLibrary(prev => prev.map(item => 
            item.id === contentId ? { ...item, rating } : item
        ));
        
        try {
            await fetch(`http://localhost:5000/api/crm/content-library/${contentId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            });
        } catch (error) {
            console.error('Failed to rate content:', error);
        }
    };

    const filteredLibrary = contentLibrary.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.topic.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/40';
            case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
            case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/40';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
        }
    };

    return (
        <div className="content-gen-container">
            <div className="content-gen-header">
                <Icons.ContentGen size={48} className="text-cyan-400" />
                <h2 className="font-orbitron text-3xl font-bold text-white">AI Content Generator</h2>
                <p className="text-gray-400 max-w-2xl text-center">
                    Create comprehensive educational content with AI assistance. Generate lesson plans, quizzes, activities, and more.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{contentLibrary.length}</div>
                    <div className="text-gray-400 text-sm">Content Created</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {contentTemplates.length}
                    </div>
                    <div className="text-gray-400 text-sm">Templates Available</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {contentLibrary.reduce((sum, item) => sum + item.usage, 0)}
                    </div>
                    <div className="text-gray-400 text-sm">Total Usage</div>
                </GlassmorphicContainer>
                <GlassmorphicContainer className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        {contentLibrary.length > 0 ? 
                            (contentLibrary.reduce((sum, item) => sum + item.rating, 0) / contentLibrary.length).toFixed(1) : 
                            '0.0'
                        }
                    </div>
                    <div className="text-gray-400 text-sm">Avg Rating</div>
                </GlassmorphicContainer>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
                {[
                    { id: 'generator', name: 'Content Generator', icon: Icons.Wand2 },
                    { id: 'templates', name: 'Templates', icon: Icons.Layout },
                    { id: 'library', name: 'My Library', icon: Icons.BookOpen }
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

            {viewMode === 'generator' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Generation Form */}
                    <div className="lg:col-span-2">
                        <GlassmorphicContainer className="p-6">
                            <form onSubmit={handleGenerate} className="space-y-4">
                                {/* Template Selection */}
                                <div>
                                    <label className="block text-white mb-3">Content Template</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {contentTemplates.slice(0, 4).map(template => (
                                            <button
                                                key={template.id}
                                                type="button"
                                                onClick={() => setSelectedTemplate(template)}
                                                className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                                                    selectedTemplate?.id === template.id
                                                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                                                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center mb-2">
                                                    <template.icon size={16} className="mr-2" />
                                                    <span className="font-medium text-sm">{template.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{template.description}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(template.difficulty)}`}>
                                                        {template.difficulty}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Type Input */}
                                    <div className="mt-3">
                                        <label className="block text-white text-sm mb-2">Or Custom Content Type</label>
                                        <input
                                            type="text"
                                            value={customType}
                                            onChange={(e) => setCustomType(e.target.value)}
                                            placeholder="e.g., Science Lab Report"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Topic</label>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., Photosynthesis"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Grade Level</label>
                                        <select
                                            value={gradeLevel}
                                            onChange={(e) => setGradeLevel(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                        >
                                            {Array.from({length: 12}, (_, i) => i + 1).map(g => (
                                                <option key={g} value={g} className="bg-gray-800">{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Difficulty</label>
                                        <select
                                            value={difficulty}
                                            onChange={(e) => setDifficulty(e.target.value as any)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                        >
                                            <option value="beginner" className="bg-gray-800">Beginner</option>
                                            <option value="intermediate" className="bg-gray-800">Intermediate</option>
                                            <option value="advanced" className="bg-gray-800">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Additional Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                                            min="5"
                                            max="300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Standards (optional)</label>
                                        <input
                                            type="text"
                                            value={standards}
                                            onChange={(e) => setStandards(e.target.value)}
                                            placeholder="e.g., NGSS 5-LS1-1"
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                        />
                                    </div>
                                </div>

                                {/* Learning Objectives */}
                                <div>
                                    <label className="block text-white mb-2">Learning Objectives (optional)</label>
                                    <textarea
                                        value={learningObjectives}
                                        onChange={(e) => setLearningObjectives(e.target.value)}
                                        rows={3}
                                        placeholder="Students will be able to..."
                                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-vertical"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || (!selectedTemplate && !customType) || !topic}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Icons.Wand2 size={20} />
                                            <span>Generate Content</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </GlassmorphicContainer>
                    </div>

                    {/* Selected Template Info */}
                    <div>
                        <GlassmorphicContainer className="p-6">
                            {selectedTemplate ? (
                                <div>
                                    <div className="flex items-center mb-4">
                                        <selectedTemplate.icon size={24} className="text-blue-400 mr-3" />
                                        <h3 className="text-white font-semibold">{selectedTemplate.name}</h3>
                                    </div>
                                    <p className="text-gray-300 text-sm mb-4">{selectedTemplate.description}</p>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-400 text-sm">Type:</span>
                                            <span className="text-white text-sm ml-2">{selectedTemplate.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-sm">Difficulty:</span>
                                            <span className={`text-sm ml-2 px-2 py-1 rounded ${getDifficultyColor(selectedTemplate.difficulty)}`}>
                                                {selectedTemplate.difficulty}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 text-sm">Estimated Time:</span>
                                            <span className="text-white text-sm ml-2">{selectedTemplate.estimatedTime}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-white text-sm font-medium mb-2">Template Requirements:</h4>
                                        <p className="text-gray-400 text-xs">{selectedTemplate.requirements}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Icons.Layout size={48} className="mx-auto mb-3 opacity-50" />
                                    <p>Select a template to see details</p>
                                </div>
                            )}
                        </GlassmorphicContainer>
                    </div>
                </div>
            )}

            {viewMode === 'templates' && (
                <GlassmorphicContainer className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {contentTemplates.map(template => (
                            <div key={template.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
                                <div className="flex items-center mb-3">
                                    <template.icon size={20} className="text-blue-400 mr-2" />
                                    <h3 className="text-white font-medium text-sm">{template.name}</h3>
                                </div>
                                <p className="text-gray-400 text-xs mb-3">{template.description}</p>
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(template.difficulty)}`}>
                                        {template.difficulty}
                                    </span>
                                    <span className="text-xs text-gray-500">{template.estimatedTime}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setViewMode('generator');
                                    }}
                                    className="w-full py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm transition-all duration-200"
                                >
                                    Use Template
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassmorphicContainer>
            )}

            {viewMode === 'library' && (
                <div className="space-y-6">
                    {/* Search and Filter */}
                    <GlassmorphicContainer className="p-4">
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search content..."
                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                            >
                                <option value="all" className="bg-gray-800">All Types</option>
                                <option value="assessment" className="bg-gray-800">Assessments</option>
                                <option value="instruction" className="bg-gray-800">Lessons</option>
                                <option value="practice" className="bg-gray-800">Practice</option>
                                <option value="project" className="bg-gray-800">Projects</option>
                            </select>
                        </div>
                    </GlassmorphicContainer>

                    {/* Content Library */}
                    <GlassmorphicContainer className="p-6">
                        <div className="space-y-4">
                            {filteredLibrary.map(item => (
                                <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-white font-medium">{item.title}</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-400">Grade {item.gradeLevel}</span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-400">{item.date}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">{item.type}</span>
                                            <span className="text-xs text-gray-400">{item.topic}</span>
                                            <span className="text-xs text-gray-400">Used {item.usage} times</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {/* Rating */}
                                            <div className="flex space-x-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        onClick={() => rateContent(item.id, star)}
                                                        className={`text-sm ${star <= item.rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-400`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassmorphicContainer>
                </div>
            )}

            {/* Generated Content Display */}
            {(generatedContent || error || isLoading) && (
                <GlassmorphicContainer className="p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-orbitron text-xl font-bold text-white">Generated Content</h3>
                        {generatedContent && !isLoading && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => exportContent('txt')}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 text-sm"
                                >
                                    Export TXT
                                </button>
                                <button
                                    onClick={() => exportContent('docx')}
                                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 text-sm"
                                >
                                    Export DOC
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

                    {generatedContent && (
                        <div className="space-y-4">
                            {/* Metadata */}
                            <div className="p-4 bg-white/5 rounded-lg">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Type:</span>
                                        <span className="text-white ml-2">{generatedContent.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Grade:</span>
                                        <span className="text-white ml-2">{generatedContent.metadata.gradeLevel}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Words:</span>
                                        <span className="text-white ml-2">{generatedContent.metadata.wordCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Duration:</span>
                                        <span className="text-white ml-2">{generatedContent.metadata.estimatedDuration}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 bg-white/5 rounded-lg">
                                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                                    {generatedContent.content}
                                </pre>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {generatedContent.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassmorphicContainer>
            )}
        </div>
    );
};

export default ContentGenerator;
