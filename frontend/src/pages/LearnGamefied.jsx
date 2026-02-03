import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Volume2, Mic, MicOff, Check, X, ArrowLeft, Heart,
    Zap, Trophy, Flame, Star, Award, Target, ChevronRight
} from 'lucide-react';
import './LearnGamefied.css';

const LearnGamefied = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    // Lesson & Exercise State
    const [lesson, setLesson] = useState(null);
    const [exercises, setExercises] = useState([]);
    const [currentExercise, setCurrentExercise] = useState(0);
    const [loading, setLoading] = useState(true);
    
    // Game State
    const [lives, setLives] = useState(5);
    const [xp, setXp] = useState(0);
    const [combo, setCombo] = useState(0);
    const [completed, setCompleted] = useState(false);
    
    // Exercise State
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [canContinue, setCanContinue] = useState(false);
    
    // Audio & Speech
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userSpeech, setUserSpeech] = useState('');
    
    // Zebra Mascot State
    const [zebraState, setZebraState] = useState('idle'); // idle, happy, encouraging, celebrate, sad
    const [zebraMessage, setZebraMessage] = useState('');
    const [showZebra, setShowZebra] = useState(true);
    
    // Match Exercise State (for drag-drop)
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserSpeech(transcript);
                handleSpeechResult(transcript);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [currentExercise]);

    // Fetch Lesson and Exercises
    useEffect(() => {
        if (!state || !state.lessonId) {
            navigate('/lessons');
            return;
        }

        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/learn/lesson/${state.lessonId}`, {
                    headers: { 'x-auth-token': token }
                });
                
                setLesson(res.data);
                setExercises(res.data.exercises || []);
                setLoading(false);
                
                // Zebra greeting
                setZebraState('happy');
                setZebraMessage(`Hi! I'm Zara the Zebra! Let's learn together! 🦓`);
                setTimeout(() => {
                    setZebraState('idle');
                    setZebraMessage('');
                }, 3000);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLesson();
    }, [state, navigate]);

    // Text-to-Speech
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.9;
            
            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => setIsPlaying(false);
            
            window.speechSynthesis.speak(utterance);
        }
    };

    // Start Speech Recognition
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setUserSpeech('');
            setIsListening(true);
            recognitionRef.current.start();
            
            setZebraState('encouraging');
            setZebraMessage("I'm listening! Speak clearly! 🎤");
        }
    };

    // Handle Speech Result
    const handleSpeechResult = (transcript) => {
        const exercise = exercises[currentExercise];
        const expected = exercise.correctAnswer.toLowerCase();
        const spoken = transcript.toLowerCase().trim();
        
        const isCorrect = spoken.includes(expected) || expected.includes(spoken);
        handleAnswer(exercise.correctAnswer, isCorrect);
    };

    // Handle Answer Selection
    const handleAnswer = (answer, forceCorrect = null) => {
        if (canContinue) return;
        
        const exercise = exercises[currentExercise];
        const correct = forceCorrect !== null ? forceCorrect : (answer === exercise.correctAnswer);
        
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        setShowFeedback(true);
        setCanContinue(true);
        
        if (correct) {
            // Correct Answer
            const xpGained = 10 + (combo * 2);
            setXp(prev => prev + xpGained);
            setCombo(prev => prev + 1);
            
            // Zebra celebrates
            setZebraState('celebrate');
            const messages = [
                "Perfect! You're amazing! 🌟",
                "Excellent work! 🎉",
                "That's right! Keep it up! 💪",
                "Wonderful! You're a star! ⭐",
                "Fantastic! Great job! 🎊"
            ];
            setZebraMessage(messages[Math.floor(Math.random() * messages.length)]);
            
            // Play success sound (if available)
            playSound('success');
        } else {
            // Wrong Answer
            setLives(prev => Math.max(0, prev - 1));
            setCombo(0);
            
            // Zebra encourages
            setZebraState('encouraging');
            const messages = [
                "Don't worry! Try again! 💪",
                "Keep going! You can do it! 🌟",
                "That's okay! Let's learn from this! 📚",
                "Nice try! You're improving! 🎯",
                "Stay positive! You've got this! ❤️"
            ];
            setZebraMessage(messages[Math.floor(Math.random() * messages.length)]);
            
            // Play error sound
            playSound('error');
        }
    };

    // Play Sound Effects
    const playSound = (type) => {
        // You can add actual sound files here
        // For now, using Web Audio API for simple beeps
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'success') {
            oscillator.frequency.value = 523.25; // C5
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        } else {
            oscillator.frequency.value = 196.00; // G3
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    };

    // Continue to Next Exercise
    const handleContinue = () => {
        if (currentExercise < exercises.length - 1) {
            setCurrentExercise(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setShowFeedback(false);
            setCanContinue(false);
            setUserSpeech('');
            setMatchedPairs([]);
            setSelectedMatch(null);
            
            setZebraState('idle');
            setZebraMessage('');
        } else {
            completeLesson();
        }
    };

    // Complete Lesson
    const completeLesson = async () => {
        const score = Math.round((xp / (exercises.length * 10)) * 100);
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.post('http://localhost:5000/api/learn/progress', {
                lessonId: lesson._id,
                score,
                mistakes: [],
                exercises: exercises.length
            }, {
                headers: { 'x-auth-token': token }
            });
            
            setCompleted(true);
            setZebraState('celebrate');
            setZebraMessage(`🎉 Lesson Complete! You earned ${xp} XP! Amazing work! 🦓`);
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Match Exercise
    const handleMatchSelect = (item, type) => {
        if (matchedPairs.find(p => p.english === item || p.hindi === item)) {
            return; // Already matched
        }
        
        if (!selectedMatch) {
            setSelectedMatch({ item, type });
        } else {
            if (selectedMatch.type !== type) {
                // Check if match is correct
                const exercise = exercises[currentExercise];
                const pair = exercise.pairs.find(p => 
                    (p.english === item && p.hindi === selectedMatch.item) ||
                    (p.hindi === item && p.english === selectedMatch.item)
                );
                
                if (pair) {
                    setMatchedPairs([...matchedPairs, pair]);
                    if (matchedPairs.length + 1 === exercise.pairs.length) {
                        handleAnswer(exercise.pairs, true);
                    }
                } else {
                    playSound('error');
                }
                setSelectedMatch(null);
            } else {
                setSelectedMatch({ item, type });
            }
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="learn-gamified-container">
                <div className="loading-state">
                    <div className="zebra-loader">🦓</div>
                    <p>Loading your lesson...</p>
                </div>
            </div>
        );
    }

    if (!lesson || exercises.length === 0) {
        return (
            <div className="learn-gamified-container">
                <div className="error-state">
                    <p>Lesson not found</p>
                    <button onClick={() => navigate('/lessons')} className="btn-primary">
                        Back to Lessons
                    </button>
                </div>
            </div>
        );
    }

    // Completion Screen
    if (completed) {
        return (
            <div className="learn-gamified-container completion-screen">
                <div className="zebra-celebrate">
                    <img src="/logo.png" alt="Zara celebrates" className="zebra-large celebrate-animation" />
                </div>
                
                <h1 className="completion-title">Lesson Complete! 🎉</h1>
                
                <div className="completion-stats">
                    <div className="stat-card">
                        <Zap size={32} color="#e67e22" />
                        <div className="stat-value">{xp}</div>
                        <div className="stat-label">XP Earned</div>
                    </div>
                    <div className="stat-card">
                        <Target size={32} color="#3498db" />
                        <div className="stat-value">{exercises.length - lives}</div>
                        <div className="stat-label">Correct</div>
                    </div>
                    <div className="stat-card">
                        <Flame size={32} color="#e74c3c" />
                        <div className="stat-value">{combo > 5 ? combo : 'N/A'}</div>
                        <div className="stat-label">Best Combo</div>
                    </div>
                </div>
                
                <div className="completion-message">
                    <p>{zebraMessage}</p>
                </div>
                
                <div className="completion-actions">
                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        <ArrowLeft size={20} /> Dashboard
                    </button>
                    <button onClick={() => navigate('/lessons')} className="btn-primary">
                        Next Lesson <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    const exercise = exercises[currentExercise];
    const progress = ((currentExercise + 1) / exercises.length) * 100;

    return (
        <div className="learn-gamified-container">
            {/* Top Bar */}
            <div className="game-topbar">
                <button onClick={() => navigate('/lessons')} className="btn-back">
                    <X size={24} />
                </button>
                
                <div className="progress-bar-game">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="game-stats">
                    <div className="stat-item">
                        <Heart size={20} color="#e74c3c" fill={lives > 0 ? "#e74c3c" : "none"} />
                        <span>{lives}</span>
                    </div>
                    <div className="stat-item">
                        <Zap size={20} color="#e67e22" />
                        <span>{xp}</span>
                    </div>
                    {combo > 1 && (
                        <div className="stat-item combo">
                            <Flame size={20} color="#f39c12" />
                            <span>{combo}x</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Zebra Mascot */}
            {showZebra && (
                <div className={`zebra-mascot zebra-${zebraState}`}>
                    <img src="/logo.png" alt="Zara the Zebra" className="zebra-avatar" />
                    {zebraMessage && (
                        <div className="zebra-speech-bubble">
                            {zebraMessage}
                        </div>
                    )}
                </div>
            )}

            {/* Exercise Content */}
            <div className="exercise-container">
                <div className="exercise-type-badge">{exercise.type}</div>
                
                <h2 className="exercise-question">{exercise.question}</h2>

                {/* Translation Exercise */}
                {exercise.type === 'translate' && (
                    <div className="exercise-translate">
                        {exercise.audio && (
                            <button onClick={() => speak(exercise.hindiWord)} className="audio-btn-game" disabled={isPlaying}>
                                <Volume2 size={24} />
                            </button>
                        )}
                        
                        <div className="options-grid-game">
                            {exercise.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={canContinue}
                                    className={`option-card ${selectedAnswer === option ? (isCorrect ? 'correct' : 'incorrect') : ''} ${canContinue && option === exercise.correctAnswer ? 'show-correct' : ''}`}
                                >
                                    <span className="option-text">{option}</span>
                                    {canContinue && option === exercise.correctAnswer && <Check className="icon-check" size={20} />}
                                    {selectedAnswer === option && !isCorrect && <X className="icon-x" size={20} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Listen Exercise */}
                {exercise.type === 'listen' && (
                    <div className="exercise-listen">
                        <button onClick={() => speak(exercise.audioText)} className="listen-btn-big">
                            <Volume2 size={48} />
                            <span>Tap to Listen</span>
                        </button>
                        
                        <div className="options-grid-game">
                            {exercise.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={canContinue}
                                    className={`option-card ${selectedAnswer === option ? (isCorrect ? 'correct' : 'incorrect') : ''} ${canContinue && option === exercise.correctAnswer ? 'show-correct' : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Speak Exercise */}
                {exercise.type === 'speak' && (
                    <div className="exercise-speak">
                        <div className="word-display">
                            <div className="hindi-word-big">{exercise.wordToSpeak}</div>
                            <div className="romanization">({exercise.romanization})</div>
                            <button onClick={() => speak(exercise.wordToSpeak)} className="audio-btn-game">
                                <Volume2 size={20} /> Listen
                            </button>
                        </div>
                        
                        <button
                            onClick={startListening}
                            disabled={isListening || canContinue}
                            className={`mic-btn-big ${isListening ? 'listening' : ''}`}
                        >
                            {isListening ? <MicOff size={48} /> : <Mic size={48} />}
                            <span>{isListening ? 'Listening...' : 'Tap to Speak'}</span>
                        </button>
                        
                        {userSpeech && (
                            <div className="speech-result">
                                <p>You said: <strong>{userSpeech}</strong></p>
                            </div>
                        )}
                    </div>
                )}

                {/* Match Exercise */}
                {exercise.type === 'match' && (
                    <div className="exercise-match">
                        <div className="match-columns">
                            <div className="match-column">
                                {exercise.pairs.map((pair, idx) => (
                                    <button
                                        key={`en-${idx}`}
                                        onClick={() => handleMatchSelect(pair.english, 'english')}
                                        disabled={matchedPairs.includes(pair)}
                                        className={`match-item ${selectedMatch?.item === pair.english ? 'selected' : ''} ${matchedPairs.includes(pair) ? 'matched' : ''}`}
                                    >
                                        {pair.english}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="match-column">
                                {exercise.pairs.map((pair, idx) => (
                                    <button
                                        key={`hi-${idx}`}
                                        onClick={() => handleMatchSelect(pair.hindi, 'hindi')}
                                        disabled={matchedPairs.includes(pair)}
                                        className={`match-item ${selectedMatch?.item === pair.hindi ? 'selected' : ''} ${matchedPairs.includes(pair) ? 'matched' : ''}`}
                                    >
                                        {pair.hindi}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Fill Blank Exercise */}
                {exercise.type === 'fillblank' && (
                    <div className="exercise-fillblank">
                        <p className="sentence-display">{exercise.sentence}</p>
                        
                        <div className="options-grid-game">
                            {exercise.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    disabled={canContinue}
                                    className={`option-card ${selectedAnswer === option ? (isCorrect ? 'correct' : 'incorrect') : ''} ${canContinue && option === exercise.correctAnswer ? 'show-correct' : ''}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Feedback Panel */}
            {showFeedback && (
                <div className={`feedback-panel-game ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="feedback-content">
                        <div className="feedback-icon">
                            {isCorrect ? <Check size={32} /> : <X size={32} />}
                        </div>
                        <div className="feedback-text">
                            <h3>{isCorrect ? 'Correct!' : 'Not quite'}</h3>
                            {!isCorrect && (
                                <p>The answer was: <strong>{exercise.correctAnswer}</strong></p>
                            )}
                        </div>
                    </div>
                    <button onClick={handleContinue} className="btn-continue">
                        {currentExercise < exercises.length - 1 ? 'Continue' : 'Finish'} →
                    </button>
                </div>
            )}

            {/* Game Over (No Lives) */}
            {lives === 0 && !completed && (
                <div className="game-over-overlay">
                    <div className="game-over-modal">
                        <img src="/logo.png" alt="Zara sad" className="zebra-sad" />
                        <h2>Out of Lives! 💔</h2>
                        <p>Don't worry! You can try again.</p>
                        <div className="game-over-actions">
                            <button onClick={() => navigate('/lessons')} className="btn-secondary">
                                Back to Lessons
                            </button>
                            <button onClick={() => window.location.reload()} className="btn-primary">
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LearnGamefied;