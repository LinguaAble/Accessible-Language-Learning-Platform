import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Check, X, ArrowLeft, RefreshCw, AlertCircle, Volume2, 
    Mic, MicOff, Pause, Play, ChevronRight, Eye, Award,
    Headphones, BookOpen, MessageCircle, Zap, Settings as SettingsIcon
} from 'lucide-react';
import './Learn.css';

const Learn = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState(null);

    // Multi-modal Learning States
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizStarted, setQuizStarted] = useState(false);
    
    // Audio Features
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1.0); // ADHD: Adjustable speed
    
    // Speech Recognition
    const [isListening, setIsListening] = useState(false);
    const [userSpeech, setUserSpeech] = useState('');
    const [pronunciationScore, setPronunciationScore] = useState(null);
    
    // Visual Aids
    const [showVisualAid, setShowVisualAid] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [fontSize, setFontSize] = useState('normal'); // Accessibility
    
    // ADHD-Friendly Features
    const [focusMode, setFocusMode] = useState(false);
    const [breakTimer, setBreakTimer] = useState(0);
    const [celebrationMode, setCelebrationMode] = useState(false);
    
    const recognitionRef = useRef(null);
    const breakTimerRef = useRef(null);

    // Initialize Speech Synthesis (Text-to-Speech)
    const speak = (text, lang = 'hi-IN') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any ongoing speech
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = playbackRate; // Adjustable speed for ADHD
            utterance.pitch = 1;
            
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-speech is not supported in your browser. Please use Chrome or Edge.');
        }
    };

    // Initialize Speech Recognition (Speech-to-Text)
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'hi-IN'; // Hindi language

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setUserSpeech(transcript);
                evaluatePronunciation(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'no-speech') {
                    alert('No speech detected. Please try again.');
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Break Timer for ADHD (every 15 minutes)
    useEffect(() => {
        breakTimerRef.current = setInterval(() => {
            setBreakTimer(prev => prev + 1);
        }, 60000); // Every minute

        return () => clearInterval(breakTimerRef.current);
    }, []);

    useEffect(() => {
        if (breakTimer >= 15 && !completed) {
            const shouldBreak = window.confirm('You\'ve been learning for 15 minutes! Take a 2-minute break? 🧘');
            if (shouldBreak) {
                setBreakTimer(0);
                // Could pause the lesson here
            } else {
                setBreakTimer(0);
            }
        }
    }, [breakTimer, completed]);

    // Fetch Lesson Data
    useEffect(() => {
        if (!state || !state.lessonId) {
            navigate('/lessons');
            return;
        }

        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/learn/lessons', {
                    headers: { 'x-auth-token': token }
                });
                const found = res.data.find(l => l._id === state.lessonId);

                if (found) {
                    // Enhance lesson with multi-modal content
                    enhanceLessonContent(found);
                    setLesson(found);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLesson();
    }, [state, navigate]);

    // Enhance lesson with multi-modal content
    const enhanceLessonContent = (lesson) => {
        // Add quiz questions with pronunciation and visual aids
        if (lesson.title.includes('Greetings')) {
            lesson.quiz = [
                {
                    question: "How do you say 'Hello' in Hindi?",
                    hindiWord: "नमस्ते",
                    romanization: "Namaste",
                    options: ["Namaste", "Alvida", "Dhanyavaad", "Haan"],
                    correct: "Namaste",
                    explanation: "Namaste (नमस्ते) is the most common greeting in Hindi. It's respectful and can be used any time of day.",
                    audioText: "नमस्ते",
                    visualAid: "🙏",
                    type: "vocabulary"
                },
                {
                    question: "How do you say 'Goodbye'?",
                    hindiWord: "अलविदा",
                    romanization: "Alvida",
                    options: ["Namaste", "Alvida", "Shukriya", "Maaf karo"],
                    correct: "Alvida",
                    explanation: "Alvida (अलविदा) means goodbye. You can also use 'Phir milenge' (फिर मिलेंगे) which means 'See you again'.",
                    audioText: "अलविदा",
                    visualAid: "👋",
                    type: "vocabulary"
                },
                {
                    question: "Practice speaking: Say 'Namaste' (नमस्ते)",
                    hindiWord: "नमस्ते",
                    romanization: "Namaste",
                    correct: "namaste",
                    explanation: "Great job! Namaste is pronounced 'na-mas-tay'.",
                    audioText: "नमस्ते",
                    visualAid: "🗣️",
                    type: "pronunciation"
                }
            ];
        } else if (lesson.title.includes('Numbers')) {
            lesson.quiz = [
                {
                    question: "What is the number 'Three' in Hindi?",
                    hindiWord: "तीन",
                    romanization: "Teen",
                    options: ["Ek", "Do", "Teen", "Chaar"],
                    correct: "Teen",
                    explanation: "Teen (तीन) means three. Practice: Ek (1), Do (2), Teen (3), Chaar (4), Paanch (5).",
                    audioText: "तीन",
                    visualAid: "3️⃣",
                    type: "vocabulary"
                },
                {
                    question: "Practice speaking: Say 'Teen' (तीन)",
                    hindiWord: "तीन",
                    romanization: "Teen",
                    correct: "teen",
                    explanation: "Excellent! Teen rhymes with 'seen'.",
                    audioText: "तीन",
                    visualAid: "🗣️",
                    type: "pronunciation"
                }
            ];
        } else {
            // Generic quiz for other lessons
            lesson.quiz = [
                {
                    question: `What did you learn about ${lesson.title}?`,
                    options: ["I understand", "Need more practice", "Very clear", "Confused"],
                    correct: "I understand",
                    explanation: "Great! Let's continue practicing.",
                    type: "comprehension"
                }
            ];
        }
    };

    // Start Speech Recognition
    const startListening = () => {
        if (recognitionRef.current) {
            setUserSpeech('');
            setPronunciationScore(null);
            setIsListening(true);
            recognitionRef.current.start();
        } else {
            alert('Speech recognition is not supported in your browser. Please use Chrome.');
        }
    };

    // Stop Speech Recognition
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    // Evaluate Pronunciation (Simple NLP-based scoring)
    const evaluatePronunciation = (spokenText) => {
        const question = lesson.quiz[currentStep];
        const expectedWord = question.correct.toLowerCase();
        const spokenWord = spokenText.toLowerCase().trim();

        // Simple similarity check (in production, use Levenshtein distance or API)
        const similarity = calculateSimilarity(expectedWord, spokenWord);
        
        let score = 0;
        let feedbackMsg = '';

        if (similarity >= 0.8) {
            score = 100;
            feedbackMsg = "Perfect pronunciation! 🎉";
        } else if (similarity >= 0.6) {
            score = 75;
            feedbackMsg = "Good effort! Try again for better clarity. 👍";
        } else if (similarity >= 0.4) {
            score = 50;
            feedbackMsg = "Keep practicing! Listen to the audio again. 🎧";
        } else {
            score = 25;
            feedbackMsg = "Not quite right. Let's try again! 💪";
        }

        setPronunciationScore({ score, message: feedbackMsg });
        
        // Auto-feedback
        setFeedback({
            type: score >= 70 ? 'success' : 'warning',
            message: feedbackMsg
        });
    };

    // Calculate text similarity (simple implementation)
    const calculateSimilarity = (str1, str2) => {
        // Remove common variations and transliterations
        const normalize = (s) => s.replace(/[aeiou]/gi, '').toLowerCase();
        const s1 = normalize(str1);
        const s2 = normalize(str2);

        if (s1 === s2) return 1.0;
        if (str1 === str2) return 1.0;
        
        // Check if one contains the other
        if (str1.includes(str2) || str2.includes(str1)) return 0.8;
        
        // Simple character matching
        const matches = [...s1].filter(c => s2.includes(c)).length;
        return matches / Math.max(s1.length, s2.length);
    };

    // Handle Option Selection
    const handleOptionSelect = (option) => {
        if (feedback) return;
        setSelectedOption(option);

        const currentQuestion = lesson.quiz[currentStep];
        
        if (currentQuestion.type === 'pronunciation') {
            // For pronunciation questions, they need to speak
            return;
        }

        if (option === currentQuestion.correct) {
            setFeedback({
                type: 'success',
                message: '✅ Correct! ' + currentQuestion.explanation
            });
            // Celebration animation for ADHD engagement
            setCelebrationMode(true);
            setTimeout(() => setCelebrationMode(false), 2000);
        } else {
            setFeedback({
                type: 'error',
                message: '❌ Not quite. ' + currentQuestion.explanation
            });
        }
    };

    // Handle Next Question
    const handleNext = async () => {
        if (currentStep < lesson.quiz.length - 1) {
            setCurrentStep(curr => curr + 1);
            setFeedback(null);
            setSelectedOption(null);
            setUserSpeech('');
            setPronunciationScore(null);
        } else {
            // Complete lesson
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                await axios.post('http://localhost:5000/api/learn/progress', {
                    lessonId: lesson._id,
                    score: 100,
                    mistakes: [],
                    status: 'Completed'
                }, {
                    headers: { 'x-auth-token': token }
                });

                setCompleted(true);
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Render Loading State
    if (loading) {
        return (
            <div className="loading-screen">
                <BookOpen size={48} className="loading-icon" />
                <p>Loading your personalized lesson...</p>
            </div>
        );
    }

    if (!lesson) return <div className="error-screen">Lesson not found</div>;

    // Completion Screen
    if (completed) {
        return (
            <div className={`learn-container ${focusMode ? 'focus-mode' : ''}`}>
                <div className="completion-card">
                    <div className="completion-animation">
                        <Award size={80} color="#2ecc71" />
                    </div>
                    <h2>🎉 Lesson Complete!</h2>
                    <p className="completion-message">
                        Excellent work! You've mastered {lesson.title}. 
                        Your dedication to learning Hindi is inspiring!
                    </p>
                    
                    <div className="completion-stats">
                        <div className="stat-item">
                            <Zap size={24} color="#e67e22" />
                            <span>Lesson Completed</span>
                        </div>
                        <div className="stat-item">
                            <Headphones size={24} color="#3498db" />
                            <span>Multi-modal Learning</span>
                        </div>
                    </div>

                    <div className="completion-actions">
                        <button onClick={() => navigate('/dashboard')} className="secondary-btn">
                            <ArrowLeft size={20} /> Dashboard
                        </button>
                        <button onClick={() => navigate('/lessons')} className="primary-btn">
                            Next Lesson <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Reading Content Phase
    if (!quizStarted) {
        return (
            <div className={`learn-container ${focusMode ? 'focus-mode' : ''}`}>
                {/* Accessibility Toolbar */}
                <div className="accessibility-toolbar">
                    <button 
                        onClick={() => setFocusMode(!focusMode)}
                        className="toolbar-btn"
                        title="Toggle Focus Mode"
                    >
                        <Eye size={18} /> {focusMode ? 'Exit Focus' : 'Focus Mode'}
                    </button>
                    
                    <select 
                        value={fontSize} 
                        onChange={(e) => setFontSize(e.target.value)}
                        className="toolbar-select"
                    >
                        <option value="small">Small Text</option>
                        <option value="normal">Normal Text</option>
                        <option value="large">Large Text</option>
                        <option value="xlarge">Extra Large</option>
                    </select>

                    <select 
                        value={playbackRate} 
                        onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                        className="toolbar-select"
                    >
                        <option value="0.75">Slow (0.75x)</option>
                        <option value="1.0">Normal (1x)</option>
                        <option value="1.25">Fast (1.25x)</option>
                    </select>
                </div>

                {/* Header */}
                <header className="lesson-header">
                    <button onClick={() => navigate('/lessons')} className="back-btn">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="lesson-title-section">
                        <h2 className={`lesson-title font-${fontSize}`}>{lesson.title}</h2>
                        <span className="lesson-type-badge">{lesson.type}</span>
                    </div>
                </header>

                {/* Content Card */}
                <div className="lesson-content-card">
                    <div className="content-header">
                        <h3>📖 Learn</h3>
                        <button 
                            onClick={() => speak(lesson.content)}
                            className="audio-btn"
                            disabled={isSpeaking}
                        >
                            {isSpeaking ? <Pause size={20} /> : <Volume2 size={20} />}
                            {isSpeaking ? 'Playing...' : 'Listen'}
                        </button>
                    </div>

                    <div className={`lesson-content font-${fontSize}`}>
                        {lesson.content}
                    </div>

                    <div className="visual-aids-section">
                        <h4>🎨 Visual Learning</h4>
                        <div className="visual-grid">
                            {lesson.title.includes('Greetings') && (
                                <>
                                    <div className="visual-card">
                                        <div className="visual-emoji">🙏</div>
                                        <div className="visual-text">
                                            <h5>नमस्ते (Namaste)</h5>
                                            <p>Hello/Greetings</p>
                                            <button onClick={() => speak('नमस्ते')} className="small-audio-btn">
                                                <Volume2 size={16} /> Hear it
                                            </button>
                                        </div>
                                    </div>
                                    <div className="visual-card">
                                        <div className="visual-emoji">👋</div>
                                        <div className="visual-text">
                                            <h5>अलविदा (Alvida)</h5>
                                            <p>Goodbye</p>
                                            <button onClick={() => speak('अलविदा')} className="small-audio-btn">
                                                <Volume2 size={16} /> Hear it
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {lesson.title.includes('Numbers') && (
                                <>
                                    <div className="visual-card">
                                        <div className="visual-emoji">1️⃣</div>
                                        <div className="visual-text">
                                            <h5>एक (Ek)</h5>
                                            <p>One</p>
                                            <button onClick={() => speak('एक')} className="small-audio-btn">
                                                <Volume2 size={16} /> Hear it
                                            </button>
                                        </div>
                                    </div>
                                    <div className="visual-card">
                                        <div className="visual-emoji">2️⃣</div>
                                        <div className="visual-text">
                                            <h5>दो (Do)</h5>
                                            <p>Two</p>
                                            <button onClick={() => speak('दो')} className="small-audio-btn">
                                                <Volume2 size={16} /> Hear it
                                            </button>
                                        </div>
                                    </div>
                                    <div className="visual-card">
                                        <div className="visual-emoji">3️⃣</div>
                                        <div className="visual-text">
                                            <h5>तीन (Teen)</h5>
                                            <p>Three</p>
                                            <button onClick={() => speak('तीन')} className="small-audio-btn">
                                                <Volume2 size={16} /> Hear it
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        className="start-quiz-btn"
                        onClick={() => setQuizStarted(true)}
                    >
                        Start Practice <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        );
    }

    // Quiz Phase
    const question = lesson.quiz[currentStep];
    const isPronunciationQuestion = question.type === 'pronunciation';

    return (
        <div className={`learn-container ${focusMode ? 'focus-mode' : ''} ${celebrationMode ? 'celebration' : ''}`}>
            {/* Progress Header */}
            <header className="quiz-header">
                <button onClick={() => setQuizStarted(false)} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <div className="progress-bar-container">
                    <div 
                        className="progress-bar-fill"
                        style={{ width: `${((currentStep + 1) / lesson.quiz.length) * 100}%` }}
                    ></div>
                </div>
                <span className="progress-text">{currentStep + 1}/{lesson.quiz.length}</span>
            </header>

            {/* Question Card */}
            <div className="question-card">
                {/* Visual Aid */}
                {question.visualAid && (
                    <div className="question-visual-aid">
                        <span className="visual-aid-icon">{question.visualAid}</span>
                    </div>
                )}

                {/* Question */}
                <h2 className={`question-text font-${fontSize}`}>{question.question}</h2>

                {/* Hindi Word Display */}
                {question.hindiWord && (
                    <div className="hindi-word-display">
                        <div className="hindi-script">{question.hindiWord}</div>
                        <div className="romanization">({question.romanization})</div>
                        <button 
                            onClick={() => speak(question.audioText || question.hindiWord)}
                            className="word-audio-btn"
                            disabled={isSpeaking}
                        >
                            <Volume2 size={20} />
                            {isSpeaking ? 'Playing...' : 'Listen'}
                        </button>
                    </div>
                )}

                {/* Pronunciation Question */}
                {isPronunciationQuestion ? (
                    <div className="pronunciation-section">
                        <div className="pronunciation-instructions">
                            <Headphones size={24} color="#3498db" />
                            <p>Click the microphone and say the word out loud</p>
                        </div>

                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`mic-button ${isListening ? 'listening' : ''}`}
                        >
                            {isListening ? <MicOff size={48} /> : <Mic size={48} />}
                        </button>

                        {isListening && (
                            <div className="listening-indicator">
                                <div className="pulse"></div>
                                <p>Listening...</p>
                            </div>
                        )}

                        {userSpeech && (
                            <div className="speech-result">
                                <p>You said: <strong>{userSpeech}</strong></p>
                                {pronunciationScore && (
                                    <div className={`score-badge score-${pronunciationScore.score >= 70 ? 'good' : 'fair'}`}>
                                        Score: {pronunciationScore.score}/100
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Multiple Choice Options */
                    <div className="options-grid">
                        {question.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={!!feedback}
                                className={`option-btn ${selectedOption === opt ? 'selected' : ''} ${
                                    feedback && opt === question.correct ? 'correct' : 
                                    feedback && selectedOption === opt && opt !== question.correct ? 'incorrect' : ''
                                }`}
                            >
                                {opt}
                                {feedback && opt === question.correct && <Check size={20} className="icon-check" />}
                                {feedback && selectedOption === opt && opt !== question.correct && <X size={20} className="icon-x" />}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Panel */}
            {feedback && (
                <div className={`feedback-panel feedback-${feedback.type}`}>
                    <div className="feedback-icon">
                        {feedback.type === 'success' ? <Check size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <div className="feedback-content">
                        <h4>{feedback.type === 'success' ? 'Excellent! 🎉' : 'Good Try! 💪'}</h4>
                        <p>{feedback.message}</p>
                    </div>
                    <button onClick={handleNext} className="continue-btn">
                        {currentStep < lesson.quiz.length - 1 ? 'Continue →' : 'Finish Lesson 🎯'}
                    </button>
                </div>
            )}

            {/* Celebration Confetti */}
            {celebrationMode && (
                <div className="confetti-container">
                    <div className="confetti"></div>
                    <div className="confetti"></div>
                    <div className="confetti"></div>
                    <div className="confetti"></div>
                    <div className="confetti"></div>
                </div>
            )}
        </div>
    );
};

export default Learn;