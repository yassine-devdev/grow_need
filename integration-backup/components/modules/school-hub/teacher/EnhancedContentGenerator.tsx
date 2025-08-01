import React, { useState } from 'react';
import { useEnhancedAI } from '../../../../hooks/useEnhancedAI';
import { Icons } from '../../../icons';
import '../shared.css';
import './ContentGenerator.css';
import './EnhancedContentGenerator.css';

interface LessonPlan {
  title: string;
  objectives: string[];
  materials: string[];
  activities: Array<{
    name: string;
    duration: string;
    description: string;
    type: 'individual' | 'group' | 'discussion' | 'hands-on';
  }>;
  assessment: {
    formative: string[];
    summative: string[];
  };
  differentiation: string[];
  homework?: string;
}

interface Quiz {
  title: string;
  instructions: string;
  questions: Array<{
    id: number;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  totalPoints: number;
  timeLimit?: string;
}

const EnhancedContentGenerator: React.FC = () => {
  const [contentType, setContentType] = useState<'lesson-plan' | 'quiz' | 'activity'>('lesson-plan');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  
  const [generatedContent, setGeneratedContent] = useState<LessonPlan | Quiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    isConnected,
    generateLessonPlan,
    generateQuiz,
    generateStreamingContent,
    streamingState
  } = useEnhancedAI({
    taskType: contentType === 'lesson-plan' ? 'lesson-plan' : 'quiz-generation',
    context: {
      studentLevel: gradeLevel,
      subject: subject,
      difficulty: difficulty as any
    }
  });

