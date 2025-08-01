
import React, { useState, useEffect, useCallback } from 'react';
import { aiProvider } from '../../../../../services/aiProvider';
import { Icons } from '../../../../icons';
import './VocabularyVoyage.css';

type GameState = 'idle' | 'loading' | 'playing' | 'finished';
interface Question {
    word: string;
    correctDefinition: string;
    options: string[];
}

const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const VocabularyVoyage: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const [gameState, setGameState] = useState<GameState>('idle');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startGame = useCallback(async () => {
        setGameState('loading');
        setError(null);
        setScore(0);
        setCurrentQuestionIndex(0);

        try {
            const prompt = `Generate 5 vocabulary words suitable for a high school student, along with their correct definitions. For each word, also provide 3 plausible but incorrect definitions. The incorrect definitions should be related to the word's subject or sound to make the quiz challenging.`;

            const schema = {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        word: { type: "string" },
                        correctDefinition: { type: "string" },
                        incorrectDefinitions: {
                            type: "array",
                            items: { type: "string" }
                        }
                    },
                    required: ["word", "correctDefinition", "incorrectDefinitions"]
                }
            };

            const data = await aiProvider.generateJSON(prompt, schema, {
                system: "You are an educational game designer creating vocabulary challenges for high school students."
            });
            const formattedQuestions = data.map((item: any) => ({
                word: item.word,
                correctDefinition: item.correctDefinition,
                options: shuffleArray([...item.incorrectDefinitions, item.correctDefinition])
            }));
            setQuestions(formattedQuestions);
            setGameState('playing');
        } catch (err) {
            console.error("Vocabulary game error:", err);
            setError("Could not load the game. Please check your Ollama connection and try again.");
            setGameState('idle');
        }
    }, []);

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return; // Prevent multiple clicks
        
        setSelectedAnswer(answer);
        const isCorrect = answer === questions[currentQuestionIndex].correctDefinition;
        
        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(i => i + 1);
                setSelectedAnswer(null);
                setFeedback(null);
            } else {
                setGameState('finished');
            }
        }, 1500);
    };

    const IdleView = () => (
        <div className="game-view idle-view">
            <h2 className="game-title">Vocabulary Voyage</h2>
            <p className="game-description">Test your word knowledge against our AI Quizmaster!</p>
            {error && <p className="game-error">{error}</p>}
            <button className="game-button start-button" onClick={startGame}>
                <Icons.PlayCircle size={20}/> Start Game
            </button>
            <button className="game-button back-button" onClick={onBack}>
                 <Icons.ChevronLeft size={20}/> Back to Menu
            </button>
        </div>
    );

    const LoadingView = () => (
        <div className="game-view loading-view">
            <div className="loader"></div>
            <p>Generating new questions...</p>
        </div>
    );
    
    const FinishedView = () => (
        <div className="game-view finished-view">
            <h2 className="game-title">Game Over!</h2>
            <p className="final-score">Your Score: {score} / {questions.length}</p>
            <button className="game-button start-button" onClick={startGame}>Play Again</button>
            <button className="game-button back-button" onClick={onBack}>Back to Menu</button>
        </div>
    );

    const PlayingView = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        return (
            <div className="game-view playing-view">
                 <div className="game-hud">
                    <button className="game-button back-button small" onClick={onBack}><Icons.ChevronLeft size={16}/></button>
                    <p className="score">Score: {score}</p>
                </div>
                <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress}%` }}></div></div>
                <div className="question-area">
                    <p className="question-number">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <h3 className="word-to-define">{currentQuestion.word}</h3>
                    <p className="instruction">Select the correct definition:</p>
                </div>
                <div className="options-grid">
                    {currentQuestion.options.map((option, i) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.correctDefinition;
                        let btnClass = 'option-button';
                        if (isSelected && feedback === 'correct') btnClass += ' correct';
                        if (isSelected && feedback === 'incorrect') btnClass += ' incorrect';
                        if (selectedAnswer && isCorrect) btnClass += ' correct';

                        return (
                            <button key={i} className={btnClass} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer}>
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="vocabulary-voyage-container">
            {gameState === 'idle' && <IdleView />}
            {gameState === 'loading' && <LoadingView />}
            {gameState === 'playing' && questions.length > 0 && <PlayingView />}
            {gameState === 'finished' && <FinishedView />}
        </div>
    );
};

export default VocabularyVoyage;
