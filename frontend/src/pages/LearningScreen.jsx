import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronRight, Volume2, Award, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

import '../Learning.css';

// --- HELPER: GENERATE SLIDES ---
// Creates 2 slides: 1. Intro/Quiz (Hindi -> English), 2. Reverse Quiz (English -> Hindi)
const createCharPair = (hindiChar, englishSound, hintText, optionsEnglish, optionsHindi) => {
  return [
    {
      type: 'quiz',
      subtype: 'intro',
      badge: "New Character",
      title: "New Letter",
      question: "What sound does this letter make?",
      mainChar: hindiChar,
      audioText: hindiChar,
      hint: hintText,
      options: optionsEnglish,
      answer: englishSound
    },
    {
      type: 'quiz',
      subtype: 'char_select',
      question: `Select the correct character for '${englishSound}'`,
      audioText: hindiChar,
      options: optionsHindi,
      answer: hindiChar
    }
  ];
};

// --- DATA: VOWELS ---
const vowelsPart1 = [
  ...createCharPair("अ", "a", "Like 'a' in 'America'", ["a", "aa", "i", "ee"], ["अ", "आ", "इ", "ई"]),
  ...createCharPair("आ", "aa", "Like 'a' in 'Father'", ["a", "aa", "u", "oo"], ["अ", "आ", "उ", "ऊ"]),
  ...createCharPair("इ", "i", "Like 'i' in 'Sit'", ["aa", "i", "ee", "u"], ["इ", "ई", "अ", "आ"]),
  ...createCharPair("ई", "ee", "Like 'ee' in 'Feet'", ["i", "ee", "u", "oo"], ["इ", "ई", "उ", "ऊ"]),
  ...createCharPair("उ", "u", "Like 'u' in 'Put'", ["u", "oo", "a", "aa"], ["उ", "ऊ", "अ", "आ"]),
  ...createCharPair("ऊ", "oo", "Like 'oo' in 'Boot'", ["u", "oo", "i", "ee"], ["उ", "ऊ", "इ", "ई"]),
];

const vowelsPart2 = [
  ...createCharPair("ऋ", "ri", "Like 'ri' in 'Krishna'", ["ri", "e", "ai", "o"], ["ऋ", "ए", "ऐ", "ओ"]),
  ...createCharPair("ए", "e", "Like 'a' in 'Kate'", ["ri", "e", "ai", "o"], ["ए", "ऐ", "ओ", "औ"]),
  ...createCharPair("ऐ", "ai", "Like 'ai' in 'Hair'", ["e", "ai", "o", "au"], ["ए", "ऐ", "ओ", "औ"]),
  ...createCharPair("ओ", "o", "Like 'o' in 'Go'", ["ai", "o", "au", "ang"], ["ओ", "औ", "अं", "अः"]),
  ...createCharPair("औ", "au", "Like 'au' in 'August'", ["o", "au", "ang", "aha"], ["ओ", "औ", "अं", "अः"]),
  ...createCharPair("अं", "ang", "Nasal 'n' sound", ["au", "ang", "aha", "ri"], ["अं", "अः", "ऋ", "ए"]),
  ...createCharPair("अः", "aha", "Breathy 'h' sound", ["ang", "aha", "a", "aa"], ["अं", "अः", "अ", "आ"]),
];

// --- DATA: CONSONANTS (Split into 6 Lessons) ---
const consonantsL4 = [ // k, kh, g, gh, ng, ch
  ...createCharPair("क", "ka", "Like 'k' in 'Skate'", ["ka", "kha", "ga", "cha"], ["क", "ख", "ग", "घ"]),
  ...createCharPair("ख", "kha", "Like 'kh' in 'Khan'", ["ka", "kha", "ga", "gha"], ["क", "ख", "ग", "घ"]),
  ...createCharPair("ग", "ga", "Like 'g' in 'Go'", ["ga", "gha", "ka", "ng"], ["ग", "घ", "क", "ङ"]),
  ...createCharPair("घ", "gha", "Like 'gh' in 'Ghost'", ["ga", "gha", "ka", "cha"], ["ग", "घ", "क", "च"]),
  ...createCharPair("ङ", "nga", "Nasal 'ng'", ["nga", "ka", "cha", "ja"], ["ङ", "क", "च", "छ"]),
  ...createCharPair("च", "cha", "Like 'ch' in 'Chat'", ["cha", "chha", "ja", "ka"], ["च", "छ", "ज", "क"]),
];

const consonantsL5 = [ // chh, j, jh, nya, T, Th
  ...createCharPair("छ", "chha", "Strong 'chh'", ["cha", "chha", "ja", "jha"], ["च", "छ", "ज", "झ"]),
  ...createCharPair("ज", "ja", "Like 'j' in 'Jar'", ["ja", "jha", "cha", "nya"], ["ज", "झ", "च", "ञ"]),
  ...createCharPair("झ", "jha", "Aspirated 'jh'", ["ja", "jha", "ka", "ga"], ["ज", "झ", "क", "ग"]),
  ...createCharPair("ञ", "nya", "Nasal 'nya'", ["nya", "ja", "na", "ma"], ["ञ", "ज", "न", "म"]),
  ...createCharPair("ट", "Ta", "Retroflex 'T'", ["Ta", "Tha", "Da", "ta"], ["ट", "ठ", "ड", "त"]),
  ...createCharPair("ठ", "Tha", "Retroflex 'Th'", ["Ta", "Tha", "Da", "Dha"], ["ट", "ठ", "ड", "ढ"]),
];