  const handleGenerate = async () => {
    if (!subject || !gradeLevel || !topic) {
      setError('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      if (contentType === 'lesson-plan') {
        const lessonPlan = await generateLessonPlan(subject, gradeLevel, topic, duration || '45 minutes');
        setGeneratedContent(lessonPlan);
      } else if (contentType === 'quiz') {
        const quiz = await generateQuiz(topic, difficulty, questionCount);
        setGeneratedContent(quiz);
      } else {
        // Activity generation using streaming
        const activityPrompt = `Create an engaging educational activity for ${gradeLevel} grade ${subject} on the topic "${topic}". Include materials needed, step-by-step instructions, learning objectives, and assessment criteria.`;
        
        await generateStreamingContent(activityPrompt, {
          taskType: 'lesson-plan',
          onComplete: (content) => {
            // Parse the streaming content into a structured format
            setGeneratedContent({
              title: `${topic} Activity`,
              objectives: [`Understand ${topic}`, 'Apply knowledge through hands-on learning'],
              materials: ['Basic classroom supplies'],
              activities: [{
                name: `${topic} Activity`,
                duration: duration || '30 minutes',
                description: content,
                type: 'hands-on'
              }],
              assessment: {
                formative: ['Observation during activity'],
                summative: ['Activity completion assessment']
              },
              differentiation: ['Provide additional support as needed']
            } as LessonPlan);
          }
        });
      }
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error('Content generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLessonPlan = (lessonPlan: LessonPlan) => (
    <div className="lesson-plan-display">
      <div className="content-header">
        <h3>{lessonPlan.title}</h3>
        <div className="content-meta">
          <span className="badge">{subject}</span>
          <span className="badge">{gradeLevel} Grade</span>
        </div>
      </div>

      <div className="lesson-section">
        <h4><Icons.Target size={18} /> Learning Objectives</h4>
        <ul>
          {lessonPlan.objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      <div className="lesson-section">
        <h4><Icons.Package size={18} /> Materials Needed</h4>
        <ul>
          {lessonPlan.materials.map((material, index) => (
            <li key={index}>{material}</li>
          ))}
        </ul>
      </div>

      <div className="lesson-section">
        <h4><Icons.Play size={18} /> Activities</h4>
        <div className="activities-grid">
          {lessonPlan.activities.map((activity, index) => (
            <div key={index} className={`activity-card ${activity.type}`}>
              <div className="activity-header">
                <h5>{activity.name}</h5>
                <span className="duration">{activity.duration}</span>
              </div>
              <p>{activity.description}</p>
              <span className="activity-type">{activity.type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lesson-section">
        <h4><Icons.CheckCircle size={18} /> Assessment</h4>
        <div className="assessment-grid">
          <div className="assessment-type">
            <h5>Formative Assessment</h5>
            <ul>
              {lessonPlan.assessment.formative.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="assessment-type">
            <h5>Summative Assessment</h5>
            <ul>
              {lessonPlan.assessment.summative.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="lesson-section">
        <h4><Icons.Users size={18} /> Differentiation</h4>
        <ul>
          {lessonPlan.differentiation.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      {lessonPlan.homework && (
        <div className="lesson-section">
          <h4><Icons.Home size={18} /> Homework</h4>
          <p>{lessonPlan.homework}</p>
        </div>
      )}
    </div>
  );

  const renderQuiz = (quiz: Quiz) => (
    <div className="quiz-display">
      <div className="content-header">
        <h3>{quiz.title}</h3>
        <div className="content-meta">
          <span className="badge">{quiz.totalPoints} Points</span>
          {quiz.timeLimit && <span className="badge">{quiz.timeLimit}</span>}
        </div>
      </div>

      <div className="quiz-instructions">
        <p>{quiz.instructions}</p>
      </div>

      <div className="questions-list">
        {quiz.questions.map((question, index) => (
          <div key={question.id} className={`question-card ${question.difficulty}`}>
            <div className="question-header">
              <span className="question-number">Question {index + 1}</span>
              <span className="question-points">{question.points} pts</span>
              <span className="question-difficulty">{question.difficulty}</span>
            </div>
            
            <div className="question-text">
              {question.question}
            </div>

            {question.options && (
              <div className="question-options">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className={`option ${option === question.correctAnswer ? 'correct' : ''}`}>
                    <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                    <span className="option-text">{option}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="question-explanation">
              <strong>Explanation:</strong> {question.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="enhanced-content-generator">
      <div className="generator-header">
        <h2><Icons.Wand size={24} /> Enhanced Content Generator</h2>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {isConnected ? 'AI Connected' : 'AI Disconnected'}
        </div>
      </div>

      <div className="generator-form">
        <div className="form-row">
          <div className="form-group">
            <label>Content Type</label>
            <select 
              value={contentType} 
              onChange={(e) => setContentType(e.target.value as any)}
            >
              <option value="lesson-plan">Lesson Plan</option>
              <option value="quiz">Interactive Quiz</option>
              <option value="activity">Learning Activity</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics, Science, English"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Grade Level</label>
            <select 
              value={gradeLevel} 
              onChange={(e) => setGradeLevel(e.target.value)}
            >
              <option value="">Select Grade</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="1st">1st Grade</option>
              <option value="2nd">2nd Grade</option>
              <option value="3rd">3rd Grade</option>
              <option value="4th">4th Grade</option>
              <option value="5th">5th Grade</option>
              <option value="6th">6th Grade</option>
              <option value="7th">7th Grade</option>
              <option value="8th">8th Grade</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Fractions, Solar System, Shakespeare"
            />
          </div>
        </div>

        {contentType === 'lesson-plan' && (
          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Select Duration</option>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="60 minutes">60 minutes</option>
                <option value="90 minutes">90 minutes</option>
              </select>
            </div>
          </div>
        )}

        {contentType === 'quiz' && (
          <div className="form-row">
            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                min="3"
                max="20"
              />
            </div>
            
            <div className="form-group">
              <label>Difficulty</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !isConnected || !subject || !gradeLevel || !topic}
          className="generate-button"
        >
          {isGenerating ? (
            <>
              <Icons.Loader size={20} className="spinning" />
              Generating...
            </>
          ) : (
            <>
              <Icons.Wand size={20} />
              Generate {contentType === 'lesson-plan' ? 'Lesson Plan' : contentType === 'quiz' ? 'Quiz' : 'Activity'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <Icons.AlertCircle size={20} />
          {error}
        </div>
      )}

      {streamingState.isStreaming && contentType === 'activity' && (
        <div className="streaming-content">
          <div className="streaming-header">
            <Icons.Loader size={20} className="spinning" />
            Generating activity...
          </div>
          <div className="streaming-text">
            {streamingState.currentText}
            <span className="cursor">▊</span>
          </div>
        </div>
      )}

      {generatedContent && !streamingState.isStreaming && (
        <div className="generated-content">
          {contentType === 'quiz' ? 
            renderQuiz(generatedContent as Quiz) : 
            renderLessonPlan(generatedContent as LessonPlan)
          }
        </div>
      )}
    </div>
  );
};

export default EnhancedContentGenerator;
