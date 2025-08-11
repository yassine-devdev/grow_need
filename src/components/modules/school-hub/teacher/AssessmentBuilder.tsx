
import React, { useState, useRef, useEffect } from 'react';
import '../shared.css';
import './AssessmentBuilder.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay' | 'matching' | 'fill-blank' | 'ordering';
  text: string;
  points: number;
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  rubric?: string;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  totalPoints: number;
  timeLimit: number; // in minutes
  questions: Question[];
  instructions: string;
  allowRetakes: boolean;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  availableFrom: string;
  availableUntil: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface QuestionBank {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  isShared: boolean;
}

interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'quiz' | 'test' | 'exam' | 'survey' | 'diagnostic';
  structure: {
    sections: Array<{
      name: string;
      questionTypes: string[];
      count: number;
      points: number;
    }>;
  };
}

const AssessmentBuilder: React.FC = () => {
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>({
    id: '',
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    totalPoints: 0,
    timeLimit: 60,
    questions: [],
    instructions: '',
    allowRetakes: false,
    shuffleQuestions: false,
    showCorrectAnswers: true,
    availableFrom: new Date().toISOString().slice(0, 16),
    availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    tags: [],
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [activeTab, setActiveTab] = useState<'builder' | 'bank' | 'templates' | 'preview' | 'analytics'>('builder');
  const [selectedQuestionType, setSelectedQuestionType] = useState<Question['type']>('multiple-choice');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [savedAssessments, setSavedAssessments] = useState<Assessment[]>([]);
  const [bulkImportMode, setBulkImportMode] = useState(false);
  const [collaborationMode, setCollaborationMode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const questionTextRef = useRef<HTMLTextAreaElement>(null);

  // Load demo data
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    const demoQuestionBanks: QuestionBank[] = [
      {
        id: 'bank1',
        title: 'Math Grade 8 - Algebra',
        subject: 'Mathematics',
        isShared: true,
        questions: [
          {
            id: 'q1',
            type: 'multiple-choice',
            text: 'Solve for x: 2x + 5 = 13',
            points: 5,
            options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
            correctAnswer: 'x = 4',
            explanation: '2x = 13 - 5 = 8, so x = 4',
            tags: ['algebra', 'equations'],
            difficulty: 'medium',
            estimatedTime: 3
          }
        ]
      },
      {
        id: 'bank2',
        title: 'Science - Biology Cells',
        subject: 'Science',
        isShared: false,
        questions: [
          {
            id: 'q2',
            type: 'true-false',
            text: 'All cells have a nucleus.',
            points: 3,
            correctAnswer: 'false',
            explanation: 'Prokaryotic cells do not have a nucleus.',
            tags: ['biology', 'cells'],
            difficulty: 'easy',
            estimatedTime: 2
          }
        ]
      }
    ];

    const demoTemplates: AssessmentTemplate[] = [
      {
        id: 'template1',
        name: 'Quick Quiz Template',
        description: '10 questions, mixed types, 20 minutes',
        type: 'quiz',
        structure: {
          sections: [
            { name: 'Multiple Choice', questionTypes: ['multiple-choice'], count: 7, points: 35 },
            { name: 'True/False', questionTypes: ['true-false'], count: 3, points: 15 }
          ]
        }
      },
      {
        id: 'template2',
        name: 'Comprehensive Test',
        description: 'Mixed question types for thorough assessment',
        type: 'test',
        structure: {
          sections: [
            { name: 'Multiple Choice', questionTypes: ['multiple-choice'], count: 15, points: 45 },
            { name: 'Short Answer', questionTypes: ['short-answer'], count: 5, points: 25 },
            { name: 'Essay', questionTypes: ['essay'], count: 2, points: 30 }
          ]
        }
      }
    ];

    const demoAssessments: Assessment[] = [
      {
        id: 'assessment1',
        title: 'Chapter 5 Math Quiz',
        description: 'Assessment on algebraic equations',
        subject: 'Mathematics',
        gradeLevel: '8th Grade',
        totalPoints: 50,
        timeLimit: 30,
        questions: demoQuestionBanks[0].questions,
        instructions: 'Answer all questions. Show your work for partial credit.',
        allowRetakes: true,
        shuffleQuestions: false,
        showCorrectAnswers: true,
        availableFrom: new Date().toISOString().slice(0, 16),
        availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        tags: ['math', 'algebra', 'chapter5'],
        status: 'published',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setQuestionBanks(demoQuestionBanks);
    setTemplates(demoTemplates);
    setSavedAssessments(demoAssessments);
  };

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setCurrentAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + question.points,
      updatedAt: new Date().toISOString()
    }));

    resetQuestionForm();
  };

  const editQuestion = (question: Question) => {
    setEditingQuestion(question);
    setSelectedQuestionType(question.type);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setCurrentAssessment(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q),
      totalPoints: prev.questions.reduce((sum, q) => 
        sum + (q.id === updatedQuestion.id ? updatedQuestion.points : q.points), 0),
      updatedAt: new Date().toISOString()
    }));
    setEditingQuestion(null);
    resetQuestionForm();
  };

  const deleteQuestion = (questionId: string) => {
    const question = currentAssessment.questions.find(q => q.id === questionId);
    if (question) {
      setCurrentAssessment(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
        totalPoints: prev.totalPoints - question.points,
        updatedAt: new Date().toISOString()
      }));
    }
  };

  const resetQuestionForm = () => {
    setEditingQuestion(null);
    if (questionTextRef.current) {
      questionTextRef.current.value = '';
    }
  };

  const generateWithAI = async (topic: string, count: number, difficulty: Question['difficulty']) => {
    setIsGeneratingWithAI(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const aiQuestions: Question[] = Array.from({ length: count }, (_, i) => ({
        id: `ai_q_${Date.now()}_${i}`,
        type: 'multiple-choice',
        text: `AI Generated question ${i + 1} about ${topic}`,
        points: 5,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `This is an AI generated explanation for ${topic}`,
        tags: [topic.toLowerCase(), 'ai-generated'],
        difficulty,
        estimatedTime: 3
      }));

      setCurrentAssessment(prev => ({
        ...prev,
        questions: [...prev.questions, ...aiQuestions],
        totalPoints: prev.totalPoints + (aiQuestions.length * 5),
        updatedAt: new Date().toISOString()
      }));

      setIsGeneratingWithAI(false);
    }, 2000);
  };

  const saveAssessment = () => {
    const assessmentToSave = {
      ...currentAssessment,
      id: currentAssessment.id || `assessment_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    setSavedAssessments(prev => {
      const existing = prev.findIndex(a => a.id === assessmentToSave.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = assessmentToSave;
        return updated;
      }
      return [...prev, assessmentToSave];
    });

    setCurrentAssessment(assessmentToSave);
  };

  const publishAssessment = () => {
    setCurrentAssessment(prev => ({
      ...prev,
      status: 'published',
      updatedAt: new Date().toISOString()
    }));
    saveAssessment();
  };

  const loadAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setActiveTab('builder');
  };

  const importFromBank = (questions: Question[]) => {
    setCurrentAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, ...questions],
      totalPoints: prev.totalPoints + questions.reduce((sum, q) => sum + q.points, 0),
      updatedAt: new Date().toISOString()
    }));
  };

  const applyTemplate = (template: AssessmentTemplate) => {
    const totalPoints = template.structure.sections.reduce((sum, section) => sum + section.points, 0);
    
    setCurrentAssessment(prev => ({
      ...prev,
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      totalPoints,
      timeLimit: template.type === 'quiz' ? 30 : template.type === 'test' ? 60 : 90,
      updatedAt: new Date().toISOString()
    }));
    
    setActiveTab('builder');
  };

  const exportAssessment = (format: 'json' | 'pdf' | 'docx') => {
    const dataStr = JSON.stringify(currentAssessment, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentAssessment.title || 'assessment'}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredBanks = questionBanks.filter(bank => 
    bank.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQuestions = currentAssessment.questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !filterDifficulty || question.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const questionTypeIcons = {
    'multiple-choice': Icons.CheckCircle,
    'true-false': Icons.ToggleLeft,
    'short-answer': Icons.Edit3,
    'essay': Icons.FileText,
    'matching': Icons.Link,
    'fill-blank': Icons.Type,
    'ordering': Icons.List
  };

  return (
    <div className="school-hub-content-pane">
      <div className="assessment-builder-header">
        <div className="title-section">
          <div className="text-cyan-400 mb-4">
            <Icons.ClipboardCheck size={48} />
          </div>
          <h2 className="font-orbitron text-3xl font-bold text-white mb-2">Assessment Builder</h2>
          <p className="text-gray-400">Create comprehensive formative and summative assessments</p>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
            disabled={currentAssessment.questions.length === 0}
          >
            <Icons.Eye size={20} />
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button onClick={saveAssessment} className="btn-primary">
            <Icons.Save size={20} />
            Save Draft
          </button>
          <button
            onClick={publishAssessment}
            className="btn-success"
            disabled={currentAssessment.questions.length === 0 || !currentAssessment.title}
          >
            <Icons.Send size={20} />
            Publish
          </button>
        </div>
      </div>

      <div className="assessment-builder-tabs">
        <button
          className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          <Icons.Wrench size={20} />
          Builder
        </button>
        <button
          className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveTab('bank')}
        >
          <Icons.Database size={20} />
          Question Bank
        </button>
        <button
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Icons.Layout size={20} />
          Templates
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Icons.BarChart3 size={20} />
          Analytics
        </button>
      </div>

      {activeTab === 'builder' && (
        <div className="builder-content">
          <div className="assessment-info-section">
            <GlassmorphicContainer className="assessment-details">
              <h3 className="section-title">
                <Icons.Info size={20} />
                Assessment Details
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="assessment-title">Title *</label>
                  <input
                    id="assessment-title"
                    type="text"
                    value={currentAssessment.title}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      title: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    placeholder="Enter assessment title"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assessment-subject">Subject</label>
                  <select
                    id="assessment-subject"
                    value={currentAssessment.subject}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      subject: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    className="form-select"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English Language Arts</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="PE">Physical Education</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assessment-grade">Grade Level</label>
                  <select
                    id="assessment-grade"
                    value={currentAssessment.gradeLevel}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      gradeLevel: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    className="form-select"
                  >
                    <option value="">Select Grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                    <option value="4th Grade">4th Grade</option>
                    <option value="5th Grade">5th Grade</option>
                    <option value="6th Grade">6th Grade</option>
                    <option value="7th Grade">7th Grade</option>
                    <option value="8th Grade">8th Grade</option>
                    <option value="9th Grade">9th Grade</option>
                    <option value="10th Grade">10th Grade</option>
                    <option value="11th Grade">11th Grade</option>
                    <option value="12th Grade">12th Grade</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assessment-time-limit">Time Limit (minutes)</label>
                  <input
                    id="assessment-time-limit"
                    type="number"
                    value={currentAssessment.timeLimit}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value) || 0,
                      updatedAt: new Date().toISOString()
                    }))}
                    min="1"
                    max="300"
                    className="form-input"
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="assessment-description">Description</label>
                  <textarea
                    id="assessment-description"
                    value={currentAssessment.description}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      description: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    placeholder="Brief description of this assessment"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group span-2">
                  <label htmlFor="assessment-instructions">Instructions</label>
                  <textarea
                    id="assessment-instructions"
                    value={currentAssessment.instructions}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      instructions: e.target.value,
                      updatedAt: new Date().toISOString()
                    }))}
                    placeholder="Instructions for students taking this assessment"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="settings-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentAssessment.allowRetakes}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      allowRetakes: e.target.checked,
                      updatedAt: new Date().toISOString()
                    }))}
                  />
                  Allow Retakes
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentAssessment.shuffleQuestions}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      shuffleQuestions: e.target.checked,
                      updatedAt: new Date().toISOString()
                    }))}
                  />
                  Shuffle Questions
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={currentAssessment.showCorrectAnswers}
                    onChange={(e) => setCurrentAssessment(prev => ({
                      ...prev,
                      showCorrectAnswers: e.target.checked,
                      updatedAt: new Date().toISOString()
                    }))}
                  />
                  Show Correct Answers
                </label>
              </div>
            </GlassmorphicContainer>
          </div>

          <div className="question-builder-section">
            <GlassmorphicContainer className="question-builder">
              <h3 className="section-title">
                <Icons.Plus size={20} />
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>

              <QuestionForm
                questionType={selectedQuestionType}
                setQuestionType={setSelectedQuestionType}
                editingQuestion={editingQuestion}
                onSave={editingQuestion ? updateQuestion : addQuestion}
                onCancel={resetQuestionForm}
                questionTextRef={questionTextRef}
              />
            </GlassmorphicContainer>

            <GlassmorphicContainer className="ai-generation">
              <h3 className="section-title">
                <Icons.Sparkles size={20} />
                AI Question Generation
              </h3>

              <AIGenerationForm
                onGenerate={generateWithAI}
                isGenerating={isGeneratingWithAI}
              />
            </GlassmorphicContainer>
          </div>

          <div className="questions-list-section">
            <GlassmorphicContainer className="questions-list">
              <div className="questions-header">
                <h3 className="section-title">
                  <Icons.List size={20} />
                  Questions ({currentAssessment.questions.length})
                  <span className="points-total">Total Points: {currentAssessment.totalPoints}</span>
                </h3>

                <div className="questions-controls">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="questions-grid">
                {filteredQuestions.map((question, index) => {
                  const QuestionIcon = questionTypeIcons[question.type];
                  return (
                    <div key={question.id} className="question-card">
                      <div className="question-header">
                        <div className="question-meta">
                          <QuestionIcon size={16} className="question-type-icon" />
                          <span className="question-number">#{index + 1}</span>
                          <span className={`difficulty-badge ${question.difficulty}`}>
                            {question.difficulty}
                          </span>
                          <span className="points-badge">{question.points} pts</span>
                        </div>
                        
                        <div className="question-actions">
                          <button
                            onClick={() => editQuestion(question)}
                            className="action-btn edit"
                          >
                            <Icons.Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="action-btn delete"
                          >
                            <Icons.Trash size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="question-content">
                        <p className="question-text">{question.text}</p>
                        
                        {question.options && (
                          <div className="question-options">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`option ${option === question.correctAnswer ? 'correct' : ''}`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {option}
                                {option === question.correctAnswer && (
                                  <Icons.Check size={14} className="correct-icon" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.tags.length > 0 && (
                          <div className="question-tags">
                            {question.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="tag">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredQuestions.length === 0 && (
                  <div className="empty-state">
                    <Icons.AlertCircle size={48} className="empty-icon" />
                    <p>No questions added yet</p>
                    <p className="empty-subtitle">Start by adding questions above</p>
                  </div>
                )}
              </div>
            </GlassmorphicContainer>
          </div>
        </div>
      )}

      {activeTab === 'bank' && (
        <QuestionBankTab
          questionBanks={filteredBanks}
          onImport={importFromBank}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      )}

      {activeTab === 'templates' && (
        <TemplatesTab
          templates={templates}
          onApply={applyTemplate}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsTab
          assessments={savedAssessments}
          currentAssessment={currentAssessment}
        />
      )}

      {showPreview && (
        <AssessmentPreview
          assessment={currentAssessment}
          onClose={() => setShowPreview(false)}
          onExport={exportAssessment}
        />
      )}
    </div>
  );
};

// Sub-components for better organization
const QuestionForm: React.FC<{
  questionType: Question['type'];
  setQuestionType: (type: Question['type']) => void;
  editingQuestion: Question | null;
  onSave: (question: Question | Omit<Question, 'id'>) => void;
  onCancel: () => void;
  questionTextRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ questionType, setQuestionType, editingQuestion, onSave, onCancel, questionTextRef }) => {
  const [questionText, setQuestionText] = useState(editingQuestion?.text || '');
  const [points, setPoints] = useState(editingQuestion?.points || 5);
  const [options, setOptions] = useState(editingQuestion?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(editingQuestion?.correctAnswer || '');
  const [explanation, setExplanation] = useState(editingQuestion?.explanation || '');
  const [tags, setTags] = useState(editingQuestion?.tags.join(', ') || '');
  const [difficulty, setDifficulty] = useState<Question['difficulty']>(editingQuestion?.difficulty || 'medium');
  const [estimatedTime, setEstimatedTime] = useState(editingQuestion?.estimatedTime || 3);

  const handleSave = () => {
    if (!questionText.trim()) return;

    const questionData = {
      type: questionType,
      text: questionText,
      points,
      explanation,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      difficulty,
      estimatedTime,
      ...(questionType === 'multiple-choice' && {
        options: options.filter(opt => opt.trim()),
        correctAnswer
      }),
      ...(questionType === 'true-false' && {
        correctAnswer
      })
    };

    if (editingQuestion) {
      onSave({ ...questionData, id: editingQuestion.id });
    } else {
      onSave(questionData);
    }

    // Reset form
    setQuestionText('');
    setPoints(5);
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setExplanation('');
    setTags('');
    setDifficulty('medium');
    setEstimatedTime(3);
  };

  return (
    <div className="question-form">
      <div className="question-type-selector">
        <label htmlFor="question-type">Question Type</label>
        <select
          id="question-type"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as Question['type'])}
          className="form-select"
        >
          <option value="multiple-choice">Multiple Choice</option>
          <option value="true-false">True/False</option>
          <option value="short-answer">Short Answer</option>
          <option value="essay">Essay</option>
          <option value="matching">Matching</option>
          <option value="fill-blank">Fill in the Blank</option>
          <option value="ordering">Ordering</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="question-text">Question Text *</label>
        <textarea
          id="question-text"
          ref={questionTextRef}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here"
          className="form-textarea"
          rows={3}
        />
      </div>

      {(questionType === 'multiple-choice') && (
        <div className="options-section">
          <label>Answer Options</label>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="form-input"
              />
              <label className="radio-label">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === option}
                  onChange={() => setCorrectAnswer(option)}
                />
                Correct
              </label>
            </div>
          ))}
        </div>
      )}

      {questionType === 'true-false' && (
        <div className="true-false-section">
          <label>Correct Answer</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="tfAnswer"
                checked={correctAnswer === 'true'}
                onChange={() => setCorrectAnswer('true')}
              />
              True
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="tfAnswer"
                checked={correctAnswer === 'false'}
                onChange={() => setCorrectAnswer('false')}
              />
              False
            </label>
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="question-points">Points</label>
          <input
            id="question-points"
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min="1"
            max="100"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="question-difficulty">Difficulty</label>
          <select
            id="question-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Question['difficulty'])}
            className="form-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="question-time">Time (minutes)</label>
          <input
            id="question-time"
            type="number"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
            min="1"
            max="60"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="question-explanation">Explanation (optional)</label>
        <textarea
          id="question-explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain the correct answer"
          className="form-textarea"
          rows={2}
        />
      </div>

      <div className="form-group">
        <label htmlFor="question-tags">Tags (comma-separated)</label>
        <input
          id="question-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="algebra, equations, chapter5"
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          disabled={!questionText.trim()}
        >
          <Icons.Plus size={16} />
          {editingQuestion ? 'Update Question' : 'Add Question'}
        </button>
        
        {editingQuestion && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const AIGenerationForm: React.FC<{
  onGenerate: (topic: string, count: number, difficulty: Question['difficulty']) => void;
  isGenerating: boolean;
}> = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Question['difficulty']>('medium');

  const handleGenerate = () => {
    if (topic.trim()) {
      onGenerate(topic, count, difficulty);
      setTopic('');
    }
  };

  return (
    <div className="ai-generation-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ai-topic">Topic</label>
          <input
            id="ai-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Algebra equations"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ai-count">Count</label>
          <input
            id="ai-count"
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ai-difficulty">Difficulty</label>
          <select
            id="ai-difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Question['difficulty'])}
            className="form-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!topic.trim() || isGenerating}
        className="btn-primary ai-generate-btn"
      >
        {isGenerating ? (
          <>
            <Icons.Loader2 className="animate-spin" size={16} />
            Generating...
          </>
        ) : (
          <>
            <Icons.Sparkles size={16} />
            Generate Questions
          </>
        )}
      </button>
    </div>
  );
};

const QuestionBankTab: React.FC<{
  questionBanks: QuestionBank[];
  onImport: (questions: Question[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}> = ({ questionBanks, onImport, searchTerm, setSearchTerm }) => {
  return (
    <div className="question-bank-tab">
      <div className="bank-header">
        <h3>Question Banks</h3>
        <input
          type="text"
          placeholder="Search banks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="banks-grid">
        {questionBanks.map(bank => (
          <GlassmorphicContainer key={bank.id} className="bank-card">
            <div className="bank-info">
              <h4>{bank.title}</h4>
              <p className="bank-subject">{bank.subject}</p>
              <p className="bank-count">{bank.questions.length} questions</p>
              <div className="bank-meta">
                {bank.isShared && <span className="shared-badge">Shared</span>}
              </div>
            </div>
            
            <button
              onClick={() => onImport(bank.questions)}
              className="btn-primary"
            >
              <Icons.Download size={16} />
              Import All
            </button>
          </GlassmorphicContainer>
        ))}
      </div>
    </div>
  );
};

const TemplatesTab: React.FC<{
  templates: AssessmentTemplate[];
  onApply: (template: AssessmentTemplate) => void;
}> = ({ templates, onApply }) => {
  return (
    <div className="templates-tab">
      <h3>Assessment Templates</h3>
      
      <div className="templates-grid">
        {templates.map(template => (
          <GlassmorphicContainer key={template.id} className="template-card">
            <div className="template-info">
              <h4>{template.name}</h4>
              <p className="template-description">{template.description}</p>
              <span className={`template-type ${template.type}`}>{template.type}</span>
              
              <div className="template-structure">
                {template.structure.sections.map((section, index) => (
                  <div key={index} className="section-info">
                    <span className="section-name">{section.name}</span>
                    <span className="section-details">{section.count} questions • {section.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => onApply(template)}
              className="btn-primary"
            >
              <Icons.Layout size={16} />
              Use Template
            </button>
          </GlassmorphicContainer>
        ))}
      </div>
    </div>
  );
};

const AnalyticsTab: React.FC<{
  assessments: Assessment[];
  currentAssessment: Assessment;
}> = ({ assessments, currentAssessment }) => {
  const totalAssessments = assessments.length;
  const publishedAssessments = assessments.filter(a => a.status === 'published').length;
  const draftAssessments = assessments.filter(a => a.status === 'draft').length;
  const avgQuestionsPerAssessment = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + a.questions.length, 0) / assessments.length)
    : 0;

  return (
    <div className="analytics-tab">
      <h3>Assessment Analytics</h3>
      
      <div className="analytics-grid">
        <GlassmorphicContainer className="stat-card">
          <div className="stat-icon">
            <Icons.FileText size={32} />
          </div>
          <div className="stat-info">
            <h4>{totalAssessments}</h4>
            <p>Total Assessments</p>
          </div>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="stat-card">
          <div className="stat-icon">
            <Icons.CheckCircle size={32} />
          </div>
          <div className="stat-info">
            <h4>{publishedAssessments}</h4>
            <p>Published</p>
          </div>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="stat-card">
          <div className="stat-icon">
            <Icons.Edit size={32} />
          </div>
          <div className="stat-info">
            <h4>{draftAssessments}</h4>
            <p>Drafts</p>
          </div>
        </GlassmorphicContainer>

        <GlassmorphicContainer className="stat-card">
          <div className="stat-icon">
            <Icons.AlertCircle size={32} />
          </div>
          <div className="stat-info">
            <h4>{avgQuestionsPerAssessment}</h4>
            <p>Avg Questions</p>
          </div>
        </GlassmorphicContainer>
      </div>

      <GlassmorphicContainer className="recent-assessments">
        <h4>Recent Assessments</h4>
        <div className="assessments-list">
          {assessments.slice(0, 5).map(assessment => (
            <div key={assessment.id} className="assessment-item">
              <div className="assessment-info">
                <h5>{assessment.title}</h5>
                <p>{assessment.subject} • {assessment.gradeLevel}</p>
                <p className="assessment-meta">
                  {assessment.questions.length} questions • {assessment.totalPoints} points
                </p>
              </div>
              <span className={`status-badge ${assessment.status}`}>
                {assessment.status}
              </span>
            </div>
          ))}
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

const AssessmentPreview: React.FC<{
  assessment: Assessment;
  onClose: () => void;
  onExport: (format: 'json' | 'pdf' | 'docx') => void;
}> = ({ assessment, onClose, onExport }) => {
  return (
    <div className="assessment-preview-overlay">
      <GlassmorphicContainer className="assessment-preview">
        <div className="preview-header">
          <h3>Assessment Preview</h3>
          <div className="preview-actions">
            <button onClick={() => onExport('json')} className="btn-secondary">
              <Icons.Download size={16} />
              Export JSON
            </button>
            <button onClick={() => onExport('pdf')} className="btn-secondary">
              <Icons.FileText size={16} />
              Export PDF
            </button>
            <button onClick={onClose} className="btn-secondary">
              <Icons.Close size={16} />
              Close
            </button>
          </div>
        </div>

        <div className="preview-content">
          <div className="assessment-header">
            <h1>{assessment.title}</h1>
            <p className="assessment-info">
              {assessment.subject} • {assessment.gradeLevel} • {assessment.timeLimit} minutes • {assessment.totalPoints} points
            </p>
            {assessment.instructions && (
              <div className="instructions">
                <h3>Instructions:</h3>
                <p>{assessment.instructions}</p>
              </div>
            )}
          </div>

          <div className="questions-preview">
            {assessment.questions.map((question, index) => (
              <div key={question.id} className="question-preview">
                <div className="question-header">
                  <span className="question-number">Question {index + 1}</span>
                  <span className="question-points">({question.points} points)</span>
                </div>
                
                <p className="question-text">{question.text}</p>
                
                {question.options && (
                  <div className="options-preview">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="option-preview">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'short-answer' && (
                  <div className="answer-space">
                    <p>Answer: ___________________________</p>
                  </div>
                )}

                {question.type === 'essay' && (
                  <div className="essay-space">
                    <p>Essay space provided below:</p>
                    <div className="essay-lines">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="essay-line">_________________________________</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </GlassmorphicContainer>
    </div>
  );
};

export default AssessmentBuilder;