const consonantsL6 = [ // D, Dh, N, t, th, d
  ...createCharPair("ड", "Da", "Retroflex 'D'", ["Da", "Dha", "da", "dha"], ["ड", "ढ", "द", "ध"]),
  ...createCharPair("ढ", "Dha", "Retroflex 'Dh'", ["Da", "Dha", "Na", "na"], ["ड", "ढ", "ण", "न"]),
  ...createCharPair("ण", "Na", "Retroflex 'N'", ["Na", "ma", "na", "nga"], ["ण", "म", "न", "ङ"]),
  ...createCharPair("त", "ta", "Soft 't' (pasta)", ["ta", "tha", "da", "Ta"], ["त", "थ", "द", "ट"]),
  ...createCharPair("थ", "tha", "Soft 'th' (thanks)", ["ta", "tha", "da", "dha"], ["त", "थ", "द", "ध"]),
  ...createCharPair("द", "da", "Soft 'd' (the)", ["da", "dha", "ta", "Da"], ["द", "ध", "त", "ड"]),
];

const consonantsL7 = [ // dh, n, p, ph, b, bh
  ...createCharPair("ध", "dha", "Soft 'dh'", ["da", "dha", "na", "Dha"], ["द", "ध", "न", "ढ"]),
  ...createCharPair("न", "na", "Like 'n' in 'No'", ["na", "ma", "pa", "la"], ["न", "m", "प", "ल"]),
  ...createCharPair("प", "pa", "Like 'p' in 'Spin'", ["pa", "pha", "ba", "ma"], ["प", "फ", "ब", "म"]),
  ...createCharPair("फ", "pha", "Like 'ph' in 'Phone'", ["pa", "pha", "ba", "bha"], ["प", "फ", "ब", "भ"]),
  ...createCharPair("ब", "ba", "Like 'b' in 'Bat'", ["ba", "bha", "pa", "va"], ["ब", "भ", "प", "व"]),
  ...createCharPair("भ", "bha", "Aspirated 'bh'", ["ba", "bha", "ma", "pa"], ["ब", "भ", "म", "प"]),
];

const consonantsL8 = [ // m, y, r, l, v, sh
  ...createCharPair("म", "ma", "Like 'm' in 'Man'", ["ma", "na", "ba", "pa"], ["म", "न", "ब", "प"]),
  ...createCharPair("य", "ya", "Like 'y' in 'Yes'", ["ya", "ra", "la", "va"], ["य", "र", "ल", "व"]),
  ...createCharPair("र", "ra", "Like 'r' in 'Run'", ["ra", "la", "ya", "va"], ["र", "ल", "य", "व"]),
  ...createCharPair("ल", "la", "Like 'l' in 'Love'", ["la", "ra", "ya", "va"], ["ल", "र", "य", "व"]),
  ...createCharPair("व", "va", "Like 'v' in 'Very'", ["va", "ba", "la", "ya"], ["व", "ब", "ल", "य"]),
  ...createCharPair("श", "sha", "Soft 'sh' (Ship)", ["sha", "shha", "sa", "ha"], ["श", "ष", "स", "ह"]),
];

const consonantsL9 = [ // shh, s, h, ksh, tra, gya
  ...createCharPair("ष", "shha", "Retroflex 'sh'", ["shha", "sha", "sa", "ha"], ["ष", "श", "स", "ह"]),
  ...createCharPair("स", "sa", "Like 's' in 'Sun'", ["sa", "sha", "shha", "ha"], ["स", "श", "ष", "ह"]),
  ...createCharPair("ह", "ha", "Like 'h' in 'Home'", ["ha", "sa", "sha", "ka"], ["ह", "स", "श", "क"]),
  ...createCharPair("क्ष", "ksha", "Conjunct k+sh", ["ksha", "tra", "gya", "ka"], ["क्ष", "त्र", "ज्ञ", "क"]),
  ...createCharPair("त्र", "tra", "Conjunct t+r", ["tra", "ksha", "gya", "ta"], ["त्र", "क्ष", "ज्ञ", "त"]),
  ...createCharPair("ज्ञ", "gya", "Conjunct g+y", ["gya", "tra", "ksha", "ga"], ["ज्ञ", "त्र", "क्ष", "ग"]),
];

