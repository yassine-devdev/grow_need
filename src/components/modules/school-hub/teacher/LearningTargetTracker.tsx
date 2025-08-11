
import React, { useState, useRef, useEffect } from 'react';
import '../shared.css';
import './LearningTargetTracker.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface LearningTarget {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  standards: string[];
  criteria: string[];
  dateCreated: string;
  dateModified: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'knowledge' | 'skill' | 'disposition';
}

interface StudentProgress {
  studentId: string;
  targetId: string;
  status: 'not-started' | 'in-progress' | 'approaching' | 'meets' | 'exceeds';
  evidence: Evidence[];
  lastUpdated: string;
  notes: string;
  score: number; // 1-4 scale
}

interface Evidence {
  id: string;
  type: 'assessment' | 'observation' | 'work-sample' | 'self-reflection';
  title: string;
  description: string;
  date: string;
  score: number;
  attachments: string[];
}

interface ProgressReport {
  targetId: string;
  totalStudents: number;
  notStarted: number;
  inProgress: number;
  approaching: number;
  meets: number;
  exceeds: number;
  averageScore: number;
}

const LearningTargetTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'targets' | 'progress' | 'reports' | 'analytics'>('targets');
  const [targets, setTargets] = useState<LearningTarget[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'progress'>('name');
  const [isLoading, setIsLoading] = useState(false);
  const [newTarget, setNewTarget] = useState<Partial<LearningTarget>>({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    standards: [],
    criteria: [],
    priority: 'medium',
    category: 'knowledge',
    isActive: true,
  });
  const [newEvidence, setNewEvidence] = useState<Partial<Evidence>>({
    type: 'assessment',
    title: '',
    description: '',
    score: 3,
    attachments: [],
  });
  const [bulkStatus, setBulkStatus] = useState<StudentProgress['status']>('not-started');
  const [analytics, setAnalytics] = useState({
    totalTargets: 0,
    activeTargets: 0,
    completedTargets: 0,
    averageProgress: 0,
    subjectBreakdown: [] as Array<{subject: string; count: number; avgProgress: number}>,
    recentActivity: [] as Array<{date: string; student: string; target: string; action: string}>,
  });

  // Mock data loading
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setIsLoading(true);
    
    // Mock students
    const mockStudents: Student[] = [
      { id: '1', name: 'Emma Johnson', email: 'emma.j@school.edu', avatar: '/avatars/emma.jpg' },
      { id: '2', name: 'Liam Chen', email: 'liam.c@school.edu', avatar: '/avatars/liam.jpg' },
      { id: '3', name: 'Sophia Rodriguez', email: 'sophia.r@school.edu', avatar: '/avatars/sophia.jpg' },
      { id: '4', name: 'Jackson Williams', email: 'jackson.w@school.edu', avatar: '/avatars/jackson.jpg' },
      { id: '5', name: 'Ava Thompson', email: 'ava.t@school.edu', avatar: '/avatars/ava.jpg' },
      { id: '6', name: 'Noah Davis', email: 'noah.d@school.edu', avatar: '/avatars/noah.jpg' },
    ];

    // Mock learning targets
    const mockTargets: LearningTarget[] = [
      {
        id: '1',
        title: 'Solve Linear Equations',
        description: 'Students will solve one and two-step linear equations with rational coefficients',
        subject: 'Mathematics',
        gradeLevel: '8th Grade',
        standards: ['8.EE.C.7', '8.EE.C.8'],
        criteria: [
          'Identify the variable and constants in an equation',
          'Apply inverse operations to isolate the variable',
          'Check solutions by substitution',
          'Solve multi-step equations with distributive property'
        ],
        dateCreated: '2024-09-15',
        dateModified: '2024-10-20',
        isActive: true,
        priority: 'high',
        category: 'skill',
      },
      {
        id: '2',
        title: 'Analyze Character Development',
        description: 'Students will analyze how characters develop and change throughout a literary work',
        subject: 'English Language Arts',
        gradeLevel: '8th Grade',
        standards: ['RL.8.3', 'RL.8.1'],
        criteria: [
          'Identify character traits at the beginning of the story',
          'Track character changes throughout the plot',
          'Cite textual evidence to support analysis',
          'Explain how events influence character development'
        ],
        dateCreated: '2024-09-20',
        dateModified: '2024-10-18',
        isActive: true,
        priority: 'medium',
        category: 'knowledge',
      },
      {
        id: '3',
        title: 'Scientific Method Application',
        description: 'Students will design and conduct scientific investigations using the scientific method',
        subject: 'Science',
        gradeLevel: '8th Grade',
        standards: ['MS-ETS1-1', 'MS-ETS1-2'],
        criteria: [
          'Form testable hypotheses',
          'Design controlled experiments',
          'Collect and analyze data accurately',
          'Draw evidence-based conclusions'
        ],
        dateCreated: '2024-09-25',
        dateModified: '2024-10-15',
        isActive: true,
        priority: 'high',
        category: 'skill',
      },
      {
        id: '4',
        title: 'Colonial History Understanding',
        description: 'Students will demonstrate understanding of colonial American society and culture',
        subject: 'Social Studies',
        gradeLevel: '8th Grade',
        standards: ['NCSS.2', 'NCSS.3'],
        criteria: [
          'Describe daily life in colonial America',
          'Compare different colonial regions',
          'Analyze primary source documents',
          'Explain causes of colonial conflicts'
        ],
        dateCreated: '2024-09-30',
        dateModified: '2024-10-12',
        isActive: true,
        priority: 'medium',
        category: 'knowledge',
      },
    ];

    // Mock progress data
    const mockProgress: StudentProgress[] = [];
    mockStudents.forEach(student => {
      mockTargets.forEach(target => {
        const statuses: StudentProgress['status'][] = ['not-started', 'in-progress', 'approaching', 'meets', 'exceeds'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const scoreMap = { 'not-started': 0, 'in-progress': 1, 'approaching': 2, 'meets': 3, 'exceeds': 4 };
        
        mockProgress.push({
          studentId: student.id,
          targetId: target.id,
          status: randomStatus,
          score: scoreMap[randomStatus],
          evidence: [],
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: '',
        });
      });
    });

    // Mock analytics
    const mockAnalytics = {
      totalTargets: mockTargets.length,
      activeTargets: mockTargets.filter(t => t.isActive).length,
      completedTargets: Math.floor(mockTargets.length * 0.6),
      averageProgress: 2.8,
      subjectBreakdown: [
        { subject: 'Mathematics', count: 1, avgProgress: 3.2 },
        { subject: 'English Language Arts', count: 1, avgProgress: 2.8 },
        { subject: 'Science', count: 1, avgProgress: 2.5 },
        { subject: 'Social Studies', count: 1, avgProgress: 2.9 },
      ],
      recentActivity: [
        { date: '2024-10-27', student: 'Emma Johnson', target: 'Solve Linear Equations', action: 'Evidence added' },
        { date: '2024-10-27', student: 'Liam Chen', target: 'Character Development', action: 'Status updated' },
        { date: '2024-10-26', student: 'Sophia Rodriguez', target: 'Scientific Method', action: 'Progress noted' },
      ],
    };

    setTimeout(() => {
      setStudents(mockStudents);
      setTargets(mockTargets);
      setProgress(mockProgress);
      setAnalytics(mockAnalytics);
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateTarget = () => {
    if (!newTarget.title || !newTarget.description) return;

    const target: LearningTarget = {
      id: Date.now().toString(),
      title: newTarget.title!,
      description: newTarget.description!,
      subject: newTarget.subject!,
      gradeLevel: newTarget.gradeLevel!,
      standards: newTarget.standards!,
      criteria: newTarget.criteria!,
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      isActive: newTarget.isActive!,
      priority: newTarget.priority!,
      category: newTarget.category!,
    };

    setTargets(prev => [...prev, target]);
    setShowTargetModal(false);
    setNewTarget({
      title: '',
      description: '',
      subject: '',
      gradeLevel: '',
      standards: [],
      criteria: [],
      priority: 'medium',
      category: 'knowledge',
      isActive: true,
    });
  };

  const handleUpdateProgress = (studentId: string, targetId: string, status: StudentProgress['status'], notes?: string) => {
    const scoreMap = { 'not-started': 0, 'in-progress': 1, 'approaching': 2, 'meets': 3, 'exceeds': 4 };
    
    setProgress(prev => prev.map(p => 
      p.studentId === studentId && p.targetId === targetId 
        ? { ...p, status, score: scoreMap[status], lastUpdated: new Date().toISOString(), notes: notes || p.notes }
        : p
    ));
  };

  const handleAddEvidence = () => {
    if (!selectedStudent || !selectedTarget || !newEvidence.title) return;

    const evidence: Evidence = {
      id: Date.now().toString(),
      type: newEvidence.type!,
      title: newEvidence.title!,
      description: newEvidence.description!,
      date: new Date().toISOString(),
      score: newEvidence.score!,
      attachments: newEvidence.attachments!,
    };

    setProgress(prev => prev.map(p => 
      p.studentId === selectedStudent && p.targetId === selectedTarget
        ? { ...p, evidence: [...p.evidence, evidence], lastUpdated: new Date().toISOString() }
        : p
    ));

    setShowEvidenceModal(false);
    setNewEvidence({
      type: 'assessment',
      title: '',
      description: '',
      score: 3,
      attachments: [],
    });
  };

  const handleBulkUpdate = () => {
    if (!selectedTarget) return;

    const selectedStudents = students.filter(s => 
      document.querySelector(`input[data-student="${s.id}"]:checked`)
    );

    selectedStudents.forEach(student => {
      handleUpdateProgress(student.id, selectedTarget, bulkStatus);
    });

    setShowBulkUpdate(false);
  };

  const getStudentProgress = (studentId: string, targetId: string) => {
    return progress.find(p => p.studentId === studentId && p.targetId === targetId);
  };

  const getProgressColor = (status: StudentProgress['status']) => {
    const colors = {
      'not-started': 'bg-gray-600',
      'in-progress': 'bg-yellow-500',
      'approaching': 'bg-blue-500',
      'meets': 'bg-green-500',
      'exceeds': 'bg-purple-500',
    };
    return colors[status] || 'bg-gray-600';
  };

  const getProgressReport = (targetId: string): ProgressReport => {
    const targetProgress = progress.filter(p => p.targetId === targetId);
    const total = targetProgress.length;
    
    const statusCounts = targetProgress.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageScore = total > 0 
      ? targetProgress.reduce((sum, p) => sum + p.score, 0) / total 
      : 0;

    return {
      targetId,
      totalStudents: total,
      notStarted: statusCounts['not-started'] || 0,
      inProgress: statusCounts['in-progress'] || 0,
      approaching: statusCounts['approaching'] || 0,
      meets: statusCounts['meets'] || 0,
      exceeds: statusCounts['exceeds'] || 0,
      averageScore,
    };
  };

  const filteredTargets = targets.filter(target => {
    const matchesSearch = target.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || target.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const filteredStudents = students.filter(student => {
    if (!selectedTarget) return true;
    
    const studentProgress = getStudentProgress(student.id, selectedTarget);
    const matchesStatus = !filterStatus || studentProgress?.status === filterStatus;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="school-hub-content-pane">
        <div className="flex items-center justify-center h-64">
          <Icons.Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-white">Loading Learning Target Tracker...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="school-hub-content-pane">
      <GlassmorphicContainer className="learning-target-tracker">
        {/* Header */}
        <div className="tracker-header">
          <div className="header-content">
            <div className="header-icon">
              <Icons.Target size={48} className="text-cyan-400" />
            </div>
            <div className="header-text">
              <h1 className="font-orbitron text-4xl font-bold text-white">Learning Target Tracker</h1>
              <p className="text-gray-400">Track student progress toward learning objectives</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowTargetModal(true)}
            >
              <Icons.Plus size={18} />
              New Target
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => setShowBulkUpdate(true)}
              disabled={!selectedTarget}
            >
              <Icons.Edit size={18} />
              Bulk Update
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tracker-tabs">
          <button
            className={`tab ${activeTab === 'targets' ? 'active' : ''}`}
            onClick={() => setActiveTab('targets')}
          >
            <Icons.Target size={18} />
            Learning Targets
          </button>
          <button
            className={`tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <Icons.TrendingUp size={18} />
            Student Progress
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Icons.FileText size={18} />
            Progress Reports
          </button>
          <button
            className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Icons.BarChart size={18} />
            Analytics
          </button>
        </div>

        {/* Content Area */}
        <div className="tracker-content">
          {/* Learning Targets Tab */}
          {activeTab === 'targets' && (
            <div className="targets-view">
              <div className="view-header">
                <div className="search-filters">
                  <div className="search-box">
                    <Icons.Search size={18} />
                    <input
                      type="text"
                      placeholder="Search targets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language Arts">English Language Arts</option>
                    <option value="Science">Science</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>
                <div className="view-actions">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="date">Sort by Date</option>
                    <option value="progress">Sort by Progress</option>
                  </select>
                </div>
              </div>

              <div className="targets-grid">
                {filteredTargets.map(target => {
                  const report = getProgressReport(target.id);
                  const progressPercent = report.totalStudents > 0 
                    ? ((report.meets + report.exceeds) / report.totalStudents) * 100 
                    : 0;

                  return (
                    <div 
                      key={target.id} 
                      className={`target-card ${selectedTarget === target.id ? 'selected' : ''}`}
                      onClick={() => setSelectedTarget(target.id)}
                    >
                      <div className="card-header">
                        <div className="target-priority">
                          <span className={`priority-badge ${target.priority}`}>
                            {target.priority}
                          </span>
                          <span className={`category-badge ${target.category}`}>
                            {target.category}
                          </span>
                        </div>
                        <div className="target-actions">
                          <button className="action-icon">
                            <Icons.Edit size={16} />
                          </button>
                          <button className="action-icon">
                            <Icons.MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <h3 className="target-title">{target.title}</h3>
                        <p className="target-description">{target.description}</p>
                        
                        <div className="target-meta">
                          <span className="meta-item">
                            <Icons.BookOpen size={14} />
                            {target.subject}
                          </span>
                          <span className="meta-item">
                            <Icons.Users size={14} />
                            {target.gradeLevel}
                          </span>
                        </div>

                        <div className="target-standards">
                          <strong>Standards:</strong>
                          <div className="standards-list">
                            {target.standards.map(standard => (
                              <span key={standard} className="standard-tag">{standard}</span>
                            ))}
                          </div>
                        </div>

                        <div className="progress-summary">
                          <div className="progress-header">
                            <span>Class Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          <div className="progress-stats">
                            <span className="stat">
                              <span className="stat-dot exceeds"></span>
                              {report.exceeds} Exceeds
                            </span>
                            <span className="stat">
                              <span className="stat-dot meets"></span>
                              {report.meets} Meets
                            </span>
                            <span className="stat">
                              <span className="stat-dot approaching"></span>
                              {report.approaching} Approaching
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Progress Tab */}
          {activeTab === 'progress' && (
            <div className="progress-view">
              {!selectedTarget ? (
                <div className="select-target-prompt">
                  <Icons.Target size={64} className="text-gray-500" />
                  <h3>Select a Learning Target</h3>
                  <p>Choose a learning target from the targets tab to view student progress</p>
                  <button 
                    className="action-btn primary"
                    onClick={() => setActiveTab('targets')}
                  >
                    View Targets
                  </button>
                </div>
              ) : (
                <div className="progress-detail">
                  <div className="progress-header">
                    <div className="target-info">
                      <h3>{targets.find(t => t.id === selectedTarget)?.title}</h3>
                      <p>{targets.find(t => t.id === selectedTarget)?.description}</p>
                    </div>
                    <div className="progress-actions">
                      <div className="search-box">
                        <Icons.Search size={18} />
                        <input
                          type="text"
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="approaching">Approaching</option>
                        <option value="meets">Meets</option>
                        <option value="exceeds">Exceeds</option>
                      </select>
                    </div>
                  </div>

                  <div className="students-progress">
                    {filteredStudents.map(student => {
                      const studentProgress = getStudentProgress(student.id, selectedTarget);
                      if (!studentProgress) return null;

                      return (
                        <div key={student.id} className="student-progress-card">
                          <div className="student-info">
                            <div className="student-avatar">
                              {student.avatar ? (
                                <img src={student.avatar} alt={student.name} />
                              ) : (
                                <Icons.User size={24} />
                              )}
                            </div>
                            <div className="student-details">
                              <h4>{student.name}</h4>
                              <p>{student.email}</p>
                            </div>
                          </div>

                          <div className="progress-status">
                            <div className="status-controls">
                              <select
                                value={studentProgress.status}
                                onChange={(e) => handleUpdateProgress(
                                  student.id, 
                                  selectedTarget, 
                                  e.target.value as StudentProgress['status']
                                )}
                              >
                                <option value="not-started">Not Started</option>
                                <option value="in-progress">In Progress</option>
                                <option value="approaching">Approaching</option>
                                <option value="meets">Meets</option>
                                <option value="exceeds">Exceeds</option>
                              </select>
                              <span className={`status-indicator ${studentProgress.status}`}>
                                <span className={`status-dot ${getProgressColor(studentProgress.status)}`}></span>
                                {studentProgress.status.replace('-', ' ')}
                              </span>
                            </div>
                            <div className="progress-score">
                              Score: {studentProgress.score}/4
                            </div>
                          </div>

                          <div className="evidence-section">
                            <div className="evidence-header">
                              <span>Evidence ({studentProgress.evidence.length})</span>
                              <button
                                className="action-btn small"
                                onClick={() => {
                                  setSelectedStudent(student.id);
                                  setShowEvidenceModal(true);
                                }}
                              >
                                <Icons.Plus size={14} />
                                Add Evidence
                              </button>
                            </div>
                            {studentProgress.evidence.length > 0 && (
                              <div className="evidence-list">
                                {studentProgress.evidence.slice(0, 3).map(evidence => (
                                  <div key={evidence.id} className="evidence-item">
                                    <span className={`evidence-type ${evidence.type}`}>
                                      {evidence.type.replace('-', ' ')}
                                    </span>
                                    <span className="evidence-title">{evidence.title}</span>
                                    <span className="evidence-score">{evidence.score}/4</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="student-notes">
                            <textarea
                              placeholder="Add notes about student progress..."
                              value={studentProgress.notes}
                              onChange={(e) => handleUpdateProgress(
                                student.id,
                                selectedTarget,
                                studentProgress.status,
                                e.target.value
                              )}
                              rows={2}
                            />
                          </div>

                          <div className="last-updated">
                            Last updated: {new Date(studentProgress.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Reports Tab */}
          {activeTab === 'reports' && (
            <div className="reports-view">
              <div className="reports-header">
                <h3>Progress Reports</h3>
                <div className="report-actions">
                  <button className="action-btn secondary">
                    <Icons.Download size={18} />
                    Export Reports
                  </button>
                  <button className="action-btn primary">
                    <Icons.FileText size={18} />
                    Generate Report
                  </button>
                </div>
              </div>

              <div className="reports-grid">
                {targets.map(target => {
                  const report = getProgressReport(target.id);
                  const progressPercent = report.totalStudents > 0 
                    ? ((report.meets + report.exceeds) / report.totalStudents) * 100 
                    : 0;

                  return (
                    <div key={target.id} className="report-card">
                      <div className="report-header">
                        <h4>{target.title}</h4>
                        <span className="subject-tag">{target.subject}</span>
                      </div>

                      <div className="report-summary">
                        <div className="summary-stat">
                          <span className="stat-value">{report.totalStudents}</span>
                          <span className="stat-label">Total Students</span>
                        </div>
                        <div className="summary-stat">
                          <span className="stat-value">{Math.round(progressPercent)}%</span>
                          <span className="stat-label">Proficient</span>
                        </div>
                        <div className="summary-stat">
                          <span className="stat-value">{report.averageScore.toFixed(1)}/4</span>
                          <span className="stat-label">Average Score</span>
                        </div>
                      </div>

                      <div className="status-breakdown">
                        <div className="breakdown-item">
                          <span className="status-label">Exceeds Standards</span>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill exceeds" 
                              style={{ width: `${(report.exceeds / report.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{report.exceeds}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="status-label">Meets Standards</span>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill meets" 
                              style={{ width: `${(report.meets / report.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{report.meets}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="status-label">Approaching Standards</span>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill approaching" 
                              style={{ width: `${(report.approaching / report.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{report.approaching}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="status-label">In Progress</span>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill in-progress" 
                              style={{ width: `${(report.inProgress / report.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{report.inProgress}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="status-label">Not Started</span>
                          <div className="breakdown-bar">
                            <div 
                              className="bar-fill not-started" 
                              style={{ width: `${(report.notStarted / report.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="breakdown-count">{report.notStarted}</span>
                        </div>
                      </div>

                      <div className="report-actions">
                        <button className="action-btn small secondary">
                          <Icons.Eye size={14} />
                          View Details
                        </button>
                        <button className="action-btn small primary">
                          <Icons.Share size={14} />
                          Share Report
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-view">
              <div className="analytics-header">
                <h3>Learning Target Analytics</h3>
                <div className="date-range-selector">
                  <select>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>

              <div className="analytics-overview">
                <div className="overview-card">
                  <div className="card-icon">
                    <Icons.Target size={24} className="text-cyan-400" />
                  </div>
                  <div className="card-content">
                    <span className="card-value">{analytics.totalTargets}</span>
                    <span className="card-label">Total Targets</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <Icons.TrendingUp size={24} className="text-green-400" />
                  </div>
                  <div className="card-content">
                    <span className="card-value">{analytics.activeTargets}</span>
                    <span className="card-label">Active Targets</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <Icons.CheckCircle size={24} className="text-blue-400" />
                  </div>
                  <div className="card-content">
                    <span className="card-value">{analytics.completedTargets}</span>
                    <span className="card-label">Completed</span>
                  </div>
                </div>
                <div className="overview-card">
                  <div className="card-icon">
                    <Icons.BarChart size={24} className="text-purple-400" />
                  </div>
                  <div className="card-content">
                    <span className="card-value">{analytics.averageProgress.toFixed(1)}</span>
                    <span className="card-label">Avg Progress</span>
                  </div>
                </div>
              </div>

              <div className="analytics-charts">
                <div className="chart-container">
                  <h4>Progress by Subject</h4>
                  <div className="subject-breakdown">
                    {analytics.subjectBreakdown.map(subject => (
                      <div key={subject.subject} className="subject-item">
                        <div className="subject-header">
                          <span className="subject-name">{subject.subject}</span>
                          <span className="subject-count">{subject.count} targets</span>
                        </div>
                        <div className="subject-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${(subject.avgProgress / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="progress-value">{subject.avgProgress.toFixed(1)}/4</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-container">
                  <h4>Recent Activity</h4>
                  <div className="activity-feed">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <Icons.Activity size={16} />
                        </div>
                        <div className="activity-content">
                          <span className="activity-text">
                            <strong>{activity.student}</strong> - {activity.action} for <em>{activity.target}</em>
                          </span>
                          <span className="activity-date">{activity.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analytics-insights">
                <div className="insight-card">
                  <h4>Key Insights</h4>
                  <ul className="insights-list">
                    <li>Mathematics targets show highest completion rates (85%)</li>
                    <li>Science targets need additional support - consider remediation</li>
                    <li>3 students consistently exceed expectations across all subjects</li>
                    <li>Recent evidence submission rate has increased by 23%</li>
                  </ul>
                </div>
                <div className="insight-card">
                  <h4>Recommendations</h4>
                  <ul className="insights-list">
                    <li>Focus additional scaffolding on Science learning targets</li>
                    <li>Celebrate high-achieving students with enrichment activities</li>
                    <li>Consider peer tutoring for struggling students</li>
                    <li>Schedule parent conferences for students not meeting targets</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassmorphicContainer>

      {/* Create Target Modal */}
      {showTargetModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Create New Learning Target</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTargetModal(false)}
              >
                <Icons.X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Target Title</label>
                  <input
                    type="text"
                    value={newTarget.title}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Solve Linear Equations"
                  />
                </div>
                
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={newTarget.subject}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, subject: e.target.value }))}
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English Language Arts">English Language Arts</option>
                    <option value="Science">Science</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Grade Level</label>
                  <select
                    value={newTarget.gradeLevel}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  >
                    <option value="">Select Grade</option>
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
                  <label>Priority</label>
                  <select
                    value={newTarget.priority}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, priority: e.target.value as any }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newTarget.description}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what students will learn and be able to do..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newTarget.category}
                    onChange={(e) => setNewTarget(prev => ({ ...prev, category: e.target.value as any }))}
                  >
                    <option value="knowledge">Knowledge</option>
                    <option value="skill">Skill</option>
                    <option value="disposition">Disposition</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newTarget.isActive}
                      onChange={(e) => setNewTarget(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    Active Target
                  </label>
                </div>

                <div className="form-group full-width">
                  <label>Standards (comma-separated)</label>
                  <input
                    type="text"
                    value={newTarget.standards?.join(', ')}
                    onChange={(e) => setNewTarget(prev => ({ 
                      ...prev, 
                      standards: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    }))}
                    placeholder="e.g., 8.EE.C.7, 8.EE.C.8"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Success Criteria (one per line)</label>
                  <textarea
                    value={newTarget.criteria?.join('\n')}
                    onChange={(e) => setNewTarget(prev => ({ 
                      ...prev, 
                      criteria: e.target.value.split('\n').filter(c => c.trim()) 
                    }))}
                    placeholder="Enter success criteria, one per line..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="action-btn secondary"
                onClick={() => setShowTargetModal(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={handleCreateTarget}
                disabled={!newTarget.title || !newTarget.description}
              >
                Create Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Evidence Modal */}
      {showEvidenceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Evidence</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEvidenceModal(false)}
              >
                <Icons.X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Evidence Type</label>
                <select
                  value={newEvidence.type}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="assessment">Assessment</option>
                  <option value="observation">Observation</option>
                  <option value="work-sample">Work Sample</option>
                  <option value="self-reflection">Self Reflection</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newEvidence.title}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Quiz #3, Lab Observation"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newEvidence.description}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the evidence..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Score (1-4 scale)</label>
                <select
                  value={newEvidence.score}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                >
                  <option value={1}>1 - Below Standard</option>
                  <option value={2}>2 - Approaching Standard</option>
                  <option value={3}>3 - Meets Standard</option>
                  <option value={4}>4 - Exceeds Standard</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="action-btn secondary"
                onClick={() => setShowEvidenceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={handleAddEvidence}
                disabled={!newEvidence.title}
              >
                Add Evidence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkUpdate && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Bulk Update Progress</h3>
              <button 
                className="close-btn"
                onClick={() => setShowBulkUpdate(false)}
              >
                <Icons.X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Select students to update for: <strong>{targets.find(t => t.id === selectedTarget)?.title}</strong></p>
              
              <div className="student-selection">
                {students.map(student => (
                  <label key={student.id} className="student-checkbox">
                    <input
                      type="checkbox"
                      data-student={student.id}
                    />
                    {student.name}
                  </label>
                ))}
              </div>

              <div className="form-group">
                <label>New Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as any)}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="approaching">Approaching</option>
                  <option value="meets">Meets</option>
                  <option value="exceeds">Exceeds</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="action-btn secondary"
                onClick={() => setShowBulkUpdate(false)}
              >
                Cancel
              </button>
              <button 
                className="action-btn primary"
                onClick={handleBulkUpdate}
              >
                Update Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningTargetTracker;
