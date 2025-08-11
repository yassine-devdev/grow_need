
import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../shared.css';
import './CollaborationBoard.css';
import { Icons } from '../../../icons';
import GlassmorphicContainer from '../../../ui/GlassmorphicContainer';

interface CollaborationUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { x: number; y: number };
  lastSeen: Date;
  role: 'teacher' | 'student' | 'observer';
  isTyping?: boolean;
  isDrawing?: boolean;
}

interface DrawingStroke {
  id: string;
  path: string;
  color: string;
  width: number;
  userId: string;
  timestamp: Date;
  tool: 'pen' | 'highlighter' | 'eraser';
}

interface StickyNote {
  id: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  userId: string;
  timestamp: Date;
  fontSize: number;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'presentation';
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  userId: string;
  timestamp: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  participants: CollaborationUser[];
  isActive: boolean;
  startTime: Date;
  template?: string;
  settings: {
    allowDrawing: boolean;
    allowNotes: boolean;
    allowDocuments: boolean;
    allowVoice: boolean;
    allowVideo: boolean;
    autoSave: boolean;
  };
}

const CollaborationBoard: React.FC = () => {
  // State Management
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const [selectedTool, setSelectedTool] = useState<'pointer' | 'pen' | 'highlighter' | 'text' | 'note' | 'eraser' | 'shape'>('pointer');
  const [drawingStrokes, setDrawingStrokes] = useState<DrawingStroke[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(3);
  const [showUserPanel, setShowUserPanel] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });

  // Refs
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sample data
  const [collaborationTemplates] = useState([
    {
      id: 'brainstorm',
      name: 'Brainstorming Session',
      description: 'Collaborative idea generation with sticky notes and mind mapping',
      icon: 'Lightbulb',
      category: 'creative',
      elements: ['stickyNotes', 'mindMap', 'voting']
    },
    {
      id: 'lesson-planning',
      name: 'Lesson Plan Review',
      description: 'Collaborative lesson planning with document annotation',
      icon: 'BookOpen',
      category: 'planning',
      elements: ['documents', 'annotations', 'timeline']
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving Workshop',
      description: 'Step-by-step problem solving with visual tools',
      icon: 'PuzzleIcon',
      category: 'analysis',
      elements: ['flowchart', 'stickyNotes', 'drawings']
    },
    {
      id: 'peer-review',
      name: 'Peer Review Session',
      description: 'Collaborative document review and feedback',
      icon: 'Users',
      category: 'feedback',
      elements: ['documents', 'comments', 'ratings']
    },
    {
      id: 'project-planning',
      name: 'Project Planning Board',
      description: 'Visual project planning with timelines and tasks',
      icon: 'Calendar',
      category: 'planning',
      elements: ['kanban', 'timeline', 'assignments']
    },
    {
      id: 'research-synthesis',
      name: 'Research Synthesis',
      description: 'Organize and synthesize research findings collaboratively',
      icon: 'Search',
      category: 'research',
      elements: ['categories', 'connections', 'synthesis']
    }
  ]);

  // Initialize mock session data
  useEffect(() => {
    const initializeSession = async () => {
      const mockSession: CollaborationSession = {
        id: 'session-001',
        name: 'Grade 10 History - Civil War Discussion',
        description: 'Collaborative analysis of Civil War causes and effects',
        createdBy: 'teacher-001',
        participants: [
          {
            id: 'teacher-001',
            name: 'Ms. Johnson',
            avatar: 'MJ',
            color: '#3b82f6',
            role: 'teacher',
            lastSeen: new Date(),
            cursor: { x: 200, y: 150 }
          },
          {
            id: 'student-001',
            name: 'Alex Smith',
            avatar: 'AS',
            color: '#ef4444',
            role: 'student',
            lastSeen: new Date(),
            isTyping: true
          },
          {
            id: 'student-002',
            name: 'Maria Garcia',
            avatar: 'MG',
            color: '#22c55e',
            role: 'student',
            lastSeen: new Date(),
            isDrawing: true
          },
          {
            id: 'student-003',
            name: 'David Chen',
            avatar: 'DC',
            color: '#f59e0b',
            role: 'student',
            lastSeen: new Date()
          }
        ],
        isActive: true,
        startTime: new Date(),
        template: 'brainstorm',
        settings: {
          allowDrawing: true,
          allowNotes: true,
          allowDocuments: true,
          allowVoice: true,
          allowVideo: false,
          autoSave: true
        }
      };

      setCurrentSession(mockSession);
      setActiveUsers(mockSession.participants);

      // Initialize with sample content
      setStickyNotes([
        {
          id: 'note-001',
          content: 'Economic factors leading to conflict',
          position: { x: 100, y: 150 },
          size: { width: 200, height: 120 },
          color: '#fef3c7',
          userId: 'teacher-001',
          timestamp: new Date(),
          fontSize: 14
        },
        {
          id: 'note-002',
          content: 'Slavery and moral disagreements',
          position: { x: 350, y: 200 },
          size: { width: 180, height: 100 },
          color: '#fecaca',
          userId: 'student-001',
          timestamp: new Date(),
          fontSize: 14
        },
        {
          id: 'note-003',
          content: 'States rights vs federal authority',
          position: { x: 150, y: 350 },
          size: { width: 220, height: 110 },
          color: '#d1fae5',
          userId: 'student-002',
          timestamp: new Date(),
          fontSize: 14
        }
      ]);

      // Initialize sample chat messages
      setChatMessages([
        {
          id: 'msg-001',
          userId: 'teacher-001',
          userName: 'Ms. Johnson',
          content: 'Let\'s explore the main causes of the Civil War. Please add your thoughts to the board.',
          timestamp: new Date(Date.now() - 300000),
          type: 'text'
        },
        {
          id: 'msg-002',
          userId: 'student-001',
          userName: 'Alex Smith',
          content: 'I think economic differences were a major factor',
          timestamp: new Date(Date.now() - 240000),
          type: 'text'
        },
        {
          id: 'msg-003',
          userId: 'student-002',
          userName: 'Maria Garcia',
          content: 'Should we also consider the moral aspects of slavery?',
          timestamp: new Date(Date.now() - 120000),
          type: 'text'
        }
      ]);
    };

    initializeSession();
  }, []);

  // Tool selection handlers
  const handleToolSelect = (tool: typeof selectedTool) => {
    setSelectedTool(tool);
  };

  // Drawing functionality
  const startDrawing = useCallback((event: React.MouseEvent) => {
    if (selectedTool !== 'pen' && selectedTool !== 'highlighter') return;
    
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setCurrentStroke(`M ${x} ${y}`);
    }
  }, [selectedTool]);

  const continueDrawing = useCallback((event: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setCurrentStroke(prev => `${prev} L ${x} ${y}`);
    }
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentStroke) {
      const newStroke: DrawingStroke = {
        id: `stroke-${Date.now()}`,
        path: currentStroke,
        color: selectedColor,
        width: brushSize,
        userId: 'teacher-001',
        timestamp: new Date(),
        tool: selectedTool as 'pen' | 'highlighter'
      };
      
      setDrawingStrokes(prev => [...prev, newStroke]);
      setCurrentStroke('');
    }
    setIsDrawing(false);
  }, [isDrawing, currentStroke, selectedColor, brushSize, selectedTool]);

  // Sticky note handlers
  const addStickyNote = useCallback((position: { x: number; y: number }) => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}`,
      content: 'New note...',
      position,
      size: { width: 180, height: 120 },
      color: '#fef3c7',
      userId: 'teacher-001',
      timestamp: new Date(),
      fontSize: 14
    };
    setStickyNotes(prev => [...prev, newNote]);
  }, []);

  // Clear board functionality
  const clearBoard = () => {
    setDrawingStrokes([]);
    setStickyNotes([]);
    setDocuments([]);
  };

  // Save session
  const saveSession = async () => {
    try {
      const sessionData = {
        session: currentSession,
        strokes: drawingStrokes,
        notes: stickyNotes,
        documents,
        timestamp: new Date()
      };
      
      // In a real app, this would save to a backend
      console.log('Saving session:', sessionData);
      
      // Add to history
      setSessionHistory(prev => [...prev, sessionData]);
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // Export functionality
  const exportBoard = (format: 'png' | 'pdf' | 'json') => {
    // Implementation would depend on format
    console.log(`Exporting board as ${format}`);
  };

  return (
    <div className="collab-container" ref={containerRef}>
      {/* Header with session info */}
      <div className="collab-header">
        <div className="session-info">
          <h2 className="session-title">{currentSession?.name}</h2>
          <p className="session-description">{currentSession?.description}</p>
        </div>
        
        <div className="session-controls">
          <button 
            className="control-btn"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            <Icons.Layout size={18} />
            Templates
          </button>
          
          <button 
            className="control-btn"
            onClick={() => setShowDocuments(!showDocuments)}
          >
            <Icons.FileText size={18} />
            Documents
          </button>
          
          <button 
            className="control-btn"
            onClick={saveSession}
          >
            <Icons.Save size={18} />
            Save
          </button>
          
          <div className="export-menu">
            <button className="control-btn">
              <Icons.Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main collaboration area */}
      <div className="collab-workspace">
        {/* Toolbar */}
        <div className="collab-toolbar">
          <div className="tool-group">
            <button 
              className={`tool-btn ${selectedTool === 'pointer' ? 'active' : ''}`}
              onClick={() => handleToolSelect('pointer')}
              title="Select"
            >
              <Icons.MousePointer size={20}/>
            </button>
            <button 
              className={`tool-btn ${selectedTool === 'pen' ? 'active' : ''}`}
              onClick={() => handleToolSelect('pen')}
              title="Pen"
            >
              <Icons.Pen size={20}/>
            </button>
            <button 
              className={`tool-btn ${selectedTool === 'highlighter' ? 'active' : ''}`}
              onClick={() => handleToolSelect('highlighter')}
              title="Highlighter"
            >
              <Icons.Highlighter size={20}/>
            </button>
            <button 
              className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
              onClick={() => handleToolSelect('text')}
              title="Text"
            >
              <Icons.Type size={20}/>
            </button>
            <button 
              className={`tool-btn ${selectedTool === 'note' ? 'active' : ''}`}
              onClick={() => handleToolSelect('note')}
              title="Sticky Note"
            >
              <Icons.StickyNote size={20}/>
            </button>
            <button 
              className={`tool-btn ${selectedTool === 'shape' ? 'active' : ''}`}
              onClick={() => handleToolSelect('shape')}
              title="Shapes"
            >
              <Icons.Square size={20}/>
            </button>
          </div>

          <div className="tool-group">
            <div className="color-picker">
              {['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                <button
                  key={color}
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            
            <div className="brush-size">
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="brush-slider"
              />
            </div>
          </div>

          <div className="tool-group">
            <button className="tool-btn" onClick={clearBoard} title="Clear All">
              <Icons.Trash size={20}/>
            </button>
            <button className="tool-btn" title="Undo">
              <Icons.Undo size={20}/>
            </button>
            <button className="tool-btn" title="Redo">
              <Icons.Redo size={20}/>
            </button>
          </div>

          <div className="tool-group">
            <button 
              className={`tool-btn ${isVoiceEnabled ? 'active' : ''}`}
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              title="Voice Chat"
            >
              <Icons.Mic size={20}/>
            </button>
            <button 
              className={`tool-btn ${isVideoEnabled ? 'active' : ''}`}
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              title="Video Chat"
            >
              <Icons.Video size={20}/>
            </button>
          </div>

          {/* Active users display */}
          <div className="collab-avatars">
            {activeUsers.slice(0, 5).map(user => (
              <div 
                key={user.id} 
                className={`avatar ${user.isTyping ? 'typing' : ''} ${user.isDrawing ? 'drawing' : ''}`}
                style={{ backgroundColor: user.color }}
                title={`${user.name} (${user.role})`}
              >
                {user.avatar}
                {user.isTyping && <div className="typing-indicator">...</div>}
                {user.isDrawing && <Icons.Pen size={12} className="drawing-indicator" />}
              </div>
            ))}
            {activeUsers.length > 5 && (
              <span className="avatar overflow">+{activeUsers.length - 5}</span>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="collab-canvas">
          {/* SVG for drawings */}
          <svg 
            ref={canvasRef}
            className="drawing-canvas"
            width="100%"
            height="100%"
            onMouseDown={startDrawing}
            onMouseMove={continueDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          >
            {/* Render all drawing strokes */}
            {drawingStrokes.map(stroke => (
              <path
                key={stroke.id}
                d={stroke.path}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={stroke.tool === 'highlighter' ? 0.6 : 1}
              />
            ))}
            
            {/* Current stroke being drawn */}
            {currentStroke && (
              <path
                d={currentStroke}
                stroke={selectedColor}
                strokeWidth={brushSize}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={selectedTool === 'highlighter' ? 0.6 : 1}
              />
            )}
          </svg>

          {/* Sticky Notes */}
          {stickyNotes.map(note => (
            <div
              key={note.id}
              className="sticky-note"
              style={{
                left: note.position.x,
                top: note.position.y,
                width: note.size.width,
                height: note.size.height,
                backgroundColor: note.color,
                fontSize: note.fontSize
              }}
            >
              <div className="note-header">
                <span className="note-author">{activeUsers.find(u => u.id === note.userId)?.name}</span>
                <button className="note-delete">
                  <Icons.X size={14} />
                </button>
              </div>
              <div className="note-content" contentEditable>
                {note.content}
              </div>
            </div>
          ))}

          {/* User cursors */}
          {activeUsers.filter(user => user.cursor).map(user => (
            <div
              key={`cursor-${user.id}`}
              className="user-cursor"
              style={{
                left: user.cursor!.x,
                top: user.cursor!.y,
                color: user.color
              }}
            >
              <Icons.MousePointer size={20} />
              <span className="cursor-label">{user.name}</span>
            </div>
          ))}
        </div>

        {/* Side panels */}
        {showUserPanel && (
          <div className="user-panel">
            <GlassmorphicContainer className="panel-container">
              <h3 className="panel-title">Active Users ({activeUsers.length})</h3>
              <div className="user-list">
                {activeUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div 
                      className="user-avatar" 
                      style={{ backgroundColor: user.color }}
                    >
                      {user.avatar}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name}</div>
                      <div className="user-role">{user.role}</div>
                      <div className="user-status">
                        {user.isTyping && <span className="status-indicator typing">Typing...</span>}
                        {user.isDrawing && <span className="status-indicator drawing">Drawing...</span>}
                      </div>
                    </div>
                    <div className="user-actions">
                      <button className="action-btn" title="Message">
                        <Icons.MessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}

        {/* Templates panel */}
        {showTemplates && (
          <div className="templates-panel">
            <GlassmorphicContainer className="panel-container">
              <h3 className="panel-title">Collaboration Templates</h3>
              <div className="templates-grid">
                {collaborationTemplates.map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-icon">
                      <Icons.Layout size={24} />
                    </div>
                    <div className="template-info">
                      <h4 className="template-name">{template.name}</h4>
                      <p className="template-description">{template.description}</p>
                      <div className="template-category">{template.category}</div>
                    </div>
                    <button className="use-template-btn">Use Template</button>
                  </div>
                ))}
              </div>
            </GlassmorphicContainer>
          </div>
        )}
      </div>

      {/* Chat panel (minimized by default) */}
      <div className="chat-panel minimized">
        <div className="chat-header" onClick={() => {}}>
          <Icons.MessageSquare size={18} />
          <span>Chat ({chatMessages.length})</span>
        </div>
        <div className="chat-messages">
          {chatMessages.map(message => (
            <div key={message.id} className="chat-message">
              <span className="message-author">{message.userName}:</span>
              <span className="message-content">{message.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollaborationBoard;