// --- LESSON DATABASE MAP ---
const lessonDatabase = {
  1: { title: "Vowels Part 1", slides: vowelsPart1 },
  2: { title: "Vowels Part 2", slides: vowelsPart2 },
  3: { title: "Recap: Vowels", slides: [...vowelsPart1, ...vowelsPart2].sort(() => 0.5 - Math.random()).slice(0, 15) }, // Random mix
  4: { title: "Consonants 1", slides: consonantsL4 },
  5: { title: "Consonants 2", slides: consonantsL5 },
  6: { title: "Consonants 3", slides: consonantsL6 },
  7: { title: "Consonants 4", slides: consonantsL7 },
  8: { title: "Consonants 5", slides: consonantsL8 },
  9: { title: "Consonants 6", slides: consonantsL9 },
  10: {
    title: "Grand Review",
    slides: [
      ...vowelsPart1, ...vowelsPart2,
      ...consonantsL4, ...consonantsL5, ...consonantsL6,
      ...consonantsL7, ...consonantsL8, ...consonantsL9
    ].sort(() => 0.5 - Math.random()).slice(0, 20) // Random 20 questions
  }
};

const LearningScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const lessonId = location.state?.lessonId || 1;
  const initialLessonData = lessonDatabase[lessonId] || lessonDatabase[1];

  const [activeSlides, setActiveSlides] = useState(initialLessonData.slides);
  const [originalCount] = useState(initialLessonData.slides.length);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mistakeQueue, setMistakeQueue] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    if (currentSlideIndex >= originalCount) {
      setProgress(95);
    } else {
      setProgress(((currentSlideIndex) / originalCount) * 100);
    }
  }, [currentSlideIndex, originalCount]);

  const playAudio = (text) => {
    // Check Sound Preference
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const soundEnabled = user.preferences?.soundEffects ?? false; // Default off if not set? Or check logic.
    // The user initialized preferences in Settings to: soundEffects: false.
    // So by default sound is OFF? That seems wrong for a language app.
    // But let's respect the preference.
    if (!soundEnabled) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const slide = activeSlides[currentSlideIndex];
    if (slide && slide.audioText) {
      setTimeout(() => playAudio(slide.audioText), 600);
    }
  }, [currentSlideIndex, activeSlides]);

  const handleQuizAnswer = (option) => {
    if (isCorrect !== null) return;

    const currentSlide = activeSlides[currentSlideIndex];

    // Feature: Play audio when clicking Hindi options (Char Select mode)
    if (currentSlide.subtype === 'char_select') {
      playAudio(option);
    }

    setSelectedOption(option);

    if (option === currentSlide.answer) {
      setIsCorrect(true);
      // Audio removed on success to prevent double playback
    } else {
      setIsCorrect(false);
      setMistakeQueue((prev) => [...prev, { ...currentSlide, isReview: true }]);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);

    if (currentSlideIndex < activeSlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      if (mistakeQueue.length > 0) {
        setIsReviewMode(true);
        setActiveSlides(prev => [...prev, ...mistakeQueue]);
        setMistakeQueue([]);
        setCurrentSlideIndex(prev => prev + 1);
      } else {
        const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
          localStorage.setItem('completedLessons', JSON.stringify(completedLessons));

          // Sync with backend
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.email) {
            axios.put('http://localhost:5000/api/auth/update-progress', {
              email: user.email,
              completedLessons
            }).catch(err => console.error("Failed to sync progress", err));
          }
        }

        setProgress(100);
        setShowSuccess(true);
      }
    }
  }


  if (showSuccess) {
    return (
      <div className="learning-container success-screen">
        <div className="success-content">
          <Award size={80} color="#fbbf24" className="bounce-anim" />
          <h1>Lesson Complete!</h1>
          <p>You mastered this lesson!</p>
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
      <div className="learning-header">
        <button className="close-btn" onClick={() => navigate('/lessons')}><X size={24} /></button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: isReviewMode ? '#f59e0b' : '#58cc02' }}></div>
        </div>
        {isReviewMode && <div className="review-badge fade-in"><RefreshCw size={16} /> Reviewing</div>}
      </div>

      <div className="slide-content">
        {slide.isReview ? (
          <div className="badge-container fade-in text-center mb-10">
            <span className="badge-new" style={{ background: '#f59e0b' }}>Previous Mistake</span>
          </div>
        ) : slide.badge && (
          <div className="badge-container fade-in text-center mb-10">
            <span className="badge-new"><Zap size={14} fill="currentColor" /> {slide.badge}</span>
          </div>
        )}

        <h2 className="quiz-question">{slide.question}</h2>

        {(slide.subtype === 'intro' || slide.subtype === 'audio_match') && (
          <div className="card-container text-center fade-in">
            <div className="card-display" onClick={() => playAudio(slide.audioText)} style={{ cursor: 'pointer' }}>
              <h1 className="hindi-large">{slide.mainChar}</h1>
              <div className="pronunciation">
                <button className="audio-btn-circle" onClick={(e) => { e.stopPropagation(); playAudio(slide.audioText); }}>
                  <Volume2 size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`options-grid fade-in ${slide.subtype === 'char_select' ? 'grid-cols-3' : 'grid-cols-2'}`} style={{ marginTop: '30px' }}>
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
          {currentSlideIndex === activeSlides.length - 1 && mistakeQueue.length === 0 ? 'Finish' : (isCorrect === false ? 'Got it' : 'Next')}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default LearningScreen;