import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronRight, Volume2, Award, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import '../Learning.css';

// --- HELPER: GENERATE SLIDES FOR A VOWEL ---
// Creates 2 slides: 
// 1. Intro/Quiz (Hindi -> English)
// 2. Reverse Quiz (English -> Hindi)
const createVowelPair = (hindiChar, englishSound, hintText, optionsEnglish, optionsHindi) => {
  return [
    {
      type: 'quiz',
      subtype: 'intro',
      badge: "New Character",
      title: "New Vowel",
      question: "What sound does this letter make?",
      mainChar: hindiChar,
      audioText: hindiChar,
      hint: hintText,
      options: optionsEnglish, // e.g., ["a", "aa", "i", "ee"]
      answer: englishSound     // e.g., "a"
    },
    {
      type: 'quiz',
      subtype: 'char_select',
      question: `Select the correct character for '${englishSound}'`,
      audioText: hindiChar,
      options: optionsHindi,   // e.g., ["अ", "आ", "इ"]
      answer: hindiChar
    }
  ];
};

// --- LESSON CONTENT DATABASE ---
const lessonDatabase = {
  // LESSON 1: First 6 Vowels (12 Questions)
  // Vowels: अ (a), आ (aa), इ (i), ई (ee), उ (u), ऊ (oo)
  1: {
    title: "Vowels (Swar) - Part 1",
    slides: [
      ...createVowelPair("अ", "a", "Like 'a' in 'America'", ["a", "aa", "i", "ee"], ["अ", "आ", "इ", "ई"]),
      ...createVowelPair("आ", "aa", "Like 'a' in 'Father'", ["a", "aa", "u", "oo"], ["अ", "आ", "उ", "ऊ"]),
      ...createVowelPair("इ", "i", "Like 'i' in 'Sit'", ["aa", "i", "ee", "u"], ["इ", "ई", "अ", "आ"]),
      ...createVowelPair("ई", "ee", "Like 'ee' in 'Feet'", ["i", "ee", "u", "oo"], ["इ", "ई", "उ", "ऊ"]),
      ...createVowelPair("उ", "u", "Like 'u' in 'Put'", ["u", "oo", "a", "aa"], ["उ", "ऊ", "अ", "आ"]),
      ...createVowelPair("ऊ", "oo", "Like 'oo' in 'Boot'", ["u", "oo", "i", "ee"], ["उ", "ऊ", "इ", "ई"]),
    ]
  },

  // LESSON 2: Remaining 7 Vowels (14 Questions)
  // Vowels: ऋ (ri), ए (e), ऐ (ai), ओ (o), औ (au), अं (ang), अः (aha)
  2: {
    title: "Vowels (Swar) - Part 2",
    slides: [
      ...createVowelPair("ऋ", "ri", "Like 'ri' in 'Krishna'", ["ri", "e", "ai", "o"], ["ऋ", "ए", "ऐ", "ओ"]),
      ...createVowelPair("ए", "e", "Like 'a' in 'Kate'", ["ri", "e", "ai", "o"], ["ए", "ऐ", "ओ", "औ"]),
      ...createVowelPair("ऐ", "ai", "Like 'ai' in 'Hair'", ["e", "ai", "o", "au"], ["ए", "ऐ", "ओ", "औ"]),
      ...createVowelPair("ओ", "o", "Like 'o' in 'Go'", ["ai", "o", "au", "ang"], ["ओ", "औ", "अं", "अः"]),
      ...createVowelPair("औ", "au", "Like 'au' in 'August'", ["o", "au", "ang", "aha"], ["ओ", "औ", "अं", "अः"]),
      ...createVowelPair("अं", "ang", "Nasal 'n' sound", ["au", "ang", "aha", "ri"], ["अं", "अः", "ऋ", "ए"]),
      ...createVowelPair("अः", "aha", "Breathy 'h' sound", ["ang", "aha", "a", "aa"], ["अं", "अः", "अ", "आ"]),
    ]
  }
};

const LearningScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Load Initial Data
  const lessonId = location.state?.lessonId || 1;
  const initialLessonData = lessonDatabase[lessonId] || lessonDatabase[1]; 

  // 2. State Management
  // activeSlides: The list of slides we are currently playing. 
  // We put this in state so we can append mistakes to it dynamically!
  const [activeSlides, setActiveSlides] = useState(initialLessonData.slides);
  const [originalCount] = useState(initialLessonData.slides.length);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Mistake Logic: Store slides that need to be reviewed
  const [mistakeQueue, setMistakeQueue] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Update Progress Bar
  useEffect(() => {
    // If we are in review mode (index > original length), keep bar at 95%
    if (currentSlideIndex >= originalCount) {
      setProgress(95); 
    } else {
      const prog = ((currentSlideIndex) / originalCount) * 100;
      setProgress(prog);
    }
  }, [currentSlideIndex, originalCount]);

  // Text-to-Speech
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Auto-play audio on slide load
  useEffect(() => {
    const slide = activeSlides[currentSlideIndex];
    if (slide && slide.audioText) {
        setTimeout(() => playAudio(slide.audioText), 600);
    }
  }, [currentSlideIndex, activeSlides]);

  // --- LOGIC: HANDLE ANSWER ---
  const handleQuizAnswer = (option) => {
    if (isCorrect !== null) return; // Prevent double clicking
    
    setSelectedOption(option);
    const currentSlide = activeSlides[currentSlideIndex];
    const correctAnswer = currentSlide.answer;
    
    if (option === correctAnswer) {
      setIsCorrect(true);
      playAudio(option);
    } else {
      setIsCorrect(false);
      
      // MISTAKE LOGIC: Add this slide to the queue to repeat later
      // We check if it's already in the queue to avoid duplicates in the same run
      setMistakeQueue((prev) => [...prev, { ...currentSlide, isReview: true }]);
    }
  };

  // --- LOGIC: NEXT BUTTON ---
  const handleNext = () => {
    // 1. Reset selection state
    setSelectedOption(null);
    setIsCorrect(null);

    // 2. Check if there are more slides in the CURRENT active list
    if (currentSlideIndex < activeSlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } 
    // 3. If we reached the end, CHECK FOR MISTAKES
    else {
      if (mistakeQueue.length > 0) {
        // We have mistakes! Enter Review Mode.
        setIsReviewMode(true);
        
        // Append mistakes to the end of the active slides
        setActiveSlides(prev => [...prev, ...mistakeQueue]);
        
        // Clear the queue (so we don't loop forever unless we make NEW mistakes)
        setMistakeQueue([]);
        
        // Move to the next slide (which is the first mistake we just appended)
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        // No mistakes left? FINISH!
        setProgress(100);
        setShowSuccess(true);
      }
    }
  };

  if (showSuccess) {
    return (
      <div className="learning-container success-screen">
        <div className="success-content">
          <Award size={80} color="#fbbf24" className="bounce-anim" />
          <h1>Lesson Complete!</h1>
          <p>You mastered {originalCount / 2} new characters.</p>
          <div className="stats-row">
            <div className="stat-box"><span>🔥</span> +20 XP</div>
            <div className="stat-box"><span>🎯</span> {activeSlides.length > originalCount ? 'Mistakes cleared' : 'Perfect Score'}</div>
          </div>
          <button className="continue-btn" onClick={() => navigate('/lessons')}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const slide = activeSlides[currentSlideIndex];
  if (!slide) return <div>Loading...</div>;

  return (
    <div className="learning-container">
      {/* HEADER */}
      <div className="learning-header">
        <button className="close-btn" onClick={() => navigate('/lessons')}><X size={24} /></button>
        
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: isReviewMode ? '#f59e0b' : '#58cc02' // Orange if reviewing, Green if normal
            }}
          ></div>
        </div>
        
        {/* Heart/Review Indicator */}
        {isReviewMode && (
          <div className="review-badge fade-in">
             <RefreshCw size={16} /> Reviewing
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="slide-content">
        
        {/* Badge: New Character OR Review */}
        {slide.isReview ? (
           <div className="fade-in text-center mb-10">
              <span className="badge-new" style={{background:'#f59e0b'}}>Previous Mistake</span>
           </div>
        ) : slide.badge && (
           <div className="fade-in text-center mb-10">
              <span className="badge-new"><Zap size={14} fill="currentColor"/> {slide.badge}</span>
           </div>
        )}

        <h2 className="quiz-question">{slide.question}</h2>

        {/* Visual Card */}
        {(slide.subtype === 'intro' || slide.subtype === 'audio_match') && (
            <div className="text-center fade-in">
                <div className="card-display" onClick={() => playAudio(slide.audioText)} style={{cursor: 'pointer'}}>
                    <h1 className="hindi-large">{slide.mainChar}</h1>
                    <div className="pronunciation">
                        <button className="audio-btn-circle" onClick={(e) => {e.stopPropagation(); playAudio(slide.audioText);}}>
                            <Volume2 size={24} />
                        </button>
                    </div>
                </div>
                {slide.hint && <p className="explanation">{slide.hint}</p>}
            </div>
        )}

        {/* Options Grid */}
        <div className={`options-grid fade-in ${slide.subtype === 'char_select' ? 'grid-cols-3' : 'grid-cols-2'}`} style={{marginTop: '30px'}}>
            {slide.options.map((opt, idx) => (
            <button 
                key={idx}
                className={`option-btn 
                ${slide.subtype === 'char_select' ? 'hindi-option' : ''}
                ${selectedOption === opt ? 'selected' : ''} 
                ${isCorrect === true && selectedOption === opt ? 'correct' : ''}
                ${isCorrect === false && selectedOption === opt ? 'wrong' : ''}
                `}
                onClick={() => handleQuizAnswer(opt)}
            >
                {opt}
            </button>
            ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className={`learning-footer ${isCorrect === true ? 'footer-success' : ''} ${isCorrect === false ? 'footer-error' : ''}`}>
        
        <div className="footer-feedback-content">
            {isCorrect === true && (
                <div className="feedback-row">
                    <div className="icon-circle success"><CheckCircle size={20} color="#2ecc71" /></div>
                    <span className="feedback-text success">Excellent!</span>
                </div>
            )}
            {isCorrect === false && (
                <div className="feedback-row">
                    <div className="icon-circle error"><AlertCircle size={20} color="#ef4444" /></div>
                    <div className="feedback-text-group">
                        <span className="feedback-text error">Incorrect</span>
                        <span className="feedback-subtext">Correct answer: {slide.answer}</span>
                    </div>
                </div>
            )}
        </div>

        <button 
          className={`next-btn ${isCorrect === false ? 'btn-error' : ''}`}
          onClick={handleNext}
          disabled={isCorrect === null}
        >
          {currentSlideIndex === activeSlides.length - 1 && mistakeQueue.length === 0 
            ? 'Finish' 
            : (isCorrect === false ? 'Got it' : 'Next')
          } 
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LearningScreen;